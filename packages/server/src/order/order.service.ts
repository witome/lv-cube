import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageService } from '../message/message.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService,
  ) {}

  async create(buyerId: number, dto: CreateOrderDto) {
    const address = await this.prisma.address.findUnique({ where: { id: dto.addressId } });
    if (!address || address.userId !== buyerId) throw new BadRequestException('收货地址不存在');

    const products: any[] = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const sku = await this.prisma.productSku.findUnique({
        where: { id: item.skuId },
        include: { product: true },
      });
      if (!sku) throw new BadRequestException(`SKU ${item.skuId} 不存在`);
      if (sku.product.status !== 'up') throw new BadRequestException(`商品 ${sku.product.name} 已下架`);
      if (sku.stock < item.quantity) throw new BadRequestException(`${sku.product.name} 库存不足`);
      products.push({ sku, quantity: item.quantity, product: sku.product });
      totalAmount += Number(sku.price) * item.quantity;
    }

    const supplierIds = [...new Set(products.map((p) => p.product.supplierId))];
    const addressSnapshot = JSON.stringify({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      latitude: address.latitude,
      longitude: address.longitude,
    });

    const orders: any[] = [];
    for (const supplierId of supplierIds) {
      const supplierItems = products.filter((p) => p.product.supplierId === supplierId);
      const supplierAmount = supplierItems.reduce((sum, p) => sum + Number(p.sku.price) * p.quantity, 0);

      const orderNo = `LV${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const deliveryFee = supplierAmount >= 99 ? 0 : 5;

      const order = await this.prisma.order.create({
        data: {
          orderNo,
          buyerId,
          supplierId,
          status: 'pending_accept',
          addressSnapshot,
          deliveryType: dto.deliveryTimeType,
          deliveryTimeSlot: dto.scheduledTime,
          deliveryFee,
          goodsAmount: supplierAmount,
          totalAmount: supplierAmount,
          payAmount: supplierAmount + deliveryFee,
          remark: dto.remark,
          items: {
            create: supplierItems.map((p) => ({
              productId: p.product.id,
              skuId: p.sku.id,
              productSnapshot: JSON.stringify({
                productName: p.product.name,
                skuName: p.sku.skuName,
                specValues: p.sku.specValues,
                mainImages: p.product.mainImages,
              }),
              price: p.sku.price,
              quantity: p.quantity,
              subtotal: Number(p.sku.price) * p.quantity,
            })),
          },
        },
        include: { items: true },
      });
      orders.push(order);

      for (const item of supplierItems) {
        await this.prisma.productSku.update({
          where: { id: item.sku.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await this.prisma.cartItem.deleteMany({
      where: { userId: buyerId, productId: { in: products.map((p) => p.product.id) } },
    });

    return orders;
  }

  async findByBuyer(buyerId: number, query: QueryOrderDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const { status } = query;
    const skip = (page - 1) * pageSize;
    const where: any = { buyerId };
    if (status) where.status = status;
    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: { items: true, supplier: { select: { nickname: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findBySupplier(supplierId: number, query: QueryOrderDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const { status } = query;
    const skip = (page - 1) * pageSize;
    const where: any = { supplierId };
    if (status) where.status = status;
    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: { items: true, buyer: { select: { nickname: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findAll(params: any) {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 20;
    const { status, orderNo } = params;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.status = status;
    if (orderNo) where.orderNo = { contains: orderNo };
    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          items: true,
          buyer: { select: { nickname: true, phone: true } },
          supplier: { select: { nickname: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findOne(userId: number, id: number, roles?: string[]) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        supplier: { select: { nickname: true, phone: true } },
        buyer: { select: { nickname: true, phone: true } },
      },
    });
    if (!order) throw new BadRequestException('订单不存在');
    const isAdmin = roles?.includes('admin');
    if (!isAdmin && order.buyerId !== userId && order.supplierId !== userId) {
      throw new ForbiddenException('无权查看');
    }
    return order;
  }

  async acceptOrder(supplierId: number, id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.supplierId !== supplierId) throw new ForbiddenException('无权操作');
    if (order.status !== 'pending_accept') throw new BadRequestException('订单状态不正确');
    return this.prisma.order.update({ where: { id }, data: { status: 'preparing', acceptedAt: new Date() } });
  }

  async rejectOrder(supplierId: number, id: number, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.supplierId !== supplierId) throw new ForbiddenException('无权操作');
    if (order.status !== 'pending_accept') throw new BadRequestException('订单状态不正确');
    const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      await this.prisma.productSku.update({
        where: { id: item.skuId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled', cancelReason: reason },
    });
  }

  async markDelivering(supplierId: number, id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.supplierId !== supplierId) throw new ForbiddenException('无权操作');
    if (order.status !== 'preparing') throw new BadRequestException('订单状态不正确');
    return this.prisma.order.update({ where: { id }, data: { status: 'delivering', deliveredAt: new Date() } });
  }

  async confirmReceive(buyerId: number, id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (order.status !== 'waiting_confirm' && order.status !== 'delivering') {
      throw new BadRequestException('订单状态不正确');
    }
    return this.prisma.order.update({ where: { id }, data: { status: 'completed', completedAt: new Date(), receivedAt: new Date() } });
  }

  async cancelOrder(buyerId: number, id: number, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.buyerId !== buyerId) throw new ForbiddenException('无权操作');
    if (!['pending_accept', 'preparing'].includes(order.status)) {
      throw new BadRequestException('当前状态不可取消');
    }
    const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      await this.prisma.productSku.update({
        where: { id: item.skuId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled', cancelReason: reason },
    });
  }
}
