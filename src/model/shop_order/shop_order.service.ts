import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopOrder } from './entity/shop_order.entity';
import { Repository } from 'typeorm';
import { PlaceOrderDto } from './dto/place-order.dto';

@Injectable()
export class ShopOrderService {
    
    constructor(@InjectRepository(ShopOrder) private readonly repo: Repository<ShopOrder>) { }
    
    // async placeOrder(body: PlaceOrderDto) {
    //     throw new Error('Method not implemented.');
    // }
    
}
