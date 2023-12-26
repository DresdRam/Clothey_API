import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {

    constructor(private readonly service: ProductService) {}

    @Get('get-one')
    getProduct(@Query('id') id: number){
        return this.service.findOne(id);
    }

    @Get('search')
    searchForProducts(@Query('query') name: string){
        return this.service.search(name);
    }

}
