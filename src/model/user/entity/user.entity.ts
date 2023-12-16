import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

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
    username: string;

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

    // @OneToOne(() => UserRole, (userRole) => userRole.user)
    // @JoinColumn({ name: 'id' })
    // userRole: UserRole;

}