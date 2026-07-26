import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RefundService } from './refund.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('售后退款')
@Controller('refund')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RefundController {
  constructor(private refundService: RefundService) {}

  @Post('apply')
  @ApiOperation({ summary: '[买家] 申请退款' })
  apply(@Request() req: any, @Body() body: { orderId: number; reason: string; amount: number }) {
    return this.refundService.applyRefund(req.user.id, body.orderId, body.reason, body.amount);
  }

  @Get('list')
  @ApiOperation({ summary: '[买家] 我的退款列表' })
  findByUser(@Request() req: any, @Query('status') status?: string) {
    return this.refundService.findByUser(req.user.id, status);
  }

  @Get('supplier/list')
  @ApiOperation({ summary: '[供应商] 退款列表' })
  findBySupplier(@Request() req: any, @Query('status') status?: string) {
    return this.refundService.findBySupplier(req.user.id, status);
  }

  @Get('admin/list')
  @ApiOperation({ summary: '[管理员] 退款列表' })
  findAll(@Query() params: any) {
    return this.refundService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: '退款详情' })
  findOne(@Param('id') id: string) {
    return this.refundService.findOne(Number(id));
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '[供应商] 同意退款' })
  approve(@Request() req: any, @Param('id') id: string) {
    return this.refundService.approve(req.user.id, Number(id));
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '[供应商] 拒绝退款' })
  reject(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.refundService.reject(req.user.id, Number(id), reason);
  }
}
