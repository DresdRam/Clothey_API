import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductCategory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    category_name: string;

}