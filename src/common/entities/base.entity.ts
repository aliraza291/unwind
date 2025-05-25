import { IsOptional } from 'class-validator';
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

export default abstract class Model extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsOptional()
  id?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date) => value,
    },
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    transformer: {
      from: (value: string) => new Date(value),
      to: (value: Date) => value,
    },
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
    transformer: {
      from: (value: string) => (value ? new Date(value) : null),
      to: (value: Date) => value,
    },
  })
  deletedAt: Date;
}
