import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';

@Injectable()
export class ProductService {

    constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) { }

    async findOne(product_id: number) {
        const product = await this.repo.createQueryBuilder('p')
            .select()
            .innerJoinAndSelect('p.inventory', 'i', 'p.inventory_id = i.id')
            .innerJoinAndSelect('i.category', 'c', 'i.category_id = c.id')
            .innerJoinAndSelect('i.type', 't', 'i.type_id = t.id')
            .where('p.id = :product_id', { product_id: product_id })
            .getOne()

        if (!product) {
            throw new HttpException("There is no product with that id!", HttpStatus.NOT_FOUND)
        }

        return this.reformatSecondaryImages(product);
    }

    async search(search_query: string) {

        const formatted_query = search_query.replace(' ', '%');

        const products = await this.repo.createQueryBuilder('p')
            .select([
                'p.name',
                'p.main_image',
                'i.price',
                'i.qty_in_stock'
            ])
            .innerJoin('p.inventory', 'i', 'p.inventory_id = i.id')
            .innerJoinAndSelect('i.category', 'c', 'i.category_id = c.id')
            .innerJoinAndSelect('i.type', 't', 'i.type_id = t.id')
            .where('p.name LIKE :name', { name: `%${formatted_query}%` })
            .getMany();

        if (!products || products.length == 0) {
            throw new HttpException("There is no products with that search query!", HttpStatus.NOT_FOUND)
        }

        return products;
    }

    reformatSecondaryImages(product: Product) {
        const secondary_images: string[] = product.secondary_images.split('||');
        const string_product = JSON.stringify(product);
        const json_product = JSON.parse(string_product);
        json_product.secondary_images = secondary_images;
        return json_product;
    }

}
