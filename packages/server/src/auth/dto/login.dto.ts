import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('CN')
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
