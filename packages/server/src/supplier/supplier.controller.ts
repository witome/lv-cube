import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('供应商分类授权')
@Controller('supplier')
export class SupplierCategoryController {
  constructor(private prisma: PrismaService) {}

  @Get('my-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 获取本人授权分类ID列表' })
  async getMyCategories(@Request() req: any) {
    const profile = await this.prisma.supplierProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return [];
    const list = await this.prisma.supplierCategory.findMany({
      where: { supplierId: profile.id },
      select: { categoryId: true },
    });
    return list.map(x => x.categoryId);
  }

  @Get(':id/categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[管理员] 获取供应商已授权分类' })
  async getCategories(@Param('id') id: string) {
    const list = await this.prisma.supplierCategory.findMany({
      where: { supplierId: Number(id) },
      select: { categoryId: true },
    });
    return list.map(x => x.categoryId);
  }

  @Put(':id/categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[管理员] 设置供应商授权分类' })
  async setCategories(@Param('id') id: string, @Body() body: { categoryIds: number[] }) {
    const supplierId = Number(id);
    await this.prisma.$transaction(async (prisma) => {
      await prisma.supplierCategory.deleteMany({ where: { supplierId } });
      if (body.categoryIds?.length) {
        await prisma.supplierCategory.createMany({
          data: body.categoryIds.map(categoryId => ({ supplierId, categoryId })),
        });
      }
    });
    return { success: true };
  }
}
