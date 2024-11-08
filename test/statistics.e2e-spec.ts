import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Statistics (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtToken = 'mock.jwt.token';
  });

  it('/api/statistics (GET) - should return statistics', () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    const endDate = new Date();

    return request(app.getHttpServer())
      .get('/api/statistics')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('totalTransactions');
        expect(res.body).toHaveProperty('transactionsByType');
        expect(res.body).toHaveProperty('totalAmountConvertedByCurrency');
        expect(res.body).toHaveProperty('totalAmountByTransactionType');
        expect(res.body).toHaveProperty('averageAmountByTransactionType');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});