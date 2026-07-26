import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('手机号已注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        nickname: dto.nickname || `用户${dto.phone.slice(-4)}`,
        roles: JSON.stringify(['buyer']),
      },
    });

    return this.generateToken(user.id, user.phone);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('手机号或密码错误');
    if (user.status !== 'active') throw new UnauthorizedException('账号已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('手机号或密码错误');

    return this.generateToken(user.id, user.phone);
  }

  async adminLogin(username: string, password: string) {
    if (username === 'admin' && password === '123456') {
      let admin = await this.prisma.user.findUnique({ where: { phone: 'admin' } });
      if (!admin) {
        const passwordHash = await bcrypt.hash('123456', 10);
        admin = await this.prisma.user.create({
          data: {
            phone: 'admin',
            passwordHash,
            nickname: '平台管理员',
            roles: JSON.stringify(['admin']),
          },
        });
      }
      return this.generateToken(admin.id, admin.phone);
    }
    throw new UnauthorizedException('用户名或密码错误');
  }

  private generateToken(userId: number, phone: string) {
    const payload = { sub: userId, phone };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
