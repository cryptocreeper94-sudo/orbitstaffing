import { useState } from 'react';
import { DollarSign, TrendingUp, Globe, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  enabled: boolean;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  date: Date;
}

export function MultiCurrencySupport() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0, enabled: true },
    { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, enabled: true },
    { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, enabled: true },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', exchangeRate: 1.36, enabled: false },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', exchangeRate: 17.05, enabled: false },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.50, enabled: false },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.54, enabled: false },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'txn-001',
      description: 'Worker Payroll - John Davis',
      amount: 1480.00,
      currency: 'USD',
      convertedAmount: 1480.00,
      date: new Date('2024-11-25'),
    },
    {
      id: 'txn-002',
      description: 'Client Invoice - EU Client',
      amount: 2500.00,
      currency: 'EUR',
      convertedAmount: 2717.39,
      date: new Date('2024-11-24'),
    },
  ]);

  const [newRate, setNewRate] = useState({ code: '', rate: '' });

  const toggleCurrency = (code: string) => {
    setCurrencies(currencies.map(c =>
      c.code === code ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const updateExchangeRate = (code: string, rate: number) => {
    setCurrencies(currencies.map(c =>
      c.code === code ? { ...c, exchangeRate: rate } : c
    ));
  };

  const refreshRates = () => {
    // Simulate API call to get live rates
    alert('Fetching latest exchange rates from API...');
    // In production, call real forex API
  };

  const convertAmount = (amount: number, from: string, to: string): number => {
    const fromCurrency = currencies.find(c => c.code === from);
    const toCurrency = currencies.find(c => c.code === to);
    
    if (!fromCurrency || !toCurrency) return amount;
    
    const amountInBaseCurrency = amount / fromCurrency.exchangeRate;
    return amountInBaseCurrency * toCurrency.exchangeRate;
  };

  const totalInBaseCurrency = transactions.reduce((sum, txn) => sum + txn.convertedAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-7 h-7 text-green-400" />
          Multi-Currency Support
        </h2>
        <p className="text-gray-400 text-sm">Manage international workers and payments across currencies</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-sm font-bold text-gray-400">Base Currency</span>
          </div>
          <p className="text-2xl font-bold">{baseCurrency}</p>
          <p className="text-xs text-gray-400 mt-1">All amounts converted to {baseCurrency}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-gray-400">Active Currencies</span>
          </div>
          <p className="text-2xl font-bold">{currencies.filter(c => c.enabled).length}</p>
          <p className="text-xs text-gray-400 mt-1">of {currencies.length} available</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-bold text-gray-400">Total (Converted)</span>
          </div>
          <p className="text-2xl font-bold">${totalInBaseCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">{baseCurrency} equivalent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Currency Settings</h3>
            <Button
              onClick={refreshRates}
              className="bg-cyan-600 hover:bg-cyan-700 text-sm"
              data-testid="button-refresh-rates"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Rates
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Currency
            </label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-base-currency"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currencies.map((currency) => (
              <div
                key={currency.code}
                className="p-3 bg-slate-700/50 rounded-lg"
                data-testid={`currency-${currency.code}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currency.enabled}
                        onChange={() => toggleCurrency(currency.code)}
                        className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
                        data-testid={`checkbox-${currency.code}`}
                      />
                      <span className="font-bold">{currency.code}</span>
                    </label>
                    <span className="text-sm text-gray-400">{currency.name}</span>
                  </div>
                  <span className="text-lg font-bold">{currency.symbol}</span>
                </div>

                {currency.enabled && currency.code !== baseCurrency && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Exchange Rate:</span>
                    <input
                      type="number"
                      value={currency.exchangeRate}
                      onChange={(e) => updateExchangeRate(currency.code, parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="flex-1 px-3 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
                      data-testid={`input-rate-${currency.code}`}
                    />
                    <span className="text-xs text-gray-400">{baseCurrency}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Recent Multi-Currency Transactions</h3>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((txn) => {
                const currency = currencies.find(c => c.code === txn.currency);
                return (
                  <div
                    key={txn.id}
                    className="p-4 bg-slate-700/50 rounded-lg"
                    data-testid={`transaction-${txn.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{txn.description}</p>
                        <p className="text-xs text-gray-400">{txn.date.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {currency?.symbol}{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400">{txn.currency}</p>
                      </div>
                    </div>
                    
                    {txn.currency !== baseCurrency && (
                      <div className="pt-2 border-t border-slate-600">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Converted to {baseCurrency}:</span>
                          <span className="font-bold text-cyan-400">
                            ${txn.convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Currency Converter Tool */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Quick Currency Converter
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              placeholder="100.00"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="input-convert-amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
            <select
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-from-currency"
            >
              {currencies.filter(c => c.enabled).map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
            <select
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="select-to-currency"
            >
              {currencies.filter(c => c.enabled).map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
