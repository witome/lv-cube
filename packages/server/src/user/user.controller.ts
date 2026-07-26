import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, Query, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { ApplySupplierDto } from './dto/apply-supplier.dto';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { ReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('switch-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换角色' })
  switchRole(@Request() req: any, @Body('role') role: string) {
    return this.userService.switchRole(req.user.id, role);
  }

  @Post('apply-supplier')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请成为供应商' })
  applySupplier(@Request() req: any, @Body() dto: ApplySupplierDto) {
    return this.userService.applySupplier(req.user.id, dto);
  }

  @Post('apply-driver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请成为平台司机' })
  applyDriver(@Request() req: any, @Body() dto: ApplyDriverDto) {
    return this.userService.applyDriver(req.user.id, dto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 用户列表' })
  findAll(@Query() query: any) {
    return this.userService.findAllUsers(query);
  }

  @Get('pending-suppliers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 待审核供应商列表' })
  pendingSuppliers() {
    return this.userService.findPendingSuppliers();
  }

  @Get('pending-drivers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 待审核司机列表' })
  pendingDrivers() {
    return this.userService.findPendingDrivers();
  }

  @Patch('review-supplier/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 审核供应商入驻' })
  reviewSupplier(@Param('id') id: string, @Body() dto: ReviewDto) {
    return this.userService.reviewSupplier(Number(id), dto);
  }

  @Patch('review-driver/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 审核司机入驻' })
  reviewDriver(@Param('id') id: string, @Body() dto: ReviewDto) {
    return this.userService.reviewDriver(Number(id), dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 更新用户状态' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.userService.updateStatus(Number(id), status);
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 更新用户角色' })
  updateRoles(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.userService.updateRoles(Number(id), roles);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 删除用户' })
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 创建用户' })
  createUser(@Body() dto: any) {
    return this.userService.createUser(dto);
  }
}
