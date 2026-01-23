import { Controller, Post, Body, Param } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import type { CreateFeedbackDto } from './feedback.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';

/**
 * Feedback Controller
 *
 * User feedback and bug reports
 *
 * Endpoints:
 * - POST /api/feedback - Submit feedback
 * - POST /api/feedback/product/:id - Report product issue
 */
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /api/feedback
   * Submit general feedback (allows anonymous)
   */
  @Public()
  @Post()
  async createFeedback(
    @CurrentUser('id') userId: string | null,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(userId, dto);
  }

  /**
   * POST /api/feedback/product/:id
   * Report product issue (allows anonymous)
   */
  @Public()
  @Post('product/:id')
  async reportProduct(
    @CurrentUser('id') userId: string | null,
    @Param('id') productId: string,
    @Body('type') type: string,
    @Body('description') description: string,
  ) {
    return this.feedbackService.reportProduct(userId, productId, type, description);
  }
}
