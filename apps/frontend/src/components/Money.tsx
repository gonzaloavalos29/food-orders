interface MoneyProps {
  amountInCents: number;
  currency?: string;
}

export function Money({ amountInCents, currency = 'ARS' }: MoneyProps) {
  const value = amountInCents / 100;
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency
  }).format(value);
  return <span className="fo-money">{formatted}</span>;
}
