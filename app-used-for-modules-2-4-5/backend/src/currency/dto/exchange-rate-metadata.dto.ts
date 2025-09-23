export interface ExchangeRateMetadata {
  id: number;
  rate: number;
  source?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  currencyId: string;
}

export function ExchangeRateToMetadata(
  exchangeRate: ExchangeRateMetadata,
): ExchangeRateMetadata {
  return {
    id: exchangeRate.id,
    rate: exchangeRate.rate,
    source: exchangeRate.source,
    isActive: exchangeRate.isActive,
    createdAt: exchangeRate.createdAt,
    updatedAt: exchangeRate.updatedAt,
    currencyId: exchangeRate.currencyId,
  };
}
