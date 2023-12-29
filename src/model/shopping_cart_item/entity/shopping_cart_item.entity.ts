import { Product } from "src/model/product/entity/product.entity";
import { ShoppingCart } from "src/model/shopping_cart/entity/shopping_cart.entity";
import { Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ShoppingCartItem {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ShoppingCart, cart => cart.items)
    @JoinColumn({ name: 'cart_id' })
    cart: ShoppingCart;

    @ManyToMany(() => Product, product => product.cart_items)
    @JoinColumn({ name: 'product_id' })
    products: Product[]

}