import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto, SkuDto } from './create-product.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['skus'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuDto)
  skus?: SkuDto[];
}
