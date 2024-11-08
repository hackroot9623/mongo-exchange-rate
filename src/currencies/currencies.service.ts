import { Injectable, CACHE_MANAGER, Inject, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrenciesService {
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  private readonly exchangeRateApiUrl = 'https://concurso.dofleini.com/exchange-rate';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getSupportedCurrencies() {
    return {
      supportedCurrencies: this.supportedCurrencies,
    };
  }

  isCurrencySupported(currency: string): boolean {
    return this.supportedCurrencies.includes(currency.toUpperCase());
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (!this.isCurrencySupported(fromCurrency) || !this.isCurrencySupported(toCurrency)) {
      throw new BadRequestException('Unsupported currency');
    }

    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cachedRate = await this.cacheManager.get<number>(cacheKey);

    if (cachedRate !== undefined) {
      return cachedRate;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.exchangeRateApiUrl}/rate`, {
          params: {
            from: fromCurrency,
            to: toCurrency,
          },
        })
      );

      const rate = response.data.rate;
      await this.cacheManager.set(cacheKey, rate, 3600000); // 1 hour in milliseconds
      return rate;
    } catch (error) {
      throw new BadRequestException('Failed to fetch exchange rate');
    }
  }

  async convertAmount(fromCurrency: string, toCurrency: string, amount: number): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }
}