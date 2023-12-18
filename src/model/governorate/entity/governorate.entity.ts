import { UserAddress } from "src/model/user_address/entity/userAddress.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Governorate {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    governorate: string;

    @OneToMany(() => UserAddress, address => address.governorate)
    addresses: UserAddress[];
}