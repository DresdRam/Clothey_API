import { Module } from '@nestjs/common';
import { ShopOrderService } from './shop_order.service';
import { ShopOrderController } from './shop_order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopOrder } from './entity/shop_order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopOrder])],
  providers: [ShopOrderService],
  controllers: [ShopOrderController]
})
export class ShopOrderModule {}
