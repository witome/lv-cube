import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProductService } from './product.service';

describe('ProductService supplier ownership', () => {
  const prisma = {
    supplierProfile: { findUnique: jest.fn() },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productSku: { deleteMany: jest.fn() },
    $transaction: jest.fn(async (callback: (client: any) => unknown) => callback(prisma)),
  } as any;

  let service: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductService(prisma);
  });

  it('creates a product with the supplier profile id instead of the user id', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 17, userId: 3, auditStatus: 'approved' });
    prisma.product.create.mockResolvedValue({ id: 1 });

    await service.create(3, {
      categoryId: 2,
      name: '青菜',
      mainImages: ['/uploads/green.jpg'],
      attrValues: {},
      skus: [{ skuName: '一斤', price: 5, stock: 10 }],
    });

    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ supplierId: 17 }),
      }),
    );
  });

  it('allows an approved supplier to update a product owned by its profile', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 17, userId: 3, auditStatus: 'approved' });
    prisma.product.findUnique.mockResolvedValue({ id: 8, supplierId: 17, skus: [] });
    prisma.product.update.mockResolvedValue({ id: 8 });

    await expect(service.update(3, 8, { name: '新名称' })).resolves.toEqual({ id: 8 });
  });

  it('rejects product operations when the supplier profile is not approved', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 17, userId: 3, auditStatus: 'pending' });

    await expect(service.update(3, 8, { name: '新名称' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a missing supplier profile with a clear business error', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue(null);

    await expect(service.create(3, {
      categoryId: 2,
      name: '青菜',
      mainImages: [],
      skus: [{ skuName: '一斤', price: 5, stock: 10 }],
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});

