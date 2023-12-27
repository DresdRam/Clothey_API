import { UserAddress } from "src/model/user_address/entity/user_address.entity";
import { UserPayment } from "src/model/user_payment/entity/user_payment.entity";
import { UserType } from "src/model/user_type/entity/user_type.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, OneToOne, ManyToMany, ManyToOne } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    email: string;

    @Column({
        nullable: false,
    })
    password: string;

    @Column({
        nullable: false,
    })
    first_name: string;

    @Column({
        nullable: false,
    })
    last_name: string;

    @Column({
        nullable: false,
    })
    phone_number: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => UserAddress, address => address.user)
    addresses: UserAddress[];

    @OneToMany(() => UserPayment, payment => payment.user)
    payments: UserPayment[];

    @ManyToOne(() => UserType, user_type => user_type.users)
    @JoinColumn({ name: 'user_type_id' })
    user_type: UserType;

}