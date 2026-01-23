import { IsOptional, IsEnum, IsString, IsDateString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, SkinType, HairType } from '@prisma/client';

export class OnboardingDto {
  @IsOptional()
  @IsEnum(Gender, { message: 'Выберите корректный пол' })
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректная дата рождения' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(SkinType, { message: 'Выберите корректный тип кожи' })
  skinType?: SkinType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skinProblems?: string[];

  @IsOptional()
  @IsEnum(HairType, { message: 'Выберите корректный тип волос' })
  hairType?: HairType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  onboardingStep?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Выберите корректный пол' })
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректная дата рождения' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(SkinType, { message: 'Выберите корректный тип кожи' })
  skinType?: SkinType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skinProblems?: string[];

  @IsOptional()
  @IsEnum(HairType, { message: 'Выберите корректный тип волос' })
  hairType?: HairType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}
