import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAddressDto) {
    const normalizedDto = {
      ...dto,
      province: dto.province || '',
      city: dto.city || '',
      district: dto.district || '',
    };
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, type: dto.type, isDefault: true },
        data: { isDefault: false },
      });
    }
    const hasAddresses = await this.prisma.address.count({ where: { userId, type: dto.type } });
    return this.prisma.address.create({
      data: { userId, ...normalizedDto, isDefault: dto.isDefault ?? hasAddresses === 0 },
    });
  }

  async findAll(userId: number, type?: string) {
    const where: any = { userId };
    if (type) where.type = type;
    return this.prisma.address.findMany({ where, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) throw new BadRequestException('地址不存在');
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, type: address.type, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(userId: number, id: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) throw new BadRequestException('地址不存在');
    await this.prisma.address.delete({ where: { id } });
    return { success: true };
  }

  async setDefault(userId: number, id: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) throw new BadRequestException('地址不存在');
    await this.prisma.address.updateMany({
      where: { userId, type: address.type, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
    return this.prisma.address.update({ where: { id }, data: { isDefault: true } });
  }
}
