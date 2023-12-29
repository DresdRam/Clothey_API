import { ProductInventory } from "src/model/product_inventory/entity/product_category.entity";
import { Promotion } from "src/model/promotion/entity/promotion.entity";
import { ShoppingCartItem } from "src/model/shopping_cart_item/entity/shopping_cart_item.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    name: string;

    @Column({
        nullable: false
    })
    description: string;

    @Column({
        nullable: false
    })
    main_image: string;

    @Column({
        nullable: false
    })
    secondary_images: string;

    @OneToOne(() => ProductInventory, inventory => inventory.product)
    @JoinColumn({ name: 'inventory_id' })
    inventory: ProductInventory;

    @ManyToMany(() => ShoppingCartItem, cart => cart.products)
    cart_items: ShoppingCartItem[];

    @OneToOne(() => Promotion, promotion => promotion.product)
    promotion: Promotion;

}