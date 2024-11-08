import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateTransactionDto } from '../src/transactions/dto/create-transaction.dto';

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // For testing purposes, we're using a mock JWT token
    jwtToken = 'mock.jwt.token';
  });

  it('/api/transactions (POST) - should create a transaction', () => {
    const dto: CreateTransactionDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100,
      transactionType: 'mock-type-id',
    };

    return request(app.getHttpServer())
      .post('/api/transactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(201)
      .expect(res => {
        expect(res.body.transactionCode).toMatch(/^T\d{12}\d{4}$/);
        expect(res.body.fromCurrency).toBe(dto.fromCurrency);
        expect(res.body.toCurrency).toBe(dto.toCurrency);
        expect(res.body.amount).toBe(dto.amount);
      });
  });

  it('/api/transactions (POST) - should prevent duplicate transactions', async () => {
    const dto: CreateTransactionDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100,
      transactionType: 'mock-type-id',
    };

    await request(app.getHttpServer())
      .post('/api/transactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(201);

    return request(app.getHttpServer())
      .post('/api/transactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(400)
      .expect(res => {
        expect(res.body.code).toBe('DUPLICATE_TRANSACTION');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});