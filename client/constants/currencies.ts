// Common currency codes
export const CURRENCIES = [
  "USD",
  "EUR",
  "PHP",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "INR",
  "MXN",
  "BRL",
  "ZAR",
  "SGD",
  "HKD",
  "NZD",
  "KRW",
  "TRY",
  "RUB",
  "AED",
  "SAR",
] as const;

export type Currency = (typeof CURRENCIES)[number];

