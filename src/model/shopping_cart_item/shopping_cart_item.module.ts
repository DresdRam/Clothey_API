import { Module } from '@nestjs/common';
import { ShoppingCartItemController } from './shopping_cart_item.controller';
import { ShoppingCartItemService } from './shopping_cart_item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartItem } from './entity/shopping_cart_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCartItem])],
  controllers: [ShoppingCartItemController],
  providers: [ShoppingCartItemService]
})
export class ShoppingCartItemModule {}
