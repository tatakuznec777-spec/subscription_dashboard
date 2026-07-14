export const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  };
  
  const symbol = symbols[currency] || currency;
  return `${amount.toLocaleString('ru-RU')} ${symbol}`;
};