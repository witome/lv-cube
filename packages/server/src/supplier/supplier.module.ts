import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupplierCategoryController } from './supplier.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SupplierCategoryController],
})
export class SupplierModule {}
