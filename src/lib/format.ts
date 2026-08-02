export const CURRENCY_SYMBOL = "₵";

export function formatMoney(amount: number, fractionDigits = 2): string {
  const formatted = (Number.isFinite(amount) ? amount : 0).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${CURRENCY_SYMBOL}${formatted}`;
}