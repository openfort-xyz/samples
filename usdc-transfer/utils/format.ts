export function formatUSDC(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  const num = typeof value === 'string' ? Number(value) : value;
  if (!isFinite(num)) return "0";

  // Limit to max 6 decimals, then trim trailing zeros
  const fixed = num.toFixed(6);
  // Remove trailing zeros and possible trailing dot
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
  return trimmed;
}

