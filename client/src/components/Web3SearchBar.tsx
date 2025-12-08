import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ExternalLink, Wallet, Coins, Globe, Loader2 } from "lucide-react";

interface SearchResult {
  type: 'url' | 'solana_address' | 'solana_token' | 'solana_wallet' | 'token_symbol' | 'search';
  query: string;
  result: {
    url?: string;
    redirect?: boolean;
    address?: string;
    name?: string;
    symbol?: string;
    image?: string | null;
    description?: string | null;
    balance?: number;
    balanceFormatted?: string;
    explorerUrl?: string;
    note?: string;
    suggestion?: string;
    examples?: string[];
  };
}

export function Web3SearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isUrl = (text: string): boolean => {
    return /^(https?:\/\/|www\.)/i.test(text.trim());
  };

  const isSolanaAddress = (text: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text.trim());
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResult(null);
      setShowDropdown(false);
      return;
    }

    if (isUrl(searchQuery)) {
      const url = searchQuery.startsWith('www.') ? `https://${searchQuery}` : searchQuery;
      window.open(url, '_blank', 'noopener,noreferrer');
      setQuery("");
      setResult(null);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/web3/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data: SearchResult = await response.json();
      setResult(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Web3 search error:', error);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 3 || isSolanaAddress(value)) {
      debounceRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    } else {
      setResult(null);
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setQuery("");
    setResult(null);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'solana_wallet':
        return <Wallet className="w-4 h-4 text-purple-400" />;
      case 'solana_token':
      case 'token_symbol':
        return <Coins className="w-4 h-4 text-amber-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 2px rgba(6, 182, 212, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          transition={{ duration: 0.2 }}
          className="relative flex items-center bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
        >
          <div className="absolute left-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search Solana address, token, or URL..."
            className="w-full py-2.5 pl-10 pr-20 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            data-testid="input-web3-search"
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-medium rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
              data-testid="button-web3-search"
            >
              Search
            </motion.button>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {showDropdown && result && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl shadow-black/30 overflow-hidden z-50"
            data-testid="dropdown-web3-results"
          >
            {result.type === 'search' ? (
              <div className="p-4 text-center">
                <p className="text-slate-400 text-sm">{result.result.suggestion}</p>
                {result.result.examples && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    {result.result.examples.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(example);
                          handleSearch(example);
                        }}
                        className="px-2 py-1 bg-slate-700/50 rounded text-xs text-cyan-400 hover:bg-slate-700 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    {result.result.image ? (
                      <img 
                        src={result.result.image} 
                        alt={result.result.name || 'Token'} 
                        className="w-8 h-8 rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      getResultIcon(result.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">
                        {result.result.name || result.result.symbol || 'Solana Address'}
                      </span>
                      {result.result.symbol && result.result.name && (
                        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                          {result.result.symbol}
                        </span>
                      )}
                    </div>
                    
                    {result.result.address && (
                      <p className="text-slate-500 text-xs font-mono truncate mt-0.5">
                        {result.result.address}
                      </p>
                    )}
                    
                    {result.result.balanceFormatted && (
                      <p className="text-cyan-400 text-sm font-medium mt-1">
                        {result.result.balanceFormatted}
                      </p>
                    )}
                    
                    {result.result.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {result.result.description}
                      </p>
                    )}
                    
                    {result.result.note && (
                      <p className="text-amber-400/70 text-xs mt-1 italic">
                        {result.result.note}
                      </p>
                    )}
                  </div>
                </div>
                
                {result.result.explorerUrl && (
                  <button
                    onClick={() => handleResultClick(result.result.explorerUrl!)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Solana Explorer
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
