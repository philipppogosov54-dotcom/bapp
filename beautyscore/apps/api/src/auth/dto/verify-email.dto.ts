import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  codeId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Код должен содержать 6 цифр' })
  code: string;
}
