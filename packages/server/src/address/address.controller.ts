import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('地址')
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取地址列表' })
  findAll(@Request() req: any, @Query('type') type?: string) {
    return this.addressService.findAll(req.user.id, type);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建地址' })
  create(@Request() req: any, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新地址' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(req.user.id, Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除地址' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.addressService.remove(req.user.id, Number(id));
  }

  @Patch(':id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '设为默认地址' })
  setDefault(@Request() req: any, @Param('id') id: string) {
    return this.addressService.setDefault(req.user.id, Number(id));
  }
}
