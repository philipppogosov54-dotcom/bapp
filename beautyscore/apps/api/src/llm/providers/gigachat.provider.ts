import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmResponse,
} from '../llm.types';
import * as https from 'https';

interface GigaChatToken {
  accessToken: string;
  expiresAt: number;
}

interface GigaChatMessage {
  role: string;
  content: string;
}

interface GigaChatChoice {
  message: GigaChatMessage;
  index: number;
  finish_reason: string;
}

interface GigaChatResponse {
  choices: GigaChatChoice[];
  created: number;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class GigaChatProvider implements LlmProvider {
  readonly name = 'gigachat';
  private readonly logger = new Logger(GigaChatProvider.name);
  private token: GigaChatToken | null = null;

  private readonly authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  private readonly apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1';
  private readonly scope = 'GIGACHAT_API_PERS'; // Personal scope
  private readonly model = 'GigaChat';

  constructor(private readonly config: ConfigService) {}

  /**
   * Check if GigaChat is available (has API key)
   */
  async isAvailable(): Promise<boolean> {
    const apiKey = this.config.get<string>('GIGACHAT_API_KEY');
    if (!apiKey) {
      this.logger.warn('GigaChat API key not configured');
      return false;
    }
    return true;
  }

  /**
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5 min buffer)
    if (this.token && this.token.expiresAt > Date.now() + 300000) {
      return this.token.accessToken;
    }

    const apiKey = this.config.get<string>('GIGACHAT_API_KEY');
    if (!apiKey) {
      throw new Error('GIGACHAT_API_KEY not configured');
    }

    try {
      const response = await this.httpRequest<{ access_token: string; expires_at: number }>(
        this.authUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Basic ${apiKey}`,
            'RqUID': this.generateUUID(),
          },
          body: `scope=${this.scope}`,
        },
      );

      this.token = {
        accessToken: response.access_token,
        expiresAt: response.expires_at,
      };

      this.logger.log('GigaChat token refreshed');
      return this.token.accessToken;
    } catch (error) {
      this.logger.error('Failed to get GigaChat token', error);
      throw error;
    }
  }

  /**
   * Complete chat with GigaChat
   */
  async complete(
    messages: LlmMessage[],
    options: LlmCompletionOptions = {},
  ): Promise<LlmResponse> {
    const token = await this.getAccessToken();

    const payload = {
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: false,
    };

    try {
      const response = await this.httpRequest<GigaChatResponse>(
        `${this.apiUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          timeout: 30000, // 30 seconds
        },
      );

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        provider: 'gigachat',
        usage: response.usage ? {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('GigaChat completion failed', error);
      throw error;
    }
  }

  /**
   * HTTP request helper with rejectUnauthorized: false for Sber certificates
   */
  private httpRequest<T>(
    url: string,
    options: {
      method: string;
      headers: Record<string, string>;
      body?: string;
      timeout?: number;
    },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const req = https.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 443,
          path: urlObj.pathname + urlObj.search,
          method: options.method,
          headers: options.headers,
          rejectUnauthorized: false, // Required for Sber certificates
          timeout: options.timeout || 30000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              if (res.statusCode && res.statusCode >= 400) {
                reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                return;
              }
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Parse error: ${data}`));
            }
          });
        },
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  /**
   * Generate UUID for RqUID header
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
