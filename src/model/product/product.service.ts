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
                'p.id',
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

    
    async getBestSeller() {

        const products = await this.repo.createQueryBuilder('p')
            .select([
                'p.id',
                'p.name',
                'p.main_image',
                'i.price',
                'i.qty_in_stock'
            ])
            .innerJoin('p.inventory', 'i', 'p.inventory_id = i.id')
            .innerJoinAndSelect('i.category', 'c', 'i.category_id = c.id')
            .innerJoinAndSelect('i.type', 't', 'i.type_id = t.id')
            .take(10)
            .getMany();

        if (!products || products.length == 0) {
            throw new HttpException("There is no products available!", HttpStatus.NOT_FOUND)
        }

        return products;
    }


    async filter(filters: any) {
        const query_builder = this.repo.createQueryBuilder('p')
            .innerJoinAndSelect('p.inventory', 'i', 'p.inventory_id = i.id')
            .innerJoinAndSelect('i.category', 'c', 'i.category_id = c.id')
            .innerJoinAndSelect('i.type', 't', 'i.type_id = t.id')

        if (filters.query) {
            const formatted_query = filters.query.replace(' ', '%');
            query_builder.andWhere('p.name LIKE :name', { name: `%${formatted_query}%` })
        }
        if (filters.category_id) {
            query_builder.andWhere('i.category_id = :category_id', { category_id: filters.category_id });
        }
        if (filters.type_id) {
            query_builder.andWhere('i.type_id = :type_id', { type_id: filters.type_id });
        }
        if (filters.maximum_price) {
            query_builder.andWhere('i.price < :maximum_price', { maximum_price: filters.maximum_price });
        }
        if (filters.minimum_price) {
            query_builder.andWhere('i.price > :minimum_price', { minimum_price: filters.minimum_price });
        }
        if (filters.size) {
            query_builder.take(filters.size)
            if (filters.page) {
                query_builder.skip((filters.page - 1) * filters.size);
            }
        } else {
            query_builder.take(20)
            if (filters.page) {
                query_builder.skip((filters.page - 1) * 20);
            }
        }

        const products = await query_builder.getMany();

        console.log(products)

        return this.reformatSecondaryImagesForMany(products);

    }

    async getNewArrivals() {
        const products = await this.repo.createQueryBuilder('p')
            .select([
                'p.id',
                'p.name',
                'p.main_image',
                'i.price',
                'i.qty_in_stock'
            ])
            .innerJoin('p.inventory', 'i', 'p.inventory_id = i.id')
            .innerJoinAndSelect('i.category', 'c', 'i.category_id = c.id')
            .innerJoinAndSelect('i.type', 't', 'i.type_id = t.id')
            .orderBy('p.id', 'DESC')
            .take(8)
            .getMany();

        if (!products || products.length == 0) {
            throw new HttpException("There is no products available!", HttpStatus.NOT_FOUND)
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

    reformatSecondaryImagesForMany(products: Product[]) {

        const reformed_products: any[] = [];

        for (let x = 0; x < products.length; x++) {
            const product = products.at(x);
            const secondary_images: string[] = product.secondary_images.split('||');
            const stringified_product = JSON.stringify(product);
            const json_product = JSON.parse(stringified_product);
            json_product.secondary_images = secondary_images;
            reformed_products.push(json_product);
        }

        return reformed_products;
    }

}
