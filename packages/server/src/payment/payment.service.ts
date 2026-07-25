import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PayOrderDto } from './dto/pay-order.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private generateOutTradeNo() {
    return `WX${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  async pay(userId: number, dto: PayOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.buyerId !== userId) throw new BadRequestException('无权支付');
    if (order.status !== 'pending_accept' && order.status !== 'preparing') {
      throw new BadRequestException('订单状态不正确');
    }

    const existing = await this.prisma.payment.findFirst({
      where: { orderId: order.id, payStatus: 'success' },
    });
    if (existing) throw new BadRequestException('订单已支付');

    const outTradeNo = this.generateOutTradeNo();
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: order.payAmount,
        payMethod: 'wechat',
        outTradeNo,
        payStatus: 'pending',
      },
    });

    const mockMode = this.configService.get<string>('nodeEnv') !== 'production' ||
      !this.configService.get<string>('wechatPay.mchId');

    if (mockMode) {
      return this.mockPay(payment.id, order.id);
    }

    return {
      paymentId: payment.id,
      outTradeNo,
      amount: order.payAmount,
      payParams: { appId: '', timeStamp: '', nonceStr: '', package: '', signType: '', paySign: '' },
    };
  }

  async mockPay(paymentId: number, orderId: number) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { payStatus: 'success', paidAt: new Date() },
    });
    return { paymentId, mock: true, message: '模拟支付成功' };
  }

  async handleNotify(body: any) {
    const { outTradeNo, transactionId } = body;
    const payment = await this.prisma.payment.findUnique({ where: { outTradeNo } });
    if (!payment || payment.payStatus === 'success') return { code: 'SUCCESS' };
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { payStatus: 'success', paidAt: new Date(), transactionId },
    });
    return { code: 'SUCCESS' };
  }
}
