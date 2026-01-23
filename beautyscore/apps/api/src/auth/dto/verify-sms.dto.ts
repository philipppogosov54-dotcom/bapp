import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifySmsDto {
  @IsNotEmpty({ message: 'ID кода обязателен' })
  @IsString()
  codeId: string;

  @IsNotEmpty({ message: 'Код подтверждения обязателен' })
  @IsString()
  @Length(6, 6, { message: 'Код должен состоять из 6 цифр' })
  code: string;
}
