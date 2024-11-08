import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getStatistics(startDate: Date, endDate: Date) {
    const transactions = await this.transactionModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate('transactionType')
      .exec();

    const totalTransactions = transactions.length;
    
    // Group transactions by type
    const transactionsByType = transactions.reduce((acc, curr) => {
      const typeName = curr.transactionType.name;
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    // Calculate total amount converted by currency
    const totalAmountConvertedByCurrency = transactions.reduce((acc, curr) => {
      acc[curr.toCurrency] = (acc[curr.toCurrency] || 0) + curr.amountConverted;
      return acc;
    }, {});

    // Calculate total and average amount by transaction type
    const totalAmountByTransactionType = {};
    const averageAmountByTransactionType = {};
    
    Object.entries(transactionsByType).forEach(([type, count]) => {
      const typeTransactions = transactions.filter(t => t.transactionType.name === type);
      const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
      totalAmountByTransactionType[type] = total;
      averageAmountByTransactionType[type] = total / Number(count);
    });

    return {
      totalTransactions,
      transactionsByType,
      totalAmountConvertedByCurrency,
      totalAmountByTransactionType,
      averageAmountByTransactionType,
    };
  }
}