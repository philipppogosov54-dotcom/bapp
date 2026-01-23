import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;
}
