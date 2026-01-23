import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  @IsString()
  @Matches(/^(\+7|7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/, {
    message: 'Введите корректный российский номер телефона',
  })
  phone: string;
}
