export const formatUsdcBalance = (balance: bigint | undefined) => {
  if (!balance) return '0';
  const decimals = 6; 
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  return whole.toString();
};