import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AddressModule } from './address/address.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { SettlementModule } from './settlement/settlement.module';
import { DeliveryModule } from './delivery/delivery.module';
import { RefundModule } from './refund/refund.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AddressModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    PaymentModule,
    SettlementModule,
    DeliveryModule,
    RefundModule,
    MessageModule,
  ],
})
export class AppModule {}
