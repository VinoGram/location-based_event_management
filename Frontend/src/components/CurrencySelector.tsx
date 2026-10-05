import { useState } from 'react';
import { currencyService, Currency } from '../services/currencyService';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
}

export default function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(currencyService.getCurrentCurrency());
  const currencies = currencyService.getAllCurrencies();

  const handleCurrencySelect = (currency: Currency) => {
    setCurrentCurrency(currency);
    localStorage.setItem('userCurrency', JSON.stringify(currency));
    setIsOpen(false);
    onCurrencyChange?.(currency);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF] hover:bg-[#171717]/80 transition-all"
      >
        <svg className="w-4 h-4 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
        <span>{currentCurrency.symbol}</span>
        <span className="text-sm">{currentCurrency.code}</span>
        <svg className="w-3 h-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#171717] backdrop-blur-md border border-[#DDAA52]/30 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencySelect(currency)}
              className={`w-full px-4 py-2 text-left hover:bg-[#DDAA52]/20 transition-all ${
                currentCurrency.code === currency.code ? 'bg-[#DDAA52]/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#FFFFFF]">{currency.symbol} {currency.code}</span>
                <span className="text-[#FFFFFF]/60 text-xs">{currency.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}