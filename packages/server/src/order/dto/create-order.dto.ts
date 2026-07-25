import { IsString, IsInt, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  skuId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  addressId: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsEnum(['same_day', 'next_day', 'scheduled'])
  deliveryTimeType: string;

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
