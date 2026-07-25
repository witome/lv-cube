import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCartDto {
  @IsInt()
  productId: number;

  @IsInt()
  skuId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;
}
