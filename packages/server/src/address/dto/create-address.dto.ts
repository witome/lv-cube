import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber, Matches } from 'class-validator';
import { CHINA_MOBILE_PATTERN } from '@lv-cube/shared';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(CHINA_MOBILE_PATTERN, { message: '手机号必须为11位中国大陆手机号' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
