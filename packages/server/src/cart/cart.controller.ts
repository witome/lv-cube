import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('购物车')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车列表（按供应商分组）' })
  findAll(@Request() req: any) {
    return this.cartService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '添加购物车' })
  add(@Request() req: any, @Body() dto: AddCartDto) {
    return this.cartService.add(req.user.id, dto);
  }

  @Put(':id/quantity')
  @ApiOperation({ summary: '修改购物车数量' })
  updateQuantity(@Request() req: any, @Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cartService.updateQuantity(req.user.id, Number(id), quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车项' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.cartService.remove(req.user.id, Number(id));
  }

  @Delete()
  @ApiOperation({ summary: '清空购物车（可按供应商）' })
  clear(@Request() req: any, @Query('supplierId') supplierId?: string) {
    return this.cartService.clear(req.user.id, supplierId ? Number(supplierId) : undefined);
  }
}
