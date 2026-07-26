import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async settleOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'completed') throw new BadRequestException('订单未完成');

    const existing = await this.prisma.settlement.findFirst({ where: { orderId } });
    if (existing) return existing;

    const commissionRate = 0.02;
    const commissionAmount = Math.round(order.totalAmount.toNumber() * commissionRate * 100) / 100;
    const supplierAmount = order.totalAmount.toNumber() - commissionAmount;
    const driverAmount = 0;

    const settlement = await this.prisma.settlement.create({
      data: {
        orderId,
        supplierId: order.supplierId,
        orderAmount: order.totalAmount,
        commissionRate,
        commissionAmount,
        supplierAmount,
        driverAmount,
        status: 'pending',
      },
    });

    await this.ensureUserAccount(order.supplierId);
    await this.prisma.userAccount.update({
      where: { userId: order.supplierId },
      data: { pendingBalance: { increment: supplierAmount } },
    });

    return settlement;
  }

  async ensureUserAccount(userId: number) {
    const existing = await this.prisma.userAccount.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.userAccount.create({
      data: { userId, balance: 0, pendingBalance: 0, frozenAmount: 0 },
    });
  }

  async processScheduledSettlements() {
    const orders = await this.prisma.order.findMany({
      where: { status: 'completed', completedAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    for (const order of orders) {
      const settlement = await this.settleOrder(order.id);
      await this.prisma.settlement.update({
        where: { id: settlement.id },
        data: { status: 'settled', settledAt: new Date() },
      });
      await this.prisma.userAccount.update({
        where: { userId: settlement.supplierId },
        data: {
          pendingBalance: { decrement: settlement.supplierAmount },
          balance: { increment: settlement.supplierAmount },
        },
      });
    }
    return { processed: orders.length };
  }

  async getAccount(userId: number) {
    const account = await this.ensureUserAccount(userId);
    return account;
  }

  async getSettlements(userId: number, role: string, params: any) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (role === 'supplier') where.supplierId = userId;
    if (role === 'driver') where.driverId = userId;
    const [list, total] = await Promise.all([
      this.prisma.settlement.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.settlement.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async withdraw(userId: number, role: string, dto: WithdrawDto) {
    const account = await this.ensureUserAccount(userId);
    if (account.balance.toNumber() < dto.amount) throw new BadRequestException('余额不足');
    if (dto.amount < 50) throw new BadRequestException('最低提现金额 50 元');

    await this.prisma.userAccount.update({
      where: { userId },
      data: { balance: { decrement: dto.amount }, frozenAmount: { increment: dto.amount } },
    });

    return this.prisma.withdraw.create({
      data: {
        userId,
        role,
        amount: dto.amount,
        fee: 0,
        actualAmount: dto.amount,
        status: 'pending',
        withdrawMethod: dto.withdrawMethod || 'wechat',
      },
    });
  }

  async getWithdrawals(userId: number, params: any) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.prisma.withdraw.findMany({ where: { userId }, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.withdraw.count({ where: { userId } }),
    ]);
    return { list, total, page, pageSize };
  }
}
