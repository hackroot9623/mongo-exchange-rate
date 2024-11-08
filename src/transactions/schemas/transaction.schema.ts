import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TransactionType } from '../../transaction-types/schemas/transaction-type.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  transactionCode: string;

  @Prop({ required: true })
  fromCurrency: string;

  @Prop({ required: true })
  toCurrency: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  amountConverted: number;

  @Prop({ required: true, type: Number })
  exchangeRate: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TransactionType', required: true })
  transactionType: TransactionType;

  @Prop({ required: true })
  userId: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);