import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionTypesService } from './transaction-types.service';
import { TransactionTypesController } from './transaction-types.controller';
import { TransactionType, TransactionTypeSchema } from './schemas/transaction-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionType.name, schema: TransactionTypeSchema },
    ]),
  ],
  controllers: [TransactionTypesController],
  providers: [TransactionTypesService],
  exports: [TransactionTypesService],
})
export class TransactionTypesModule {}