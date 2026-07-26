import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('订单')
@Controller('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '[买家] 创建订单' })
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(req.user.id, dto);
  }

  @Get('buyer')
  @ApiOperation({ summary: '[买家] 我的订单列表' })
  findByBuyer(@Request() req: any, @Query() query: QueryOrderDto) {
    return this.orderService.findByBuyer(req.user.id, query);
  }

  @Get('supplier')
  @ApiOperation({ summary: '[供应商] 订单列表' })
  findBySupplier(@Request() req: any, @Query() query: QueryOrderDto) {
    return this.orderService.findBySupplier(req.user.id, query);
  }

  @Get('admin/list')
  @ApiOperation({ summary: '[管理员] 订单列表' })
  findAll(@Query() params: any) {
    return this.orderService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.orderService.findOne(req.user.id, Number(id), req.user.roles);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: '[供应商] 接单' })
  accept(@Request() req: any, @Param('id') id: string) {
    return this.orderService.acceptOrder(req.user.id, Number(id));
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '[供应商] 拒单' })
  reject(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.orderService.rejectOrder(req.user.id, Number(id), reason);
  }

  @Patch(':id/ship')
  @ApiOperation({ summary: '[供应商] 标记已发货（配送中）' })
  ship(@Request() req: any, @Param('id') id: string) {
    return this.orderService.markDelivering(req.user.id, Number(id));
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: '[买家] 确认收货' })
  confirm(@Request() req: any, @Param('id') id: string) {
    return this.orderService.confirmReceive(req.user.id, Number(id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '[买家] 取消订单' })
  cancel(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.orderService.cancelOrder(req.user.id, Number(id), reason);
  }
}
