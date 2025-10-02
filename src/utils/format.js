// src/pages/utils/format.js

// Currency configuration for supported countries
const CURRENCY_CONFIG = {
  'South Africa': { code: 'ZAR', rate: 17, symbol: 'R' },
  'Nigeria': { code: 'NGN', rate: 1500, symbol: '₦' },
  'Ghana': { code: 'GHS', rate: 12.50, symbol: 'GH₵' },
  'Philippines': { code: 'PHP', rate: 58, symbol: '₱' }
};

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '—'
  const num = Number(amount)
  return num.toLocaleString(undefined, { style: 'currency', currency })
}

// New function for multi-currency conversion display
export function formatCurrencyWithConversion(amount, country, options = {}) {
  if (amount === null || amount === undefined) return '—'
  
  const num = Number(amount)
  const currencyConfig = CURRENCY_CONFIG[country]
  
  // Format USD amount
  const usdFormatted = num.toLocaleString(undefined, { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: options.minimumFractionDigits || 2,
    maximumFractionDigits: options.maximumFractionDigits || 2
  })
  
  // If country not in supported list, return only USD
  if (!currencyConfig) {
    return usdFormatted
  }
  
  // Calculate and format converted amount
  const convertedAmount = (num * currencyConfig.rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `${usdFormatted} (${currencyConfig.symbol}${convertedAmount})`
}

// Helper function to get currency configuration
export function getCurrencyConfig(country) {
  return CURRENCY_CONFIG[country] || null
}

// Helper function to format only the converted amount
export function formatConvertedAmount(amount, country) {
  if (amount === null || amount === undefined) return null
  
  const currencyConfig = CURRENCY_CONFIG[country]
  if (!currencyConfig) return null
  
  const converted = (Number(amount) * currencyConfig.rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `(${currencyConfig.symbol}${converted})`
}