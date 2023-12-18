import { Module } from '@nestjs/common';
import { UserPaymentService } from './user_payment.service';
import { UserPaymentController } from './user_payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPayment } from './entity/userPayment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPayment])],
  providers: [UserPaymentService],
  controllers: [UserPaymentController]
})
export class UserPaymentModule {}
