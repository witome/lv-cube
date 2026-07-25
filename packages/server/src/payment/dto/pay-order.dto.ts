import { IsInt, IsOptional, IsString } from 'class-validator';

export class PayOrderDto {
  @IsInt()
  orderId: number;

  @IsOptional()
  @IsString()
  openid?: string;
}
