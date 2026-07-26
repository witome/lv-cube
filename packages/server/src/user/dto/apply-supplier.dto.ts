import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApplySupplierDto {
  @IsNotEmpty()
  @IsString()
  shopName: string;

  @IsOptional()
  @IsString()
  shopLogo?: string;

  @IsOptional()
  @IsString()
  shopDesc?: string;

  @IsOptional()
  @IsString()
  businessLicense?: string;

  @IsOptional()
  @IsString()
  foodLicense?: string;
}
