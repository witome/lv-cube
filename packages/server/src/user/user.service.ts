import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplySupplierDto } from './dto/apply-supplier.dto';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async switchRole(userId: number, targetRole: string) {
    const validRoles = ['buyer', 'supplier', 'driver', 'admin'];
    if (!validRoles.includes(targetRole)) throw new BadRequestException('无效角色');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');

    const roles = JSON.parse(user.roles || '["buyer"]');
    if (!roles.includes(targetRole)) {
      const profileMap: Record<string, any> = {
        supplier: await this.prisma.supplierProfile.findUnique({ where: { userId } }),
        driver: await this.prisma.driverProfile.findUnique({ where: { userId } }),
      };
      const profile = profileMap[targetRole];
      if (!profile || profile.auditStatus !== 'approved') {
        throw new ForbiddenException(`未开通${targetRole}角色或审核未通过`);
      }
      roles.push(targetRole);
      await this.prisma.user.update({
        where: { id: userId },
        data: { roles: JSON.stringify(roles) },
      });
    }
    return { currentRole: targetRole, roles };
  }

  async applySupplier(userId: number, dto: ApplySupplierDto) {
    const existing = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (existing && existing.auditStatus === 'pending') {
      throw new BadRequestException('已有申请待审核');
    }
    if (existing && existing.auditStatus === 'approved') {
      throw new BadRequestException('已是供应商');
    }

    return this.prisma.supplierProfile.upsert({
      where: { userId },
      update: { ...dto, auditStatus: 'pending', auditRemark: null, auditAt: null },
      create: { userId, ...dto },
    });
  }

  async applyDriver(userId: number, dto: ApplyDriverDto) {
    const existing = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (existing && existing.auditStatus === 'pending') {
      throw new BadRequestException('已有申请待审核');
    }
    if (existing && existing.auditStatus === 'approved') {
      throw new BadRequestException('已是平台司机');
    }

    return this.prisma.driverProfile.upsert({
      where: { userId },
      update: { ...dto, auditStatus: 'pending', auditRemark: null, auditAt: null },
      create: { userId, ...dto },
    });
  }

  async reviewSupplier(profileId: number, dto: ReviewDto) {
    return this.prisma.supplierProfile.update({
      where: { id: profileId },
      data: {
        auditStatus: dto.approved ? 'approved' : 'rejected',
        auditRemark: dto.remark,
        auditAt: new Date(),
      },
    });
  }

  async reviewDriver(profileId: number, dto: ReviewDto) {
    return this.prisma.driverProfile.update({
      where: { id: profileId },
      data: {
        auditStatus: dto.approved ? 'approved' : 'rejected',
        auditRemark: dto.remark,
        auditAt: new Date(),
      },
    });
  }

  async findAllUsers(params: { page?: number; pageSize?: number; keyword?: string; role?: string }) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const { keyword, role } = params;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (keyword) where.OR = [{ phone: { contains: keyword } }, { nickname: { contains: keyword } }];
    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: { supplier: true, driver: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    const filteredList = role
      ? list.filter((u: any) => {
          const roles = JSON.parse(u.roles || '["buyer"]');
          return roles.includes(role);
        })
      : list;
    return { list: filteredList, total: role ? filteredList.length : total, page, pageSize };
  }

  async findPendingSuppliers() {
    return this.prisma.supplierProfile.findMany({
      where: { auditStatus: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findPendingDrivers() {
    return this.prisma.driverProfile.findMany({
      where: { auditStatus: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(id: number, status: string) {
    if (!['active', 'disabled'].includes(status)) throw new BadRequestException('无效状态');
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  async updateRoles(id: number, roles: string[]) {
    const validRoles = ['buyer', 'supplier', 'driver', 'admin'];
    for (const r of roles) {
      if (!validRoles.includes(r)) throw new BadRequestException(`无效角色: ${r}`);
    }
    return this.prisma.user.update({ where: { id }, data: { roles: JSON.stringify(roles) } });
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async createUser(dto: any) {
    const { phone, nickname, password, roles } = dto;
    if (!phone || !nickname) throw new BadRequestException('手机号和昵称必填');
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) throw new BadRequestException('手机号已存在');
    const userRoles = roles?.length ? roles : ['buyer'];
    const passwordHash = password ? this.hashPassword(password) : null;
    return this.prisma.user.create({
      data: {
        phone,
        nickname,
        passwordHash,
        roles: JSON.stringify(userRoles),
      },
    });
  }

  private hashPassword(password: string): string {
    return Buffer.from(password).toString('base64');
  }
}
