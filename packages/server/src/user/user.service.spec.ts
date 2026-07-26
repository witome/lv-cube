import { UserService } from './user.service';

describe('UserService role review', () => {
  const prisma = {
    supplierProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    driverProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (callback: (client: any) => unknown) => callback(prisma)),
  } as any;

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(prisma);
  });

  it('adds supplier role when supplier application is approved', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 8, userId: 3 });
    prisma.user.findUnique.mockResolvedValue({ id: 3, roles: '["buyer"]' });
    prisma.supplierProfile.update.mockResolvedValue({ id: 8, userId: 3, auditStatus: 'approved' });

    await service.reviewSupplier(8, { approved: true });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { roles: '["buyer","supplier"]' },
    });
  });

  it('does not add driver role when driver application is rejected', async () => {
    prisma.driverProfile.findUnique.mockResolvedValue({ id: 9, userId: 4 });
    prisma.driverProfile.update.mockResolvedValue({ id: 9, userId: 4, auditStatus: 'rejected' });

    await service.reviewDriver(9, { approved: false, remark: '资料不完整' });

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
