'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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

const SYMBOL_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com, Inc.',
  'GOOGL': 'Alphabet Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms, Inc.',
  'TSLA': 'Tesla, Inc.',
  'BRK.B': 'Berkshire Hathaway Inc.',
  'UNH': 'UnitedHealth Group Incorporated',
  'JNJ': 'Johnson & Johnson',
  'V': 'Visa Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'PG': 'The Procter & Gamble Company',
  'MA': 'Mastercard Incorporated',
  'AVGO': 'Broadcom Inc.',
  'HD': 'The Home Depot, Inc.',
  'KO': 'The Coca-Cola Company',
  'PEP': 'PepsiCo, Inc.',
  'MRK': 'Merck & Co., Inc.',
  'VZ': 'Verizon Communications Inc.',
  'CMCSA': 'Comcast Corporation',
  'ADBE': 'Adobe Inc.',
  'NFLX': 'Netflix, Inc.',
  'NKE': 'NIKE, Inc.',
  'INTC': 'Intel Corporation',
  'T': 'AT&T Inc.',
  'ABT': 'Abbott Laboratories',
  'XOM': 'Exxon Mobil Corporation',
  'CVX': 'Chevron Corporation',
  'CSCO': 'Cisco Systems, Inc.',
  'PFE': 'Pfizer Inc.',
  'ORCL': 'Oracle Corporation',
  'TMO': 'Thermo Fisher Scientific Inc.',
  'WMT': 'Walmart Inc.',
  'LLY': 'Eli Lilly and Company',
  'CRM': 'Salesforce, Inc.',
  'ACN': 'Accenture plc',
  'COST': 'Costco Wholesale Corporation',
  'MCD': 'McDonald\'s Corporation',
  'DHR': 'Danaher Corporation',
  'WFC': 'Wells Fargo & Company',
  'QCOM': 'QUALCOMM Incorporated',
  'MDT': 'Medtronic plc',
  'NEE': 'NextEra Energy, Inc.',
  'HON': 'Honeywell International Inc.',
  'AMGN': 'Amgen Inc.',
  'ABBV': 'AbbVie Inc.',
  'BMY': 'Bristol-Myers Squibb Company',
  'TXN': 'Texas Instruments Incorporated',
  'UPS': 'United Parcel Service, Inc.',
  'INTU': 'Intuit Inc.',
  'RTX': 'Raytheon Technologies Corporation',
  'LOW': 'Lowe\'s Companies, Inc.',
  'UNP': 'Union Pacific Corporation',
  'PM': 'Philip Morris International Inc.',
  'MS': 'Morgan Stanley',
  'IBM': 'International Business Machines Corporation',
  'BIDU': 'Baidu, Inc.',
  'SBUX': 'Starbucks Corporation',
  'CAT': 'Caterpillar Inc.',
  'GE': 'General Electric Company',
  'AXP': 'American Express Company',
  'MMM': '3M Company',
  'GILD': 'Gilead Sciences, Inc.',
  'AMD': 'Advanced Micro Devices, Inc.',
  'LMT': 'Lockheed Martin Corporation',
  'BA': 'The Boeing Company',
  'GS': 'Goldman Sachs Group, Inc.',
  'AMT': 'American Tower Corporation',
  'BLK': 'BlackRock, Inc.',
  'CVS': 'CVS Health Corporation',
  'SNY': 'Sanofi',
  'CHTR': 'Charter Communications, Inc.',
  'ADP': 'Automatic Data Processing, Inc.',
  'ISRG': 'Intuitive Surgical, Inc.',
  'SYK': 'Stryker Corporation',
  'MO': 'Altria Group, Inc.',
  'SPGI': 'S&P Global Inc.',
  'CCI': 'Crown Castle International Corp.',
  'PLD': 'Prologis, Inc.',
  'CB': 'Chubb Limited',
  'PYPL': 'PayPal Holdings, Inc.',
  'ANTM': 'Anthem, Inc.',
  'TGT': 'Target Corporation',
  'ADSK': 'Adobe Inc.',
  'DE': 'Deere & Company',
  'ZTS': 'Zoetis Inc.',
  'MDLZ': 'Mondelez International, Inc.',
  'SCHW': 'The Charles Schwab Corporation',
  'CI': 'Cigna Corporation',
  'BDX': 'Becton, Dickinson and Company',
  'LRCX': 'Lam Research Corporation',
  'REGN': 'Regeneron Pharmaceuticals, Inc.',
  'DUK': 'Duke Energy Corporation',
  'ETN': 'Eaton Corporation plc',
  'SYF': 'Synchrony Financial',
  'SMCI': 'Super Micro Computer, Inc.',
  'XPEV': 'XPeng Inc.',
  'UUUU': 'Energy Fuels Inc.',
  'MSTR': 'MicroStrategy Incorporated',
  'RGTI': 'Rigetti Computing, Inc.',
  'QUBT': 'Quantum Computing Inc.',
  'QBTS': 'D-Wave Quantum Inc.',
  'CRCL': 'Carbon Revolution Public Limited Company',
  'IONQ': 'IonQ, Inc.',
  'BABA': 'Alibaba Group Holding Limited',
  'COIN': 'Coinbase Global, Inc.',
  'DDOG': 'Datadog, Inc.',
  'MP': 'MP Materials Corp.',
  'FBTC': 'Fidelity Wise Origin Bitcoin Fund',
  'CRWV': 'Crown Electrokinetics Corp.',
  'PLTR': 'Palantir Technologies Inc.',
  'NXPI': 'NXP Semiconductors N.V.',
  'CRWD': 'CrowdStrike Holdings, Inc.',
  'ARM': 'Arm Holdings plc',
  'LITE': 'Lumentum Holdings Inc.',
  'ODFL': 'Old Dominion Freight Line, Inc.',
  'BAC': 'Bank of America Corporation',
  'GOOG': 'Alphabet Inc.',
  'TSM': 'Taiwan Semiconductor Manufacturing Company Limited',
  'ASML': 'ASML Holding N.V.',
  'COHR': 'Coherent Corp.',
  'QQQ': 'Invesco QQQ Trust',
  'VOO': 'Vanguard S&P 500 ETF',
  'FN': 'Fabrinet',
  'MRVL': 'Marvell Technology, Inc.',
  'MU': 'Micron Technology, Inc.',
  'SNDK': 'SanDisk Corporation'
};

const SP500_SYMBOLS = Object.keys(SYMBOL_NAMES);

export default function StockBubbles() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const lastMatchedTermRef = useRef('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [isTimeframeMenuOpen, setIsTimeframeMenuOpen] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('1D'); // Default to 1 Day
  const [displayMode, setDisplayMode] = useState<'change' | 'price'>('change');
  const [listFilter, setListFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [listLoading, setListLoading] = useState(false);
  const [historicalPrices, setHistoricalPrices] = useState<Record<string, number | null>>({});
  const [listHistoricalData, setListHistoricalData] = useState<Record<string, Record<string, number | null>>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const fetchStockData = useCallback(async (isInitial = false) => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    try {
      if (!apiKey || !secretKey) {
        if (isInitial) {
          setError('API keys not configured. Please check environment variables.');
          setLoading(false);
        }
        return;
      }

      const symbols = SP500_SYMBOLS.join(',');
      const response = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols}`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch market snapshots');

      const snapshots = await response.json();
      
      const updatedStocks: Stock[] = SP500_SYMBOLS.map(symbol => {
        const snapshot = snapshots[symbol];
        const price = snapshot?.latestTrade?.p || 0;
        const prevClose = snapshot?.prevDailyBar?.c || price;
        const change = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

        return {
          symbol,
          name: SYMBOL_NAMES[symbol] || symbol,
          price,
          change,
          prevClose,
          marketCap: 1000000000000
        };
      });

      setStocks(updatedStocks);
      if (isInitial) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching initial snapshots:', err);
      if (isInitial) {
        setError('Failed to fetch market data.');
        setStocks(SP500_SYMBOLS.map(symbol => ({
          symbol,
          name: SYMBOL_NAMES[symbol] || symbol,
          price: 0,
          change: 0,
          marketCap: 1000000000000
        })));
        setLoading(false);
      }
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) return;

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
            trades: SP500_SYMBOLS,
            dailyBars: SP500_SYMBOLS
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
  }, []);

  const runOneDayLogic = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) return;

    const oneDayStockPricesAndPercentages: Array<{
      symbol: string;
      lastButOneClosingPrice: number;
      percentageChangeFromLastToCurrent: number;
    }> = [];

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const start = thirtyDaysAgo.toISOString();
    const end = now.toISOString();

    for (const symbol of SP500_SYMBOLS) {
      try {
        const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1D&start=${start}&end=${end}&limit=30&adjustment=raw&feed=iex&sort=asc`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const bars = data.bars?.[symbol];

        if (bars && bars.length >= 2) {
          const lastButOneClosingPrice = bars[bars.length - 2].c;
          const currentPrice = bars[bars.length - 1].c;
          const percentageChangeFromLastToCurrent = ((currentPrice - lastButOneClosingPrice) / lastButOneClosingPrice) * 100;

          oneDayStockPricesAndPercentages.push({
            symbol,
            lastButOneClosingPrice,
            percentageChangeFromLastToCurrent
          });

          console.log('oneDayStockPricesAndPercentages:', oneDayStockPricesAndPercentages);

          setStocks(prev => prev.map(s => 
            s.symbol === symbol 
              ? { ...s, price: lastButOneClosingPrice, change: percentageChangeFromLastToCurrent } 
              : s
          ));
        }
      } catch (err) {
        console.error(`Error in 1D logic for ${symbol}:`, err);
      }
    }
  }, []);

  const runATHLogic = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) return;

    const athStockPricesAndPercentages: Array<{
      symbol: string;
      athPrice: number;
      percentageChangeToATH: number;
    }> = [];

    const now = new Date();
    const eightyThreeMonthsAgo = new Date();
    eightyThreeMonthsAgo.setMonth(now.getMonth() - 83);
    const start = eightyThreeMonthsAgo.toISOString();
    const end = now.toISOString();

    for (const symbol of SP500_SYMBOLS) {
      try {
        const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1M&start=${start}&end=${end}&limit=100&adjustment=split&feed=iex&sort=asc`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const bars = data.bars?.[symbol];

        if (bars && bars.length > 0) {
          const athPrice = Math.max(...bars.map((b: any) => b.h));
          const currentPrice = bars[bars.length - 1].c;
          const percentageChangeToATH = currentPrice !== 0 ? ((athPrice - currentPrice) / currentPrice) * 100 : 0;

          athStockPricesAndPercentages.push({
            symbol,
            athPrice,
            percentageChangeToATH
          });

          console.log('athStockPricesAndPercentages:', athStockPricesAndPercentages);

          setStocks(prev => prev.map(s => 
            s.symbol === symbol 
              ? { ...s, price: athPrice, change: percentageChangeToATH } 
              : s
          ));
        }
      } catch (err) {
        console.error(`Error in ATH logic for ${symbol}:`, err);
      }
    }
  }, []);

  const runOneHourLogic = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) return;

    const oneHourStockPricesAndPercentages: Array<{
      symbol: string;
      lastButOneClosingPrice: number;
      percentageChangeFromLastToCurrent: number;
    }> = [];

    const now = new Date();
    const oneHundredHoursAgo = new Date();
    oneHundredHoursAgo.setHours(now.getHours() - 100);
    const start = oneHundredHoursAgo.toISOString();
    const end = now.toISOString();

    for (const symbol of SP500_SYMBOLS) {
      try {
        const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1H&start=${start}&end=${end}&limit=100&adjustment=raw&feed=iex&sort=asc`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const bars = data.bars?.[symbol];

        if (bars && bars.length >= 2) {
          const lastButOneClosingPrice = bars[bars.length - 2].c;
          const currentPrice = bars[bars.length - 1].c;
          const percentageChangeFromLastToCurrent = ((currentPrice - lastButOneClosingPrice) / lastButOneClosingPrice) * 100;

          oneHourStockPricesAndPercentages.push({
            symbol,
            lastButOneClosingPrice,
            percentageChangeFromLastToCurrent
          });

          console.log('oneHourStockPricesAndPercentages:', oneHourStockPricesAndPercentages);

          setStocks(prev => prev.map(s => 
            s.symbol === symbol 
              ? { ...s, price: lastButOneClosingPrice, change: percentageChangeFromLastToCurrent } 
              : s
          ));
        }
      } catch (err) {
        console.error(`Error in 1H logic for ${symbol}:`, err);
      }
    }
  }, []);

  // Handle persistent setup (initial load and WebSocket)
  useEffect(() => {
    fetchStockData(true);
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchStockData, connectWebSocket]);

  // Handle polling updates and progress bar, resets whenever activeTimeframe changes
  useEffect(() => {
    setProgress(0); // Trigger immediate refresh on timeframe change

    const pollInterval = setInterval(() => {
      setProgress(0);
      if (activeTimeframe === '1H') {
        runOneHourLogic();
      } else if (activeTimeframe === '1D') {
        runOneDayLogic();
      } else if (activeTimeframe === 'ATH') {
        runATHLogic();
      } else {
        fetchStockData(false);
      }
    }, 15000);

    const progressTimer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + (100 / 1500) : 0));
    }, 10);

    return () => {
      clearInterval(pollInterval);
      clearInterval(progressTimer);
    };
  }, [activeTimeframe, runOneHourLogic, runOneDayLogic, runATHLogic, fetchStockData]);

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
      const symbols = SP500_SYMBOLS.join(',');

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
      SP500_SYMBOLS.forEach(s => results[s] = {});

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

  // Filter and Search logic for the market list
  const filteredListSymbols = useMemo(() => {
    return SP500_SYMBOLS.filter(symbol => {
      const stock = stocks.find(s => s.symbol === symbol);
      const name = SYMBOL_NAMES[symbol] || '';
      const query = listSearchQuery.toLowerCase();
      
      const matchesSearch = symbol.toLowerCase().includes(query) || name.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (listFilter === 'gainers') return (stock?.change || 0) > 0;
      if (listFilter === 'losers') return (stock?.change || 0) < 0;
      return true;
    });
  }, [listSearchQuery, listFilter, stocks]);

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
    <div className="relative h-[100dvh] flex flex-col bg-black overflow-hidden">
      {/* Header Container */}
      <div className="bg-black p-2 sm:p-4 z-10 border-b border-gray-800 shrink-0"> {/* Adjusted padding for smaller screens */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-1 sm:px-2">
          {/* Left side: Title and Timeframes */}
          <div className="flex items-center gap-2 sm:gap-4"> {/* Grouping title and timeframes */}
            {/* Title - Hidden on mobile when searching */}
            <h1 className={`text-lg sm:text-2xl font-normal text-white whitespace-nowrap ${isSearchExpanded ? 'hidden md:block' : 'block'}`}>
              Alpha Bubbles
            </h1>

            {/* Timeframe Selector (Desktop Only) */}
            <div className="hidden md:flex items-center gap-1"> {/* Visible on medium screens and up */}
              {(['1H', '1D', '1W', '1M', '3M', '1Y', 'YTD', 'ATH'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setActiveTimeframe(tf);
                    setProgress(0);
                    if (tf === '1D') runOneDayLogic();
                    if (tf === '1H') runOneHourLogic();
                    if (tf === 'ATH') runATHLogic();
                  }}
                  className={`px-2 py-1 sm:px-3 rounded-md text-xs font-normal transition-colors ${
                    activeTimeframe === tf
                      ? 'bg-gray-700 text-white' // Active state styling
                      : 'text-gray-400 hover:text-white hover:bg-gray-800' // Inactive state styling
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Display Mode Toggle (Desktop) */}
            <div className="hidden md:flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setDisplayMode('change')}
                className={`px-2 py-1 sm:px-3 rounded-md text-[10px] font-normal transition-all ${
                  displayMode === 'change' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setDisplayMode('price')}
                className={`px-2 py-1 sm:px-3 rounded-md text-[10px] font-normal transition-all ${
                  displayMode === 'price' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                $
              </button>
            </div>
          </div>

          {/* Mobile Search View (Active) */}
          {isSearchExpanded && (
            <div className="flex items-center gap-2 w-full md:hidden">
              <button 
                onClick={() => {
                  setIsSearchExpanded(false);
                  setSearchTerm('');
                }}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-900 rounded-lg border border-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 text-white text-sm border border-gray-700 rounded-lg py-1.5 px-3 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Mobile Actions (Icons) - Hidden when searching */}
          {!isSearchExpanded && (
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setIsListOpen(true)}
                className="p-1.5 bg-gray-900 text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="View Market List"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-1.5 bg-gray-900 text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Open Search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop Controls - Always visible on larger screens */}
          <div className="hidden md:flex flex-row items-center gap-2 lg:gap-3 w-auto">
            <button
              onClick={() => setIsListOpen(true)}
              className="bg-gray-900 text-white border border-gray-700 rounded-lg py-1.5 px-4 sm:py-2 sm:px-6 text-sm sm:text-base font-normal hover:bg-gray-800 transition-colors"
            >
              List
            </button>
            <div className="relative w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 text-white text-sm sm:text-base border border-gray-700 rounded-lg py-1.5 px-3 sm:py-2 sm:px-4 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thin Progress Bar for Data Updates */}
      <div className="w-full h-0.5 bg-transparent overflow-hidden shrink-0">
        <div 
          className={`h-full ${progressBarColorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bubbles Container */}
      <div className="relative w-full flex-1 overflow-hidden">
        <BubbleCanvas stocks={stocks} onStockSelect={setSelectedStock} searchTerm={searchTerm} displayMode={displayMode} />

        {/* Market List Modal */}
        {isListOpen && (
          <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col p-2 sm:p-6 md:p-10">
            <div className="flex justify-between items-center mb-4 sm:mb-8 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-normal text-white tracking-tight">Market Overview</h2>
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

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search by name or ticker..."
                  value={listSearchQuery}
                  onChange={(e) => setListSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/50 transition-colors"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {listSearchQuery && (
                  <button 
                    onClick={() => setListSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-500 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800 self-start md:self-auto">
                {(['all', 'gainers', 'losers'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setListFilter(f)}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-normal transition-all uppercase tracking-widest ${
                      listFilter === f 
                        ? 'bg-gray-800 text-white shadow-lg' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/20">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 sticky top-0 z-10 shadow-lg">
                  <tr>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 whitespace-nowrap">Company / Ticker</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">Price</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1H Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1D Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1W Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1M Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">3M Close</th>
                    <th className="p-3 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1Y Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredListSymbols.map(symbol => {
                    const data = listHistoricalData[symbol] || {};
                    const currentStock = stocks.find(s => s.symbol === symbol);
                    return (
                      <tr key={symbol} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                        setSelectedStock(stocks.find(s => s.symbol === symbol) || null);
                        setIsListOpen(false);
                      }}>
                        <td className="p-3 sm:p-4">
                          <div className="text-white font-normal text-sm sm:text-base leading-tight">{currentStock?.name || symbol}</div>
                          <div className="text-gray-500 text-xs sm:text-sm leading-tight">{symbol}</div>
                        </td>
                        <td className="p-3 sm:p-4 text-white text-xs sm:text-sm text-right">
                          {currentStock ? `$${currentStock.price.toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1H'] ? `$${data['1H'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1D'] ? `$${data['1D'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1W'] ? `$${data['1W'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1M'] ? `$${data['1M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['3M'] ? `$${data['3M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1Y'] ? `$${data['1Y'].toFixed(2)}` : '---'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredListSymbols.length === 0 && !listLoading && (
                <div className="p-12 text-center text-gray-600 font-normal tracking-widest uppercase text-sm">
                  No stocks match your search or filter
                </div>
              )}
              {listLoading && (
                <div className="p-8 text-center text-gray-500 animate-pulse font-normal tracking-widest">
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
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 w-[95%] max-w-sm relative max-h-full overflow-y-auto"
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
                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight leading-tight mb-1">
                  {selectedStock.name}
                </h3>
                <p className="text-gray-500 text-base font-normal tracking-widest">{selectedStock.symbol}</p>
              </div>
              
              {/* Real-time Historical Chart */}
              <div className="h-40 w-full bg-black/40 rounded-xl mb-8 border border-gray-800 relative overflow-hidden flex flex-col">
                <StockChart 
                  symbol={selectedStock.symbol} 
                  color={selectedStock.change >= 0 ? '#00ff00' : '#ff0000'} 
                />
                <span className="text-gray-600 text-[10px] font-normal uppercase tracking-widest text-center py-2 border-t border-gray-800 bg-black/20 relative z-10">
                  30-Day Price Trend
                </span>
              </div>

              <div className="space-y-6">
                {/* Historical Prices Grid */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 border-b border-gray-800 pb-6">
                  {(['1H', '1D', '1W', '1M', '3M', '1Y'] as const).map((label) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-gray-500 text-[10px] font-normal uppercase tracking-widest mb-0.5">{label} Close</span>
                      <span className="text-sm text-white font-normal">
                        {typeof historicalPrices[label] === 'number' ? `$${historicalPrices[label]?.toFixed(2)}` : '---'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col border-b border-gray-800 pb-6">
                  <span className="text-gray-500 text-xs font-normal uppercase tracking-widest mb-1">Current Price</span>
                  <span className="text-5xl text-white font-normal leading-none">
                    ${selectedStock.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-normal uppercase tracking-widest">24h Change</span>
                  <span className={`text-3xl font-normal ${selectedStock.change >= 0 ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                  </span>
                </div>

                <div className="pt-4">
                  <p className="text-gray-600 text-[10px] font-normal uppercase tracking-[0.2em] text-center">
                    Market Cap: ${(selectedStock.marketCap / 1000000000000).toFixed(2)}T
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Footer with Timeframes */}
      <div className="md:hidden bg-black p-2 z-20 border-t border-gray-800 shrink-0">
        <div className="flex items-center justify-between px-4">
          <div className="relative">
            <button
              onClick={() => setIsTimeframeMenuOpen(!isTimeframeMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-normal uppercase tracking-widest rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <span>TF: {activeTimeframe}</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${isTimeframeMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isTimeframeMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30">
                {(['1H', '1D', '1W', '1M', '3M', '1Y', 'YTD', 'ATH'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setActiveTimeframe(tf);
                      setProgress(0);
                      setIsTimeframeMenuOpen(false);
                      if (tf === '1D') runOneDayLogic();
                      if (tf === '1H') runOneHourLogic();
                      if (tf === 'ATH') runATHLogic();
                    }}
                    className={`w-full text-left px-4 py-2 text-[10px] font-normal uppercase tracking-widest transition-colors ${
                      activeTimeframe === tf 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Display Mode Toggle (Mobile) */}
          <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => { setDisplayMode('change'); setIsTimeframeMenuOpen(false); }}
              className={`px-3 py-1 rounded-md text-[10px] font-normal transition-all ${
                displayMode === 'change' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              %
            </button>
            <button
              onClick={() => setDisplayMode('price')}
              className={`px-3 py-1 rounded-md text-[10px] font-normal transition-all ${
                displayMode === 'price' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              $
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
