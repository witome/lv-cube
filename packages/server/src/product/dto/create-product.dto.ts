import { IsString, IsInt, IsOptional, IsArray, IsNumber, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SkuDto {
  @IsString()
  skuName: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsInt()
  stock: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsArray()
  specValues?: string[];
}

export class CreateProductDto {
  @IsInt()
  categoryId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsArray()
  mainImages: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  attrValues?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuDto)
  skus: SkuDto[];

  @IsOptional()
  @IsEnum(['up', 'down'])
  status?: string;
}
