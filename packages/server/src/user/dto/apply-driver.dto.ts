import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class ApplyDriverDto {
  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsNotEmpty()
  @IsString()
  licenseNo: string;

  @IsNotEmpty()
  @IsString()
  vehiclePlate: string;

  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;
}
