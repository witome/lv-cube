import { IsOptional, IsString, IsNumber, IsInt, IsEnum, IsArray } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsEnum(['up', 'down'])
  status?: string;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(['default', 'sales', 'priceAsc', 'priceDesc'])
  sort?: string;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  pageSize?: number;
}
