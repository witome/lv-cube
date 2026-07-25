import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('消息通知')
@Controller('message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('list')
  @ApiOperation({ summary: '消息列表' })
  findByUser(@Request() req: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.messageService.findByUser(req.user.id, Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('unread')
  @ApiOperation({ summary: '未读数' })
  getUnreadCount(@Request() req: any) {
    return this.messageService.getUnreadCount(req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记单条已读' })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.messageService.markAsRead(req.user.id, Number(id));
  }

  @Post('read-all')
  @ApiOperation({ summary: '全部已读' })
  markAllRead(@Request() req: any) {
    return this.messageService.markAllRead(req.user.id);
  }
}
