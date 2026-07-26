import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApplySupplierDto } from './apply-supplier.dto';

describe('ApplySupplierDto', () => {
  it('allows a supplier application without a business license image', async () => {
    const dto = plainToInstance(ApplySupplierDto, {
      shopName: '测试商户',
      shopDesc: '主营蔬菜',
    });

    const errors = await validate(dto);

    expect(errors.find((error) => error.property === 'businessLicense')).toBeUndefined();
  });
});
