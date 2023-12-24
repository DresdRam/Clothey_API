import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CategoryType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false
    })
    type: string;

}