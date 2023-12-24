import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoryService } from './product_category.service';
import { ProductCategoryController } from './product_category.controller';
import { ProductCategory } from './entity/product_category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategory])],
    providers: [ProductCategoryService],
    controllers: [ProductCategoryController]
})
export class ProductCategoryModule {}
