import { Entity, PrimaryKey, Column } from '@romatech/orm';

@Entity('Products')
export class Product {

    @PrimaryKey()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    price!: number;

    @Column()
    stock!: number;
}
