import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';

export class QueryOrderDto {
  @IsOptional()
  @IsEnum(['pending_accept', 'preparing', 'delivering', 'waiting_confirm', 'completed', 'cancelled', 'aftersale'])
  status?: string;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  pageSize?: number;
}
