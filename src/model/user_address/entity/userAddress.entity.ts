import { Governorate } from "src/model/governorate/entity/governorate.entity";
import { User } from "src/model/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserAddress {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    address_line1: string;


    @Column({
        nullable: true
    })
    address_line2: string;


    @Column({
        nullable: false
    })
    postal_code: string;

    @ManyToOne(() => User, user => user.addresses)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Governorate, governorate => governorate.addresses)
    @JoinColumn({ name: 'governorate_id' })
    governorate: Governorate;

}