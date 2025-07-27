// hooks/useCurrency.ts
import { useCallback, useEffect } from 'react';
import {
  selectCurrency,
  selectCurrencyConfig,
  selectCurrencySymbol,
  selectAllCurrencies,
  setCurrency,
  loadCurrencyFromStorage,
  formatCurrency,
  formatCurrencyWithLocale,
  CurrencyCode,
  CurrencyConfig
} from '@/store/slices/currencySlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

interface UseCurrencyReturn {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  currencySymbol: string;   
  allCurrencies: Record<CurrencyCode, CurrencyConfig>;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number | string, showCode?: boolean) => string;
  formatCurrencyWithLocale: (amount: number | string) => string;
  getCurrencySymbol: () => string;
  getCurrencyCode: () => string;
  getCurrencyName: () => string;
}

export const useCurrency = (): UseCurrencyReturn => {
  const dispatch = useAppDispatch();
  
  const currency = useAppSelector(selectCurrency);
  const currencyConfig = useAppSelector(selectCurrencyConfig);
  const currencySymbol = useAppSelector(selectCurrencySymbol);
  const allCurrencies = useAppSelector(selectAllCurrencies);

  // Load currency from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(loadCurrencyFromStorage());
    }
  }, [dispatch]);

  const handleSetCurrency = useCallback((newCurrency: CurrencyCode) => {
    dispatch(setCurrency(newCurrency));
  }, [dispatch]);

  const handleFormatCurrency = useCallback((
    amount: number | string, 
    showCode: boolean = false
  ) => {
    return formatCurrency(amount, currencyConfig, showCode);
  }, [currencyConfig]);

  const handleFormatCurrencyWithLocale = useCallback((
    amount: number | string
  ) => {
    return formatCurrencyWithLocale(amount, currencyConfig);
  }, [currencyConfig]);

  const getCurrencySymbol = useCallback(() => currencyConfig.symbol, [currencyConfig.symbol]);
  const getCurrencyCode = useCallback(() => currencyConfig.code, [currencyConfig.code]);
  const getCurrencyName = useCallback(() => currencyConfig.name, [currencyConfig.name]);

  return {
    currency,
    currencyConfig,
    currencySymbol,
    allCurrencies,
    setCurrency: handleSetCurrency,
    formatCurrency: handleFormatCurrency,
    formatCurrencyWithLocale: handleFormatCurrencyWithLocale,
    getCurrencySymbol,
    getCurrencyCode,
    getCurrencyName,
  };
};