import { IsString, IsNumber, IsOptional } from 'class-validator';

export class VkTokenDto {
  @IsString()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;
}
