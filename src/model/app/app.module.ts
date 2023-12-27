import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationMiddleware } from 'src/common/middlewares/authorization.middleware';
import { CategoryTypeModule } from '../category_type/category_type.module';
import { CategoryType } from '../category_type/entity/category_type.entity';
import { GatewayModule } from '../gateway/gateway.module';
import { Governorate } from '../governorate/entity/governorate.entity';
import { GovernorateModule } from '../governorate/governorate.module';
import { PaymentType } from '../payment_type/entity/payment_type.entity';
import { PaymentTypeModule } from '../payment_type/payment_type.module';
import { Product } from '../product/entity/product.entity';
import { ProductModule } from '../product/product.module';
import { ProductCategory } from '../product_category/entity/product_category.entity';
import { ProductCategoryModule } from '../product_category/product_category.module';
import { ProductInventory } from '../product_inventory/entity/product_category.entity';
import { ProductInventoryModule } from '../product_inventory/product_inventory.module';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { UserAddress } from '../user_address/entity/user_address.entity';
import { UserAddressModule } from '../user_address/user_address.module';
import { UserPayment } from '../user_payment/entity/user_payment.entity';
import { UserPaymentModule } from '../user_payment/user_payment.module';
import { UserType } from '../user_type/entity/user_type.entity';
import { UserTypeModule } from '../user_type/user_type.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: config.get<any>('DATABASE_TYPE'),
          host: config.get<string>('DATABASE_HOST'),
          port: Number(config.get('DATABASE_PORT')),
          username: config.get<string>('DATABASE_USERNAME'),
          password: config.get<string>('DATABASE_PASSWORD'),
          database: config.get<string>('DATABASE_NAME'),
          synchronize: false,
          entities: [
            User,
            UserType,
            UserAddress,
            UserPayment,
            PaymentType,
            Governorate,
            CategoryType,
            Product,
            ProductCategory,
            ProductInventory
          ]
        }
      }
    }),
    UserModule,
    UserTypeModule,
    UserAddressModule,
    UserPaymentModule,
    PaymentTypeModule,
    GovernorateModule,
    CategoryTypeModule,
    ProductModule,
    ProductCategoryModule,
    ProductInventoryModule,
    GatewayModule]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes('*')
  }
}
