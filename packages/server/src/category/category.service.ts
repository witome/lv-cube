import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const parent = dto.parentId ? await this.prisma.category.findUnique({ where: { id: dto.parentId } }) : null;
    const level = parent ? parent.level + 1 : 1;
    return this.prisma.category.create({
      data: {
        ...dto,
        level,
        attrTemplate: dto.attrTemplate ? JSON.stringify(dto.attrTemplate) : undefined,
      },
    });
  }

  async findTree() {
    const all = await this.prisma.category.findMany({ orderBy: [{ level: 'asc' }, { sort: 'asc' }] });
    const map = new Map<number, any>();
    all.forEach((c) => {
      const node = {
        ...c,
        attrTemplate: c.attrTemplate ? JSON.parse(c.attrTemplate) : [],
        children: [],
      };
      map.set(c.id, node);
    });
    const roots: any[] = [];
    all.forEach((c) => {
      const node = map.get(c.id);
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async findAll() {
    const list = await this.prisma.category.findMany({ orderBy: [{ level: 'asc' }, { sort: 'asc' }] });
    return list.map((c) => ({ ...c, attrTemplate: c.attrTemplate ? JSON.parse(c.attrTemplate) : [] }));
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new BadRequestException('品类不存在');
    return { ...category, attrTemplate: category.attrTemplate ? JSON.parse(category.attrTemplate) : [] };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new BadRequestException('品类不存在');
    const data: any = { ...dto };
    if (dto.attrTemplate) data.attrTemplate = JSON.stringify(dto.attrTemplate);
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    const hasChildren = await this.prisma.category.count({ where: { parentId: id } });
    if (hasChildren > 0) throw new BadRequestException('该品类下有子品类，无法删除');
    const hasProducts = await this.prisma.product.count({ where: { categoryId: id } });
    if (hasProducts > 0) throw new BadRequestException('该品类下有商品，无法删除');
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
