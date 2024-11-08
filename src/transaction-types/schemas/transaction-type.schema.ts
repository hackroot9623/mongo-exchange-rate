import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionTypeDocument = TransactionType & Document;

@Schema({ timestamps: true })
export class TransactionType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;
}

export const TransactionTypeSchema = SchemaFactory.createForClass(TransactionType);