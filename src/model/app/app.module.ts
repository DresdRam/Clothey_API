import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GovernorateModule } from '../governorate/governorate.module';
import { Governorate } from '../governorate/entity/governorate.entity';
import { UserAddress } from '../user_address/entity/user_address.entity';
import { UserAddressModule } from '../user_address/user_address.module';
import { UserPayment } from '../user_payment/entity/user_payment.entity';
import { PaymentType } from '../payment_type/entity/payment_type.entity';
import { PaymentTypeModule } from '../payment_type/payment_type.module';
import { UserPaymentModule } from '../user_payment/user_payment.module';

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
          type: config.get<any>('TYPE'),
          host: config.get<string>('HOST'),
          port: Number(config.get('PORT')),
          username: config.get<string>('DATABASE_USERNAME'),
          password: config.get<string>('DATABASE_PASSWORD'),
          database: config.get<string>('DATABASE_NAME'),
          synchronize: false,
          entities: [User, UserAddress, UserPayment, PaymentType, Governorate]
        }
      }
    }),
  UserModule, UserAddressModule, UserPaymentModule, PaymentTypeModule, GovernorateModule]
})
export class AppModule { }
