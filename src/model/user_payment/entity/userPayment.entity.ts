import { PaymentType } from "src/model/payment_type/entity/paymentType.entity";
import { User } from "src/model/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserPayment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    provider: string;


    @Column({
        nullable: false
    })
    account_number: number;

    
    @Column({
        nullable: false
    })
    expiry_date: Date;

    
    @Column({
        nullable: false
    })
    is_default: boolean;

    @ManyToOne(() => User, (user: User) => user.payments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => PaymentType, (type: PaymentType) => type.payments)
    @JoinColumn({ name: 'payment_type_id' })
    payment_type: PaymentType;

}