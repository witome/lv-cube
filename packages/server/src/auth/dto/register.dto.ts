import { IsPhoneNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsPhoneNumber('CN')
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
