export interface CurrencyMetadata {
  code: string;
  name: string;
  currentRate: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export function currencyToMetadata(
  currency: CurrencyMetadata,
): CurrencyMetadata {
  return {
    code: currency.code,
    name: currency.name,
    currentRate: currency.currentRate,
    createdAt: currency.createdAt,
    updatedAt: currency.updatedAt,
    isActive: currency.isActive,
  };
}
