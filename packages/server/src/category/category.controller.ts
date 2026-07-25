import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('品类')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取品类树' })
  getTree() {
    return this.categoryService.findTree();
  }

  @Get()
  @ApiOperation({ summary: '获取品类列表（扁平）' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取品类详情' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 创建品类' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 更新品类' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[运营] 删除品类' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(Number(id));
  }
}
