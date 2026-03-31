'use client';

import { useEffect, useRef, useState } from 'react';
import BubbleCanvas from '../components/BubbleCanvas';
import StockChart from '../components/StockChart';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  prevClose?: number;
}

// Top 50 S&P 500 stocks by market cap
const SP500_TOP_50 = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'LLY', 'V',
  'JPM', 'XOM', 'UNH', 'MA', 'HD', 'PG', 'JNJ', 'COST', 'ABBV', 'CVX',
  'MRK', 'KO', 'PEP', 'TMO', 'BAC', 'AVGO', 'WMT', 'MCD', 'CSCO', 'LIN', 'DHR',
  'ABT', 'CRM', 'NKE', 'ACN', 'ADBE', 'NFLX', 'CMCSA', 'PYPL', 'TXN', 'INTC',
  'VZ', 'NEE', 'T', 'MDT', 'QCOM', 'WFC', 'IBM', 'GS', 'CAT', 'RTX'
];

export default function StockBubbles() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const lastMatchedTermRef = useRef('');
  const [isListOpen, setIsListOpen] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [historicalPrices, setHistoricalPrices] = useState<Record<string, number | null>>({});
  const [listHistoricalData, setListHistoricalData] = useState<Record<string, Record<string, number | null>>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;

    const fetchStockData = async (isInitial = false) => {
      try {
        if (!apiKey || !secretKey) {
          if (isInitial) {
            setError('API keys not configured. Please check environment variables.');
            setLoading(false);
          }
          return;
        }

        const symbols = SP500_TOP_50.join(',');
        const response = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols}`, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          }
        });

        if (!response.ok) throw new Error('Failed to fetch market snapshots');

        const snapshots = await response.json();
        
        const updatedStocks: Stock[] = SP500_TOP_50.map(symbol => {
          const snapshot = snapshots[symbol];
          const price = snapshot?.latestTrade?.p || 0;
          const prevClose = snapshot?.prevDailyBar?.c || price;
          const change = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

          return {
            symbol,
            name: symbol,
            price,
            change,
            prevClose,
            marketCap: 1000000000000
          };
        });

        setStocks(updatedStocks);
        if (isInitial) {
          setLoading(false);
          connectWebSocket();
        }
      } catch (err) {
        console.error('Error fetching initial snapshots:', err);
        if (isInitial) {
          setError('Failed to fetch market data.');
          // Fallback initialization
          setStocks(SP500_TOP_50.map(symbol => ({
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            marketCap: 1000000000000
          })));
          setLoading(false);
          connectWebSocket();
        }
      }
    };

    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_ALPACA_WS_URL || 'wss://stream.data.alpaca.markets/v2/iex';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Connected to Alpaca WebSocket');
          wsRef.current?.send(JSON.stringify({
            action: 'auth',
            key: apiKey,
            secret: secretKey
          }));

          setTimeout(() => {
            wsRef.current?.send(JSON.stringify({
              action: 'subscribe',
              trades: SP500_TOP_50,
              dailyBars: SP500_TOP_50
            }));
          }, 1000);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const messages = JSON.parse(event.data);
            if (!Array.isArray(messages)) return;
            
            setStocks(prevStocks => {
              let hasUpdates = false;
              const newStocks = [...prevStocks];

              messages.forEach(msg => {
                if (msg.S && (msg.T === 't' || msg.T === 'd')) {
                  const idx = newStocks.findIndex(s => s.symbol === msg.S);
                  if (idx !== -1) {
                    const current = newStocks[idx];
                    const newPrice = msg.T === 't' ? msg.p : msg.c;
                    // Calculate change relative to prevClose if available, otherwise use daily open
                    const baseline = current.prevClose || (msg.T === 'd' ? msg.o : newPrice);
                    const newChange = baseline !== 0 ? ((newPrice - baseline) / baseline) * 100 : 0;

                    newStocks[idx] = {
                      ...current,
                      price: newPrice,
                      change: newChange
                    };
                    hasUpdates = true;
                  }
                }
              });

              return hasUpdates ? newStocks : prevStocks;
            });
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        wsRef.current.onerror = (err) => console.error('WebSocket error:', err);
        wsRef.current.onclose = () => console.log('WebSocket connection closed');
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    fetchStockData(true);

    const pollInterval = setInterval(() => {
      setProgress(0);
      fetchStockData(false);
    }, 15000);

    const progressTimer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + (100 / 1500) : 0)); // 100% / (15000ms / 10ms) = 100 / 1500
    }, 10); // Update every 10ms for smoother animation

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      clearInterval(progressTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Fetch historical candle data when a stock is selected
  useEffect(() => {
    if (!selectedStock) {
      setHistoricalPrices({});
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;

    const fetchHistorical = async () => {
      const timeframes = [
        { label: '1H', tf: '1H' },
        { label: '1D', tf: '1D' },
        { label: '1W', tf: '1W' },
        { label: '1M', tf: '1M' },
        { label: '3M', tf: '3M' },
        { label: '1Y', tf: '1M' },
      ];

      const results: Record<string, number | null> = {};

      const now = new Date();
      const endStr = now.toISOString();

      const getStartTime = (label: string) => {
        const d = new Date();
        if (label === '1H') d.setHours(d.getHours() - 100);
        else if (label === '1D') d.setDate(d.getDate() - 5);
        else if (label === '1W') d.setDate(d.getDate() - 35); // 5 weeks
        else if (label === '1M') d.setMonth(d.getMonth() - 5);
        else if (label === '3M') d.setFullYear(d.getFullYear() - 1); // 12 months
        else d.setFullYear(d.getFullYear() - 3); // 1Y: 36 months
        return d.toISOString();
      };

      try {
        await Promise.all(timeframes.map(async ({ label, tf }) => {
          const start = getStartTime(label);
          const response = await fetch(
            `https://data.alpaca.markets/v2/stocks/bars?symbols=${selectedStock.symbol}&timeframe=${tf}&start=${start}&end=${endStr}&limit=1000&adjustment=raw&feed=iex&sort=asc`,
            {
              headers: {
                'APCA-API-KEY-ID': apiKey || '',
                'APCA-API-SECRET-KEY': secretKey || '',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const symbol = selectedStock.symbol;
            const bars = data.bars?.[symbol];
            
            const estHour = parseInt(new Date().toLocaleString("en-US", {timeZone: "America/New_York", hour12: false, hour: 'numeric'}));
            const pastMarketClose = estHour >= 16;

            if ((label === '1H' || label === '1D') && pastMarketClose) {
              // If past 4pm EST, use the current live price as requested
              const livePrice = stocks.find(s => s.symbol === symbol)?.price || selectedStock.price;
              results[label] = livePrice;
            } else if (bars && bars.length >= 2) {
              // Take the "last but one" bar (penultimate)
              results[label] = bars[bars.length - 2].c;
            } else {
              results[label] = null;
            }
          } else {
            results[label] = null;
          }
        }));

        setHistoricalPrices(results);
      } catch (err) {
        console.error('Error fetching historical candle prices:', err);
      }
    };

    fetchHistorical();
  }, [selectedStock?.symbol]);

  // Automatically open the stock detail modal if the search term matches a ticker symbol exactly
  useEffect(() => {
    const term = searchTerm.trim().toUpperCase();
    const match = stocks.find(s => s.symbol === term);
    
    if (match) {
      if (term !== lastMatchedTermRef.current) {
        setSelectedStock(match);
        lastMatchedTermRef.current = term;
      }
    } else {
      lastMatchedTermRef.current = '';
    }
  }, [searchTerm, stocks]);

  // Fetch market-wide list data when the List modal is opened
  useEffect(() => {
    if (!isListOpen) return;

    const fetchAllHistorical = async () => {
      setListLoading(true);
      const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
      const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
      const symbols = SP500_TOP_50.join(',');

      const now = new Date();
      const endStr = now.toISOString();

      // Helper to determine start times based on requirement descriptions
      const getStartTime = (label: string) => {
        const d = new Date();
        if (label === '1H') d.setHours(d.getHours() - 100);
        else if (label === '1D') d.setDate(d.getDate() - 5);
        else if (label === '1W') d.setDate(d.getDate() - 35); // 5 weeks
        else if (label === '1M') d.setMonth(d.getMonth() - 5);
        else if (label === '3M') d.setFullYear(d.getFullYear() - 1); // 12 months
        else d.setFullYear(d.getFullYear() - 3); // 36 months
        return d.toISOString();
      };
      
      const timeframes = [
        { label: '1H', tf: '1H', start: getStartTime('1H') },
        { label: '1D', tf: '1D', start: getStartTime('1D') },
        { label: '1W', tf: '1W', start: getStartTime('1W') },
        { label: '1M', tf: '1M', start: getStartTime('1M') },
        { label: '3M', tf: '3M', start: getStartTime('3M') },
        { label: '1Y', tf: '1M', start: getStartTime('1Y') },
      ];

      const results: Record<string, Record<string, number | null>> = {};
      SP500_TOP_50.forEach(s => results[s] = {});

      try {
        await Promise.all(timeframes.map(async ({ label, tf, start }) => {
          const response = await fetch(
            `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbols}&timeframe=${tf}&start=${start}&end=${endStr}&limit=1000&adjustment=raw&feed=iex&sort=asc`,
            {
              headers: {
                'APCA-API-KEY-ID': apiKey || '',
                'APCA-API-SECRET-KEY': secretKey || '',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.bars) {
              const estHour = parseInt(new Date().toLocaleString("en-US", {timeZone: "America/New_York", hour12: false, hour: 'numeric'}));
              const pastMarketClose = estHour >= 16;

              Object.keys(data.bars).forEach(symbol => {
                if ((label === '1H' || label === '1D') && pastMarketClose) {
                  const currentStock = stocks.find(s => s.symbol === symbol);
                  results[symbol][label] = currentStock?.price || null;
                } else if (data.bars[symbol].length >= 2) {
                  results[symbol][label] = data.bars[symbol][data.bars[symbol].length - 2].c;
                }
              });
            }
          }
        }));
        setListHistoricalData(results);
      } catch (err) {
        console.error('Error fetching list data:', err);
      } finally {
        setListLoading(false);
      }
    };

    fetchAllHistorical();
  }, [isListOpen]);

  // Determine overall market sentiment for progress bar color
  const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
  const averageChange = stocks.length > 0 ? totalChange / stocks.length : 0;
  const progressBarColorClass = averageChange >= 0 ? 'bg-[#00ff00] shadow-[0_0_15px_#00ff00]' : 'bg-[#ff0000] shadow-[0_0_15px_#ff0000]';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading Alpha Bubbles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl mb-4">Alpha Bubbles</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Header Container */}
      <div className="relative bg-black p-4 z-10 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Alpha Bubbles</h1>
          <div className="flex flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsListOpen(true)}
              className="flex-1 md:flex-none bg-gray-900 text-white border border-gray-700 rounded-lg py-2 px-4 sm:px-6 font-bold hover:bg-gray-800 transition-colors"
            >
              List
            </button>
            <div className="relative flex-[2] md:w-64">
            <input
              type="text"
              placeholder="Search ticker (e.g. AAPL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
          </div>
        </div>

        {/* Thin Progress Bar for Data Updates */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-transparent overflow-hidden">
          <div 
            className={`h-full ${progressBarColorClass}`} // Removed CSS transition
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bubbles Container */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
        <BubbleCanvas stocks={stocks} onStockSelect={setSelectedStock} searchTerm={searchTerm} />

        {/* Market List Modal */}
        {isListOpen && (
          <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col p-2 sm:p-6 md:p-10">
            <div className="flex justify-between items-center mb-4 sm:mb-8 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Market Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Closing prices for the most recent completed bars</p>
              </div>
              <button 
                onClick={() => setIsListOpen(false)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors bg-gray-900 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/20">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 sticky top-0 z-10 shadow-lg">
                  <tr>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 whitespace-nowrap">Ticker</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">Price</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1H Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1D Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1W Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1M Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">3M Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1Y Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {SP500_TOP_50.map(symbol => {
                    const data = listHistoricalData[symbol] || {};
                    const currentStock = stocks.find(s => s.symbol === symbol);
                    return (
                      <tr key={symbol} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                        setSelectedStock(stocks.find(s => s.symbol === symbol) || null);
                        setIsListOpen(false);
                      }}>
                        <td className="p-3 sm:p-4 text-white font-black text-base sm:text-lg">{symbol}</td>
                        <td className="p-3 sm:p-4 font-mono text-white text-xs sm:text-sm text-right">
                          {currentStock ? `$${currentStock.price.toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['1H'] ? `$${data['1H'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['1D'] ? `$${data['1D'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['1W'] ? `$${data['1W'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['1M'] ? `$${data['1M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['3M'] ? `$${data['3M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 font-mono text-gray-400 text-xs sm:text-sm text-right">
                          {data['1Y'] ? `$${data['1Y'].toFixed(2)}` : '---'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {listLoading && (
                <div className="p-8 text-center text-gray-500 animate-pulse font-bold tracking-widest">
                  FETCHING MARKET DATA...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Details Modal Overlay */}
        {selectedStock && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStock(null)}
          >
            <div 
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 w-[95%] max-w-sm relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStock(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-8">
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-2">
                  {selectedStock.symbol}
                </h3>
                <p className="text-gray-400 text-sm font-medium">{selectedStock.name}</p>
              </div>
              
              {/* Real-time Historical Chart */}
              <div className="h-40 w-full bg-black/40 rounded-xl mb-8 border border-gray-800 relative overflow-hidden flex flex-col">
                <StockChart 
                  symbol={selectedStock.symbol} 
                  color={selectedStock.change >= 0 ? '#00ff00' : '#ff0000'} 
                />
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center py-2 border-t border-gray-800 bg-black/20 relative z-10">
                  30-Day Price Trend
                </span>
              </div>

              <div className="space-y-6">
                {/* Historical Prices Grid */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 border-b border-gray-800 pb-6">
                  {(['1H', '1D', '1W', '1M', '3M', '1Y'] as const).map((label) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label} Close</span>
                      <span className="text-sm font-mono text-white font-medium">
                        {typeof historicalPrices[label] === 'number' ? `$${historicalPrices[label]?.toFixed(2)}` : '---'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col border-b border-gray-800 pb-6">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Price</span>
                  <span className="text-5xl font-mono text-white font-bold leading-none">
                    ${selectedStock.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">24h Change</span>
                  <span className={`text-3xl font-bold ${selectedStock.change >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                  </span>
                </div>

                <div className="pt-4">
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                    Market Cap: ${(selectedStock.marketCap / 1000000000000).toFixed(2)}T
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
