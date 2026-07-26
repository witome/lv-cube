import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  it('accepts category attributes as an object', async () => {
    const dto = plainToInstance(CreateProductDto, {
      categoryId: 1,
      name: '测试商品',
      mainImages: ['https://example.com/image.jpg'],
      attrValues: { 产地: '广东', 等级: ['一级'] },
      skus: [{ skuName: '默认规格', price: 12.5, stock: 10 }],
    });

    const errors = await validate(dto);

    expect(errors.find((error) => error.property === 'attrValues')).toBeUndefined();
  });
});
