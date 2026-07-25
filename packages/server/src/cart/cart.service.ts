import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartDto } from './dto/add-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async add(userId: number, dto: AddCartDto) {
    const sku = await this.prisma.productSku.findUnique({
      where: { id: dto.skuId },
      include: { product: true },
    });
    if (!sku) throw new BadRequestException('SKU 不存在');
    if (sku.stock < dto.quantity) throw new BadRequestException('库存不足');

    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId: dto.productId, skuId: dto.skuId },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (newQty > sku.stock) throw new BadRequestException('超出库存');
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        supplierId: sku.product.supplierId,
        productId: dto.productId,
        skuId: dto.skuId,
        quantity: dto.quantity,
        price: sku.price,
      },
    });
  }

  async findAll(userId: number) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, mainImages: true, status: true } },
        sku: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<number, any> = {};
    items.forEach((item: any) => {
      const sid = item.supplierId;
      if (!grouped[sid]) grouped[sid] = { supplierId: sid, items: [] };
      grouped[sid].items.push({
        ...item,
        product: {
          ...item.product,
          mainImages: JSON.parse(item.product.mainImages || '[]'),
        },
        sku: {
          ...item.sku,
          specValues: item.sku.specValues ? JSON.parse(item.sku.specValues) : [],
        },
      });
    });
    return Object.values(grouped);
  }

  async updateQuantity(userId: number, id: number, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({ where: { id }, include: { sku: true } });
    if (!item || item.userId !== userId) throw new BadRequestException('购物车项不存在');
    if (quantity <= 0) return this.remove(userId, id);
    if (quantity > item.sku.stock) throw new BadRequestException('超出库存');
    return this.prisma.cartItem.update({ where: { id }, data: { quantity } });
  }

  async remove(userId: number, id: number) {
    const item = await this.prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== userId) throw new BadRequestException('购物车项不存在');
    await this.prisma.cartItem.delete({ where: { id } });
    return { success: true };
  }

  async clear(userId: number, supplierId?: number) {
    const where: any = { userId };
    if (supplierId) where.supplierId = supplierId;
    await this.prisma.cartItem.deleteMany({ where });
    return { success: true };
  }
}
