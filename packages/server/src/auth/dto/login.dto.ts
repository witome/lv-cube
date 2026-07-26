import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { CHINA_MOBILE_PATTERN } from '../../common/validation/phone';

export class LoginDto {
  @Matches(CHINA_MOBILE_PATTERN, { message: '手机号必须为11位中国大陆手机号' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
