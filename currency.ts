export async function convertCurrency(
  amount: number,
  from: string,
  to: string
) {
  // Currency API

  return {
    amount,
    from,
    to,
    convertedAmount: 0,
    rate: 0
  };
}