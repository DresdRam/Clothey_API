import { OrderStatus } from "src/model/order_status/entity/order_status.entity";
import { ShippingMethod } from "src/model/shipping_method/entity/shipping_method.entity";
import { User } from "src/model/user/entity/user.entity";
import { UserAddress } from "src/model/user_address/entity/user_address.entity";
import { UserPayment } from "src/model/user_payment/entity/user_payment.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ShopOrder {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    order_date: Date;

    @Column({ nullable: false })
    order_total: number;

    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => UserPayment, payment => payment.orders)
    @JoinColumn({ name: 'payment_method' })
    payment: UserPayment;
    
    @ManyToOne(() => UserAddress, address => address.orders)
    @JoinColumn({ name: 'shipping_address' })
    address: UserAddress;

    @ManyToOne(() => ShippingMethod, shipping => shipping.orders)
    @JoinColumn({ name: 'shipping_method' })
    shipping: ShippingMethod;

    @ManyToOne(() => OrderStatus, status => status.orders)
    @JoinColumn({ name: 'order_status' })
    status: OrderStatus;
}