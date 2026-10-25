const intFormat = new Intl.NumberFormat('en-IN');
const priceFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export const formatInt = (n) => intFormat.format(n);

export const formatPrice = (n) => `₹ ${priceFormat.format(n)}`;

// Indian short scale: lakh (1e5) and crore (1e7).
export function formatCompactINR(n) {
  if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(2)} L`;
  return formatPrice(Math.round(n));
}

export function formatAxis(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

export const formatPercent = (part, total) =>
  total ? `${((part / total) * 100).toFixed(1)}%` : '0%';
