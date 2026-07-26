import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundService {
  constructor(private prisma: PrismaService) {}

  async applyRefund(buyerId: number, orderId: number, reason: string, amount: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (order.status !== 'completed') throw new BadRequestException('仅已完成订单可申请退款');

    const existing = await this.prisma.refund.findFirst({
      where: { orderId, status: { in: ['pending', 'approved'] } },
    });
    if (existing) throw new BadRequestException('该订单已有退款申请');

    if (amount <= 0) throw new BadRequestException('退款金额必须大于0');
    if (amount > order.payAmount.toNumber()) {
      throw new BadRequestException('退款金额不能超过订单实付金额');
    }

    return this.prisma.refund.create({
      data: {
        orderId,
        buyerId,
        supplierId: order.supplierId,
        reason,
        amount,
        status: 'pending',
      },
    });
  }

  async findByUser(userId: number, status?: string) {
    const where: any = { buyerId: userId };
    if (status) where.status = status;
    return this.prisma.refund.findMany({
      where,
      include: { order: { include: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: { order: { include: { items: true } } },
    });
    if (!refund) throw new BadRequestException('退款申请不存在');
    return refund;
  }

  async approve(userId: number, refundId: number) {
    const refund = await this.prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) throw new BadRequestException('退款申请不存在');
    const profile = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('供应商档案不存在');
    if (refund.supplierId !== profile.id) throw new ForbiddenException('无权操作');
    if (refund.status !== 'pending') throw new BadRequestException('退款申请状态不正确');

    const account = await this.prisma.userAccount.findUnique({
      where: { userId: refund.buyerId },
    });
    if (!account) {
      await this.prisma.userAccount.create({
        data: { userId: refund.buyerId, balance: refund.amount, pendingBalance: 0, frozenAmount: 0 },
      });
    } else {
      await this.prisma.userAccount.update({
        where: { userId: refund.buyerId },
        data: { balance: { increment: refund.amount } },
      });
    }

    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'approved', approvedAt: new Date() },
    });
  }

  async reject(userId: number, refundId: number, reason: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) throw new BadRequestException('退款申请不存在');
    const profile = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('供应商档案不存在');
    if (refund.supplierId !== profile.id) throw new ForbiddenException('无权操作');
    if (refund.status !== 'pending') throw new BadRequestException('退款申请状态不正确');

    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'rejected', rejectedReason: reason, rejectedAt: new Date() },
    });
  }

  async findBySupplier(supplierId: number, status?: string) {
    const where: any = { supplierId };
    if (status) where.status = status;
    return this.prisma.refund.findMany({
      where,
      include: { order: { include: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(params: any) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const { status } = params;
    const where: any = {};
    if (status) where.status = status;
    const [list, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: {
          order: { include: { items: true, buyer: { select: { nickname: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.refund.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }
}
