import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isChinaMobile } from '../common/validation/phone';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  calculateFee(distanceKm: number, totalAmount: number) {
    const baseFee = 5;
    const perKm = 1.5;
    const freeThreshold = 99;
    if (totalAmount >= freeThreshold) return 0;
    return Math.round((baseFee + Math.max(0, distanceKm - 3) * perKm) * 100) / 100;
  }

  async createDelivery(orderId: number, supplierId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.supplierId !== supplierId) throw new ForbiddenException('无权操作');

    const existing = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (existing) return existing;

    const addr = JSON.parse(order.addressSnapshot || '{}');
    const deliveryAddress = `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || ''}`;

    return this.prisma.delivery.create({
      data: {
        orderId,
        supplierId,
        type: 'platform',
        status: 'pending',
        pickupAddress: '供应商仓库地址',
        deliveryAddress,
      },
    });
  }

  async findPool(driverId: number) {
    return this.prisma.delivery.findMany({
      where: { status: 'pending', type: 'platform' },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async acceptDelivery(driverId: number, deliveryId: number) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) throw new BadRequestException('配送任务不存在');
    if (delivery.status !== 'pending') throw new BadRequestException('任务已被接单');

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { driverId, status: 'accepted', acceptedAt: new Date() },
    });
  }

  async markPickedUp(driverId: number, deliveryId: number) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery || delivery.driverId !== driverId) throw new ForbiddenException('无权操作');
    if (delivery.status !== 'accepted') throw new BadRequestException('状态不正确');

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'delivering', shippedAt: new Date() },
    });

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'picked_up', pickedUpAt: new Date() },
    });
  }

  async markDelivered(driverId: number, deliveryId: number) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery || delivery.driverId !== driverId) throw new ForbiddenException('无权操作');
    if (delivery.status !== 'picked_up') throw new BadRequestException('状态不正确');

    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'waiting_confirm' },
    });

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'delivered', deliveredAt: new Date() },
    });
  }

  async findByDriver(driverId: number, status?: string) {
    const where: any = { driverId };
    if (status) where.status = status;
    return this.prisma.delivery.findMany({
      where,
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrder(orderId: number) {
    return this.prisma.delivery.findUnique({
      where: { orderId },
      include: { driver: { include: { user: { select: { nickname: true, phone: true } } } } },
    });
  }

  async assignOwnDriver(supplierId: number, orderId: number, driverId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.supplierId !== supplierId) throw new ForbiddenException('无权操作');

    const ownedDriver = await this.prisma.ownedDriver.findFirst({
      where: { id: driverId, supplierId },
    });
    if (!ownedDriver) throw new BadRequestException('自有司机不存在');

    const addr = JSON.parse(order.addressSnapshot || '{}');
    const deliveryAddress = `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || ''}`;

    return this.prisma.delivery.upsert({
      where: { orderId },
      update: { driverId, type: 'own', status: 'accepted', acceptedAt: new Date() },
      create: {
        orderId,
        supplierId,
        driverId,
        type: 'own',
        status: 'accepted',
        acceptedAt: new Date(),
        pickupAddress: '供应商仓库地址',
        deliveryAddress,
      },
    });
  }

  async manageOwnDrivers(supplierId: number) {
    return this.prisma.ownedDriver.findMany({ where: { supplierId }, orderBy: { createdAt: 'desc' } });
  }

  async addOwnDriver(supplierId: number, data: any) {
    if (!data?.name?.trim()) throw new BadRequestException('司机姓名必填');
    if (!isChinaMobile(data?.phone || '')) {
      throw new BadRequestException('手机号必须为11位中国大陆手机号');
    }
    return this.prisma.ownedDriver.create({ data: { supplierId, ...data } });
  }

  async removeOwnDriver(supplierId: number, driverId: number) {
    const driver = await this.prisma.ownedDriver.findUnique({ where: { id: driverId } });
    if (!driver || driver.supplierId !== supplierId) throw new ForbiddenException('无权操作');
    await this.prisma.ownedDriver.delete({ where: { id: driverId } });
    return { success: true };
  }

  async findAll(params: any) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const { status, type } = params;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    const [list, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        include: {
          order: true,
          driver: { include: { user: { select: { nickname: true, phone: true } } } },
          supplier: { include: { user: { select: { nickname: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.delivery.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }
}
