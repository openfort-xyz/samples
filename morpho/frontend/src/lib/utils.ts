export const formatUsdcBalance = (balance: bigint | undefined) => {
  if (!balance) return '0.00';
  const decimals = 6;
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;
  const paddedFraction = fraction.toString().padStart(decimals, '0');
  const twoDecimals = paddedFraction.slice(0, 2);
  return `${whole}.${twoDecimals}`; 
};
