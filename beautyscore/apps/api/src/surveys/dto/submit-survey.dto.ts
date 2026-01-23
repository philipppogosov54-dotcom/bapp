import { IsObject, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SubmitSurveyDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string | string[]>;

  @IsBoolean()
  @IsOptional()
  isComplete?: boolean; // false = save progress, true = submit
}

export class SaveProgressDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string | string[]>;
}
