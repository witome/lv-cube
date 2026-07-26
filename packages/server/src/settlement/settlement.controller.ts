import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('结算')
@Controller('settlement')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettlementController {
  constructor(private settlementService: SettlementService) {}

  @Get('account')
  @ApiOperation({ summary: '获取我的账户余额' })
  getAccount(@Request() req: any) {
    return this.settlementService.getAccount(req.user.id);
  }

  @Get('list')
  @ApiOperation({ summary: '结算记录' })
  getSettlements(@Request() req: any, @Query() query: any) {
    return this.settlementService.getSettlements(req.user.id, req.user.currentRole || 'supplier', query, req.user.roles);
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现' })
  withdraw(@Request() req: any, @Body() dto: WithdrawDto) {
    return this.settlementService.withdraw(req.user.id, req.user.currentRole || 'supplier', dto);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: '提现记录' })
  getWithdrawals(@Request() req: any, @Query() query: any) {
    return this.settlementService.getWithdrawals(req.user.id, query, req.user.roles);
  }
}
