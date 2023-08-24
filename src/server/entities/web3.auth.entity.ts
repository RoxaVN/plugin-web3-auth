import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Web3Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  address: string;

  @Column('text')
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;
}
