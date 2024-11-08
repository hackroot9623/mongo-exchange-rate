import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TransactionTypesService } from './transaction-types.service';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Transaction Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/transactions-types')
export class TransactionTypesController {
  constructor(private readonly transactionTypesService: TransactionTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction type' })
  @ApiResponse({ status: 201, description: 'Transaction type created successfully' })
  @ApiResponse({ status: 409, description: 'Transaction type already exists' })
  create(@Body() createTransactionTypeDto: CreateTransactionTypeDto) {
    return this.transactionTypesService.create(createTransactionTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transaction types' })
  findAll() {
    return this.transactionTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction type by id' })
  @ApiResponse({ status: 404, description: 'Transaction type not found' })
  findOne(@Param('id') id: string) {
    return this.transactionTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction type' })
  @ApiResponse({ status: 404, description: 'Transaction type not found' })
  @ApiResponse({ status: 409, description: 'Transaction type name already exists' })
  update(@Param('id') id: string, @Body() updateTransactionTypeDto: UpdateTransactionTypeDto) {
    return this.transactionTypesService.update(id, updateTransactionTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction type' })
  @ApiResponse({ status: 404, description: 'Transaction type not found' })
  remove(@Param('id') id: string) {
    return this.transactionTypesService.remove(id);
  }
}