import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionTypeDto {
  @ApiProperty({ example: 'Compra' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Transacción de compra de divisas' })
  @IsString()
  @IsOptional()
  description?: string;
}