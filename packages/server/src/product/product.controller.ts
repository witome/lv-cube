import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('商品')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '商品列表（支持搜索筛选）' })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '商品详情' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 创建商品' })
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 更新商品' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(req.user.id, Number(id), dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 上下架商品' })
  updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.productService.updateStatus(req.user.id, Number(id), status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 删除商品' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.productService.remove(req.user.id, Number(id));
  }

  @Patch('sku/:skuId/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[供应商] 调整 SKU 库存' })
  updateSkuStock(@Request() req: any, @Param('skuId') skuId: string, @Body('stock') stock: number) {
    return this.productService.updateSkuStock(req.user.id, Number(skuId), stock);
  }
}
