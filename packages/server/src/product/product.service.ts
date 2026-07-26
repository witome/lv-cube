import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async getApprovedSupplier(userId: number) {
    const supplier = await this.prisma.supplierProfile.findUnique({ where: { userId } });
    if (!supplier) {
      throw new BadRequestException('供应商档案不存在，请先提交入驻申请');
    }
    if (supplier.auditStatus !== 'approved') {
      throw new ForbiddenException('供应商资质未通过审核，无法发布商品');
    }
    return supplier;
  }

  async create(userId: number, dto: CreateProductDto) {
    const supplier = await this.getApprovedSupplier(userId);
    return this.prisma.product.create({
      data: {
        supplierId: supplier.id,
        categoryId: dto.categoryId,
        name: dto.name,
        subtitle: dto.subtitle,
        mainImages: JSON.stringify(dto.mainImages),
        description: dto.description,
        attrValues: dto.attrValues ? JSON.stringify(dto.attrValues) : null,
        status: dto.status || 'down',
        skus: {
          create: dto.skus.map((sku) => ({
            ...sku,
            specValues: sku.specValues ? JSON.stringify(sku.specValues) : undefined,
          })),
        },
      },
      include: { skus: true, category: true },
    });
  }

  async findAll(query: QueryProductDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const { keyword, categoryId, supplierId, status, minPrice, maxPrice, sort } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (keyword) where.name = { contains: keyword };
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.skus = {
        some: {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        },
      };
    }

    const orderBy: any = {};
    switch (sort) {
      case 'sales':
        orderBy.salesCount = 'desc';
        break;
      case 'priceAsc':
        orderBy.skus = { _min: { price: 'asc' } };
        break;
      case 'priceDesc':
        orderBy.skus = { _max: { price: 'desc' } };
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: { skus: true, category: true, supplier: { include: { user: { select: { nickname: true } } } } },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const processed = list.map((p: any) => ({
      ...p,
      mainImages: JSON.parse(p.mainImages || '[]'),
      attrValues: p.attrValues ? JSON.parse(p.attrValues) : {},
      skus: p.skus.map((s: any) => ({
        ...s,
        specValues: s.specValues ? JSON.parse(s.specValues) : [],
      })),
      minPrice: Math.min(...p.skus.map((s: any) => s.price)),
    }));

    return { list: processed, total, page, pageSize };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        skus: true,
        category: true,
        supplier: { include: { user: { select: { nickname: true, phone: true } } } },
      },
    });
    if (!product) throw new BadRequestException('商品不存在');
    return {
      ...product,
      mainImages: JSON.parse(product.mainImages || '[]'),
      attrValues: product.attrValues ? JSON.parse(product.attrValues) : {},
      skus: product.skus.map((s: any) => ({
        ...s,
        specValues: s.specValues ? JSON.parse(s.specValues) : [],
      })),
      minPrice: Math.min(...product.skus.map((s: any) => s.price)),
    };
  }

  async update(userId: number, id: number, dto: UpdateProductDto) {
    const supplier = await this.getApprovedSupplier(userId);
    const product = await this.prisma.product.findUnique({ where: { id }, include: { skus: true } });
    if (!product) throw new BadRequestException('商品不存在');
    if (product.supplierId !== supplier.id) throw new ForbiddenException('无权修改他人商品');

    const data: any = {};
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.subtitle !== undefined) data.subtitle = dto.subtitle;
    if (dto.mainImages !== undefined) data.mainImages = JSON.stringify(dto.mainImages);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.attrValues !== undefined) data.attrValues = JSON.stringify(dto.attrValues);
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.$transaction(async (prisma) => {
      if (dto.skus && dto.skus.length > 0) {
        await prisma.productSku.deleteMany({ where: { productId: id } });
        data.skus = {
          create: dto.skus.map((sku) => ({
            skuName: sku.skuName,
            price: sku.price,
            originalPrice: sku.originalPrice,
            stock: sku.stock,
            weight: sku.weight,
            specValues: sku.specValues ? JSON.stringify(sku.specValues) : undefined,
          })),
        };
      }

      return prisma.product.update({
        where: { id },
        data,
        include: { skus: true, category: true },
      });
    });
  }

  async updateStatus(userId: number, id: number, status: string) {
    const supplier = await this.getApprovedSupplier(userId);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new BadRequestException('商品不存在');
    if (product.supplierId !== supplier.id) throw new ForbiddenException('无权操作他人商品');
    return this.prisma.product.update({ where: { id }, data: { status } });
  }

  async remove(userId: number, id: number) {
    const supplier = await this.getApprovedSupplier(userId);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new BadRequestException('商品不存在');
    if (product.supplierId !== supplier.id) throw new ForbiddenException('无权删除他人商品');
    await this.prisma.productSku.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async updateSkuStock(userId: number, skuId: number, stock: number) {
    const supplier = await this.getApprovedSupplier(userId);
    const sku = await this.prisma.productSku.findUnique({ where: { id: skuId }, include: { product: true } });
    if (!sku) throw new BadRequestException('SKU 不存在');
    if (sku.product.supplierId !== supplier.id) throw new ForbiddenException('无权操作');
    return this.prisma.productSku.update({ where: { id: skuId }, data: { stock } });
  }
}
