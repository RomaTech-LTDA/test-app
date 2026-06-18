import { Entity, PrimaryKey, Column } from '@romatech/orm';

@Entity('Users')
export class User {

    @PrimaryKey()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    age!: number;
}
