import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFeedbackDto {
  type: string;
  message: string;
  screenshot?: string;
}

export interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  ticketId: string;
  createdAt: Date;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /api/feedback - Submit general feedback
   */
  async createFeedback(
    userId: string | null,
    dto: CreateFeedbackDto,
  ): Promise<{ ticketId: string; message: string }> {
    const validTypes = ['bug', 'feature', 'other'];
    if (!validTypes.includes(dto.type)) {
      throw new BadRequestException('Неверный тип обращения');
    }

    if (!dto.message || dto.message.length < 10) {
      throw new BadRequestException('Слишком короткое сообщение');
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        type: dto.type,
        message: dto.message.slice(0, 2000),
        screenshot: dto.screenshot,
      },
    });

    return {
      ticketId: feedback.ticketId,
      message: 'Спасибо за обращение! Мы рассмотрим его в ближайшее время.',
    };
  }

  /**
   * POST /api/feedback/product/:id - Report product issue
   * Note: This is also in products controller, added here for completeness
   */
  async reportProduct(
    userId: string | null,
    productId: string,
    type: string,
    description: string,
  ): Promise<{ ticketId: string }> {
    const validTypes = ['wrong_info', 'missing_info', 'other'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Неверный тип репорта');
    }

    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Продукт не найден');
    }

    const report = await this.prisma.productReport.create({
      data: {
        productId,
        userId,
        type,
        description,
      },
    });

    return { ticketId: report.id };
  }

  /**
   * Get user's feedback history (optional)
   */
  async getUserFeedback(userId: string): Promise<FeedbackItem[]> {
    return this.prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        message: true,
        ticketId: true,
        createdAt: true,
      },
    });
  }
}
