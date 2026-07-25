import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  withdrawMethod?: string;
}
