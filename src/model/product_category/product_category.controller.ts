import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ProductCategoryService } from './product_category.service';

@Controller('product-category')
export class ProductCategoryController {

    constructor(private readonly service: ProductCategoryService) { }

    @Get('get-all')
    getAllCategories() {
        return this.service.findAll();
    }

    @Post('create')
    insertCategory(@Query('category') category: string) {
        return this.service.createOne(category);
    }

    @Delete('delete')
    deleteCategory(@Query('id') category_id: number){
        this.service.deleteOne(category_id);
    }

}
