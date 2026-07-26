import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber, Matches } from 'class-validator';
import { CHINA_MOBILE_PATTERN } from '../../common/validation/phone';

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

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

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
