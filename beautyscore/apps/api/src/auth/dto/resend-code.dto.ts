import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum ResendCodeType {
  EMAIL = 'email',
  PHONE = 'phone',
  PASSWORD_RESET = 'password_reset',
}

export class ResendCodeDto {
  @IsEnum(ResendCodeType)
  @IsNotEmpty()
  type: ResendCodeType;

  @IsString()
  @IsNotEmpty()
  target: string; // email or phone
}
