import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmResponse,
} from '../llm.types';

interface YandexGptMessage {
  role: string;
  text: string;
}

interface YandexGptAlternative {
  message: YandexGptMessage;
  status: string;
}

interface YandexGptResponse {
  result?: {
    alternatives: YandexGptAlternative[];
    usage?: {
      inputTextTokens: string;
      completionTokens: string;
      totalTokens: string;
    };
    modelVersion?: string;
  };
  // Direct format for some models
  alternatives?: YandexGptAlternative[];
}

@Injectable()
export class YandexGptProvider implements LlmProvider {
  readonly name = 'yandexgpt';
  private readonly logger = new Logger(YandexGptProvider.name);

  private readonly apiUrl =
    'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

  constructor(private readonly config: ConfigService) {}

  /**
   * Check if YandexGPT is available
   */
  async isAvailable(): Promise<boolean> {
    const apiKey = this.config.get<string>('YANDEX_GPT_API_KEY');
    const folderId = this.config.get<string>('YANDEX_GPT_FOLDER_ID');

    if (!apiKey || !folderId) {
      this.logger.warn('YandexGPT API key or folder ID not configured');
      return false;
    }
    return true;
  }

  /**
   * Complete chat with YandexGPT
   */
  async complete(
    messages: LlmMessage[],
    options: LlmCompletionOptions = {},
  ): Promise<LlmResponse> {
    const apiKey = this.config.get<string>('YANDEX_GPT_API_KEY');
    const folderId = this.config.get<string>('YANDEX_GPT_FOLDER_ID');

    if (!apiKey || !folderId) {
      throw new Error('YANDEX_GPT_API_KEY or YANDEX_GPT_FOLDER_ID not configured');
    }

    // Model URI format: gpt://<folder_id>/yandexgpt-lite
    const modelUri = `gpt://${folderId}/yandexgpt-lite`;

    const payload = {
      modelUri,
      completionOptions: {
        stream: false,
        temperature: options.temperature ?? 0.7,
        maxTokens: String(options.maxTokens ?? 2000),
      },
      messages: messages.map(m => ({
        role: m.role,
        text: m.content,
      })),
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${apiKey}`,
          'x-folder-id': folderId,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000), // Provider-level timeout (20s, service adds wrapper)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YandexGPT HTTP ${response.status}: ${errorText}`);
      }

      const data: YandexGptResponse = await response.json();

      // Handle both response formats
      const alternatives = data.result?.alternatives || data.alternatives || [];
      const content = alternatives[0]?.message?.text || '';

      const usage = data.result?.usage;

      return {
        content,
        provider: 'yandexgpt',
        usage: usage
          ? {
              inputTokens: parseInt(usage.inputTextTokens, 10) || 0,
              outputTokens: parseInt(usage.completionTokens, 10) || 0,
              totalTokens: parseInt(usage.totalTokens, 10) || 0,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error('YandexGPT completion failed', error);
      throw error;
    }
  }
}
