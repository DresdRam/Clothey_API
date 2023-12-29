import { Body, Controller, Post } from '@nestjs/common';
import { ShopOrderService } from './shop_order.service';
import { PlaceOrderDto } from './dto/place-order.dto';

@Controller('orders')
export class ShopOrderController {

    constructor(private readonly service: ShopOrderService) { }

    // @Post('place-order')
    // placeOrder(@Body() body: PlaceOrderDto){
    //     return this.service.placeOrder(body)
    // }

}
