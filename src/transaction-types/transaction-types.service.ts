import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionType, TransactionTypeDocument } from './schemas/transaction-type.schema';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';

@Injectable()
export class TransactionTypesService {
  constructor(
    @InjectModel(TransactionType.name)
    private transactionTypeModel: Model<TransactionTypeDocument>,
  ) {}

  async create(createTransactionTypeDto: CreateTransactionTypeDto): Promise<TransactionType> {
    const normalizedName = this.normalizeName(createTransactionTypeDto.name);
    const exists = await this.transactionTypeModel.findOne({ name: normalizedName });

    if (exists) {
      throw new ConflictException('Transaction type with this name already exists');
    }

    const transactionType = new this.transactionTypeModel({
      ...createTransactionTypeDto,
      name: normalizedName,
    });

    return transactionType.save();
  }

  async findAll(): Promise<TransactionType[]> {
    return this.transactionTypeModel.find().exec();
  }

  async findOne(id: string): Promise<TransactionType> {
    const transactionType = await this.transactionTypeModel.findById(id);

    if (!transactionType) {
      throw new NotFoundException('Transaction type not found');
    }

    return transactionType;
  }

  async update(id: string, updateTransactionTypeDto: UpdateTransactionTypeDto): Promise<TransactionType> {
    if (updateTransactionTypeDto.name) {
      const normalizedName = this.normalizeName(updateTransactionTypeDto.name);
      const exists = await this.transactionTypeModel.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (exists) {
        throw new ConflictException('Transaction type with this name already exists');
      }

      updateTransactionTypeDto.name = normalizedName;
    }

    const updated = await this.transactionTypeModel
      .findByIdAndUpdate(id, updateTransactionTypeDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Transaction type not found');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionTypeModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Transaction type not found');
    }
  }

  private normalizeName(name: string): string {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}