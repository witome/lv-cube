import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PayOrderDto } from './dto/pay-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('支付')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发起支付' })
  pay(@Request() req: any, @Body() dto: PayOrderDto) {
    return this.paymentService.pay(req.user.id, dto);
  }

  @Post('notify')
  @ApiOperation({ summary: '微信支付回调（内部用）' })
  notify(@Body() body: any) {
    return this.paymentService.handleNotify(body);
  }
}
