import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private currenciesService: CurrenciesService,
    private transactionTypesService: TransactionTypesService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    // Check for duplicate transaction
    const twentySecondsAgo = new Date(Date.now() - 20000);
    const recentTransaction = await this.transactionModel.findOne({
      fromCurrency: createTransactionDto.fromCurrency,
      toCurrency: createTransactionDto.toCurrency,
      amount: createTransactionDto.amount,
      userId,
      createdAt: { $gte: twentySecondsAgo },
    });

    if (recentTransaction) {
      throw new BadRequestException({
        code: 'DUPLICATE_TRANSACTION',
        message: 'A similar transaction was already processed within the last 20 seconds. Please try again later.',
      });
    }

    // Validate currencies
    if (!this.currenciesService.isCurrencySupported(createTransactionDto.fromCurrency) ||
        !this.currenciesService.isCurrencySupported(createTransactionDto.toCurrency)) {
      throw new BadRequestException({
        code: 'INVALID_CURRENCY',
        message: 'One or more currencies are not supported.',
      });
    }

    // Get transaction type
    const transactionType = await this.transactionTypesService.findOne(
      createTransactionDto.transactionType,
    );

    // Get exchange rate and convert amount
    const exchangeRate = await this.currenciesService.getExchangeRate(
      createTransactionDto.fromCurrency,
      createTransactionDto.toCurrency,
    );

    const amountConverted = createTransactionDto.amount * exchangeRate;

    // Generate transaction code
    const transactionCode = this.generateTransactionCode();

    const transaction = new this.transactionModel({
      ...createTransactionDto,
      transactionCode,
      amountConverted,
      exchangeRate,
      transactionType,
      userId,
    });

    return transaction.save();
  }

  async findAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
  }): Promise<{ total: number; data: Transaction[] }> {
    const query: any = {};

    if (filters?.startDate && filters?.endDate) {
      query.createdAt = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    if (filters?.transactionType) {
      query.transactionType = filters.transactionType;
    }

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .populate('transactionType')
        .sort({ createdAt: -1 })
        .exec(),
      this.transactionModel.countDocuments(query),
    ]);

    return { total, data: transactions };
  }

  private generateTransactionCode(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `T${year}${month}${day}${hour}${minute}${sequence}`;
  }
}