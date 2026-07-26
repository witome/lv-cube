import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('配送')
@Controller('delivery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('pool')
  @ApiOperation({ summary: '[司机] 抢单池' })
  getPool(@Request() req: any) {
    return this.deliveryService.findPool(req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: '[司机] 我的配送任务' })
  getMyDeliveries(@Request() req: any, @Query('status') status?: string) {
    return this.deliveryService.findByDriver(req.user.id, status);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '订单配送信息' })
  getByOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.findByOrder(Number(orderId));
  }

  @Post('accept/:id')
  @ApiOperation({ summary: '[司机] 接单' })
  accept(@Request() req: any, @Param('id') id: string) {
    return this.deliveryService.acceptDelivery(req.user.id, Number(id));
  }

  @Patch('pickup/:id')
  @ApiOperation({ summary: '[司机] 已取货' })
  pickup(@Request() req: any, @Param('id') id: string) {
    return this.deliveryService.markPickedUp(req.user.id, Number(id));
  }

  @Patch('deliver/:id')
  @ApiOperation({ summary: '[司机] 已送达' })
  deliver(@Request() req: any, @Param('id') id: string) {
    return this.deliveryService.markDelivered(req.user.id, Number(id));
  }

  @Get('own-drivers')
  @ApiOperation({ summary: '[供应商] 自有司机列表' })
  getOwnDrivers(@Request() req: any) {
    return this.deliveryService.manageOwnDrivers(req.user.id);
  }

  @Post('own-drivers')
  @ApiOperation({ summary: '[供应商] 添加自有司机' })
  addOwnDriver(@Request() req: any, @Body() data: any) {
    return this.deliveryService.addOwnDriver(req.user.id, data);
  }

  @Delete('own-drivers/:id')
  @ApiOperation({ summary: '[供应商] 删除自有司机' })
  removeOwnDriver(@Request() req: any, @Param('id') id: string) {
    return this.deliveryService.removeOwnDriver(req.user.id, Number(id));
  }

  @Post('assign-own/:orderId')
  @ApiOperation({ summary: '[供应商] 指定自有司机配送' })
  assignOwn(@Request() req: any, @Param('orderId') orderId: string, @Body('driverId') driverId: number) {
    return this.deliveryService.assignOwnDriver(req.user.id, Number(orderId), driverId);
  }

  @Get('admin/list')
  @ApiOperation({ summary: '[管理员] 配送任务列表' })
  findAll(@Query() params: any) {
    return this.deliveryService.findAll(params);
  }
}
