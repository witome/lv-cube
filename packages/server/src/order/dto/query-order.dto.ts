import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @IsOptional()
  @IsEnum(['pending_accept', 'preparing', 'delivering', 'waiting_confirm', 'completed', 'cancelled', 'aftersale'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number;
}
