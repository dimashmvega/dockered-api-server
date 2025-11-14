import { Entity, PrimaryColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  sku: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  brand: string;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'integer' })
  stock: number;

  @Column({ type: 'varchar', unique: true })
  contentfulId: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date | null;

  @Column({ type: 'jsonb' })
  systemMetadata: any;
}
