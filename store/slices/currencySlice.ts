// store/slices/currencySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export type CurrencyCode = 'usd' | 'eur' | 'gbp' | 'lkr';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  locale?: string;
}

export interface CurrencyState {
  selected: CurrencyCode;
  config: Record<CurrencyCode, CurrencyConfig>;
}

// Currency configuration
const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  usd: { 
    symbol: '$', 
    code: 'USD', 
    name: 'US Dollar',
    locale: 'en-US'
  },
  eur: { 
    symbol: '€', 
    code: 'EUR', 
    name: 'Euro',
    locale: 'de-DE'
  },
  gbp: { 
    symbol: '£', 
    code: 'GBP', 
    name: 'British Pound',
    locale: 'en-GB'
  },
  lkr: { 
    symbol: 'Rs', 
    code: 'LKR', 
    name: 'Sri Lankan Rupee',
    locale: 'si-LK'
  }
};

const initialState: CurrencyState = {
  selected: 'usd',
  config: CURRENCY_CONFIG
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.selected = action.payload;
      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCurrency', action.payload);
      }
    },
    loadCurrencyFromStorage: (state) => {
      // Only run on client side
      if (typeof window !== 'undefined') {
        const savedCurrency = localStorage.getItem('selectedCurrency') as CurrencyCode;
        if (savedCurrency && CURRENCY_CONFIG[savedCurrency]) {
          state.selected = savedCurrency;
        }
      }
    }
  }
});

export const { setCurrency, loadCurrencyFromStorage } = currencySlice.actions;

// Selectors
export const selectCurrency = (state: { currency: CurrencyState }) => state.currency.selected;
export const selectCurrencyConfig = (state: { currency: CurrencyState }) => 
  state.currency.config[state.currency.selected];
export const selectCurrencySymbol = (state: { currency: CurrencyState }) => 
  state.currency.config[state.currency.selected].symbol;
export const selectAllCurrencies = (state: { currency: CurrencyState }) => 
  state.currency.config;

export default currencySlice.reducer;

// Helper functions
export const formatCurrency = (
  amount: number | string, 
  currencyConfig: CurrencyConfig, 
  showCode: boolean = false
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formattedAmount = isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  
  return showCode 
    ? `${currencyConfig.symbol}${formattedAmount} ${currencyConfig.code}`
    : `${currencyConfig.symbol}${formattedAmount}`;
};

// Advanced formatting with locale support
export const formatCurrencyWithLocale = (
  amount: number | string,
  currencyConfig: CurrencyConfig
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${currencyConfig.symbol}0.00`;
  
  try {
    return new Intl.NumberFormat(currencyConfig.locale || 'en-US', {
      style: 'currency',
      currency: currencyConfig.code,
    }).format(numAmount);
  } catch (error) {
    // Fallback to simple formatting
    return formatCurrency(numAmount, currencyConfig);
  }
};