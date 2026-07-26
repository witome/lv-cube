import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin-login')
  @ApiOperation({ summary: '管理员登录' })
  adminLogin(@Body('username') username: string, @Body('password') password: string) {
    return this.authService.adminLogin(username, password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  profile(@Request() req: any) {
    const { passwordHash, ...user } = req.user;
    return user;
  }
}
