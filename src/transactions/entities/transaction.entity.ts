import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column()
  transactionCode: string;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column('decimal', { precision: 20, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 2 })
  amountConverted: number;

  @Column('decimal', { precision: 10, scale: 6 })
  exchangeRate: number;

  @ManyToOne(() => TransactionType, { eager: true })
  transactionType: TransactionType;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}