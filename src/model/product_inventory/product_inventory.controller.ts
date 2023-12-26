import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Put, Query } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create_inventory.dto';
import { ProductInventoryService } from './product_inventory.service';
import { UpdateInventoryDto } from './dto/update_inventory.dto';

@Controller('product-inventory')
export class ProductInventoryController {

    constructor(private readonly service: ProductInventoryService) {}

    @Post('create')
    createProductInventory(@Body() body: CreateInventoryDto) {
        return this.service.createOne(body);
    }
    
    @Get('get-one')
    getProductInventory(@Query('inventory_id') id: number) {

        if(!id) {
            throw new HttpException("You didn't provide an inventory id.", HttpStatus.BAD_REQUEST)
        }

        return this.service.findOne(id);
    }
    
    @Put('update')
    updateProductInventory(@Body() body: UpdateInventoryDto) {
        return this.service.update(body);
    }

    @Delete('delete')
    deleteProductInventory(@Query('inventory_id') id: number) {

        if(!id) {
            throw new HttpException("You didn't provide an inventory id.", HttpStatus.BAD_REQUEST)
        }

        return this.service.delete(id);
    }

}
