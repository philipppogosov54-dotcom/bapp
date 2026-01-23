import { IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  codeId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Код должен содержать 6 цифр' })
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  newPassword: string;
}
