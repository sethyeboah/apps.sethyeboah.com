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
  lastUpdated?: Date; // Timestamp when this stock's data was last updated
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
  'SNDK': 'SanDisk Corporation',
  'RKLB': 'Rocket Lab USA, Inc.',
  'PL': 'Planet Labs PBC',
  'LUNR': 'Intuitive Machines, Inc.',
  'RDW': 'Redwire Corporation',
  'NOW': 'ServiceNow, Inc.',
  'NBIS': 'Nebius Group N.V.',
  'CBRS': 'Cerebras Systems',
  'GLW': 'Corning Incorporated',
  'IREN': 'IREN Ltd',
  'GFS': 'GlobalFoundries Inc.',
  'INFQ': 'Infleqtion', // Assuming this is a placeholder or specific to your context
  'NOK': 'Nokia',
  'SATS': 'EchoStar Corporation',
  'BKSY': 'BlackSky Technology Inc.',
  'FLY': 'Firefly Aerospace', // Note: Firefly is private, ticker is illustrative
  'SPCX': 'SpaceX', // Note: SpaceX is private, ticker is illustrative
  'SKHY': 'SK Hynix Inc.'
};

const SP500_SYMBOLS = Object.keys(SYMBOL_NAMES);

/**
 * Sector to ETF Configuration
 * Maps market sectors to their corresponding ETF ticker symbols for Alpaca snapshots.
 */
interface SectorETFItem {
  sector: string;
  symbol: string;
}

const SECTOR_ETFS: readonly SectorETFItem[] = [
  { sector: 'Semiconductor', symbol: 'SMH' },
  { sector: 'Space', symbol: 'NASA' },
  { sector: 'Memory', symbol: 'DRAM' },
  { sector: 'Cybersecurity', symbol: 'CIBR' },
  { sector: 'Database', symbol: 'SKYY' },
  { sector: 'Software', symbol: 'IGV' },
  { sector: 'Information Technology', symbol: 'VGT' },
  { sector: 'S&P500', symbol: 'SPY' },
  { sector: 'Nasdaq 100', symbol: 'QQQ' },
  { sector: 'Industrials', symbol: 'XLI' },
  { sector: 'Consumer Discretionary', symbol: 'XLY' },
  { sector: 'Energy', symbol: 'XLE' },
  { sector: 'Health Care', symbol: 'XLV' },
  { sector: 'Utilities', symbol: 'XLU' },
  { sector: 'Materials', symbol: 'XLB' },
  { sector: 'Real Estate', symbol: 'XLRE' },
  { sector: 'Financials', symbol: 'XLF' },
  { sector: 'Consumer Staples', symbol: 'XLP' },
];

/**
 * Sector Performance Data Interface
 * Stores daily price, previous close, and performance percentage.
 */
interface SectorPerformance {
  sector: string;
  symbol: string;
  price: number;
  prevClose: number;
  changePercent: number;
  changeAmount: number;
}

export default function StockBubbles() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const lastMatchedTermRef = useRef('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'bubbles' | 'table' | 'bars'>('bubbles');
  const [activeMenu, setActiveMenu] = useState<'news' | 'sectors' | null>(null);

  // Counter state: Number of stock bubbles redrawn out of total stocks
  const [redrawnStockCount, setRedrawnStockCount] = useState<number>(0);

  // Timestamp of the most recent stock data/bubble update
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Sector Performance States
  const [sectorsData, setSectorsData] = useState<SectorPerformance[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [sectorsError, setSectorsError] = useState<string | null>(null);
  const [sectorRetryCount, setSectorRetryCount] = useState(0);
  const [sectorsSearch, setSectorsSearch] = useState('');
  const [sectorsSort, setSectorsSort] = useState<'default' | 'performance' | 'name'>('performance');
  const [sectorsFilter, setSectorsFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sectorsLastUpdated, setSectorsLastUpdated] = useState<Date | null>(null);

  // References for Auto-Refresh (10s) and Retry Timers
  const sectorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectorRetryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeMenuRef = useRef(activeMenu);

  // Keep activeMenuRef updated to safely check panel visibility in async timers
  useEffect(() => {
    activeMenuRef.current = activeMenu;
  }, [activeMenu]);
  const [isTimeframeMenuOpen, setIsTimeframeMenuOpen] = useState(false);
  // Default to 'Live' time frame when the app initially loads
  const [activeTimeframe, setActiveTimeframe] = useState<string>('Live');
  const [displayMode, setDisplayMode] = useState<'change' | 'price'>('change');
  const [listFilter, setListFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const activeTimeframeRef = useRef(activeTimeframe);

  // AbortController ref to cancel any pending API calls whenever a timeframe changes or on unmount
  const timeframeAbortControllerRef = useRef<AbortController | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [historicalPrices, setHistoricalPrices] = useState<Record<string, number | null>>({});
  const [listHistoricalData, setListHistoricalData] = useState<Record<string, Record<string, number | null>>>({});

  // Synchronize ref with current active timeframe state
  useEffect(() => {
    activeTimeframeRef.current = activeTimeframe;
  }, [activeTimeframe]);

  const fetchStockData = useCallback(async (isInitial = false, signal?: AbortSignal) => {
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

      if (signal?.aborted) return;

      const symbols = SP500_SYMBOLS.join(',');
      const response = await fetch(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols}`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
        signal,
      });

      if (signal?.aborted) return;
      if (!response.ok) throw new Error('Failed to fetch market snapshots');

      const snapshots = await response.json();
      if (signal?.aborted) return;

      const updatedStocks: Stock[] = SP500_SYMBOLS.map(symbol => {
        const snapshot = snapshots[symbol];
        const price = snapshot?.latestTrade?.p || 0;
        const prevClose = snapshot?.prevDailyBar?.c || price;
        const change = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;
        // Set initial lastUpdated time for each stock
        const currentUpdateTime = new Date();

        return {
          symbol,
          name: SYMBOL_NAMES[symbol] || symbol,
          price,
          change,
          prevClose,
          marketCap: 1000000000000,
          lastUpdated: currentUpdateTime // Store the initial update time for this stock
        };
      });

      setStocks(updatedStocks);
      setLastUpdateTime(new Date());
      setError(null);
      if (isInitial) {
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        // Request was aborted due to timeframe switch, ignore cleanly
        return;
      }
      console.error('Error fetching market snapshots:', err);
      if (isInitial) {
        // Automatically retry after 2 seconds if initial fetch fails
        setTimeout(() => fetchStockData(true), 2000);
      }
    }
  }, []);

  /**
   * Fetch Sector ETFs Snapshots from Alpaca API with:
   * 1. Live automatic refresh every 10 seconds.
   * 2. Continuous retry on failure (every 3 seconds) until valid data is returned.
   */
  const fetchSectorData = useCallback(async (isAutoRefresh = false) => {
    // Clear any existing pending retry timer before initiating a new request
    if (sectorRetryTimerRef.current) {
      clearTimeout(sectorRetryTimerRef.current);
      sectorRetryTimerRef.current = null;
    }

    // Only proceed if the Sectors panel is currently active
    if (activeMenuRef.current !== 'sectors') {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;

    if (!apiKey || !secretKey) {
      setSectorsError('Alpaca API keys are not configured in environment variables.');
      setSectorsLoading(false);
      return;
    }

    setSectorsLoading(true);

    try {
      const symbolsQuery = SECTOR_ETFS.map((item) => item.symbol).join(',');
      const response = await fetch(
        `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbolsQuery}`,
        {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Alpaca rate limit reached (429). Retrying automatically in 3s...');
        }
        throw new Error(`Failed to fetch sector data from Alpaca (HTTP ${response.status}). Retrying...`);
      }

      const snapshots = await response.json();

      if (snapshots && snapshots.message) {
        throw new Error(`Alpaca API notice: ${snapshots.message}. Retrying...`);
      }

      // Verify that at least one valid sector ETF was returned
      const hasValidData = SECTOR_ETFS.some((item) => snapshots[item.symbol]);
      if (!hasValidData) {
        throw new Error('No valid snapshot data returned for sector ETFs. Retrying...');
      }

      const parsedSectors: SectorPerformance[] = SECTOR_ETFS.map((item) => {
        const snapshot = snapshots[item.symbol];
        const currentPrice =
          snapshot?.latestTrade?.p ||
          snapshot?.minuteBar?.c ||
          snapshot?.dailyBar?.c ||
          0;
        const prevDayClose = snapshot?.prevDailyBar?.c || currentPrice;
        const changePercent =
          prevDayClose !== 0 ? ((currentPrice - prevDayClose) / prevDayClose) * 100 : 0;
        const changeAmount = currentPrice - prevDayClose;

        return {
          sector: item.sector,
          symbol: item.symbol,
          price: currentPrice,
          prevClose: prevDayClose,
          changePercent,
          changeAmount,
        };
      });

      // Successful fetch - store data, clear errors, reset retry count, and stop retrying
      setSectorsData(parsedSectors);
      setSectorsLastUpdated(new Date());
      setSectorsError(null);
      setSectorRetryCount(0);
      setSectorsLoading(false);
    } catch (err: any) {
      console.error('Error fetching Alpaca sector data:', err);
      const errorMessage = err?.message || 'Failed to load sector performance from Alpaca. Retrying...';
      setSectorsError(errorMessage);
      setSectorRetryCount((prev) => prev + 1);
      setSectorsLoading(false);

      // Continuously retry after 3 seconds until sector data is successfully returned
      if (activeMenuRef.current === 'sectors') {
        sectorRetryTimerRef.current = setTimeout(() => {
          fetchSectorData();
        }, 3000);
      }
    }
  }, []);

  /**
   * Automatic 10-Second Refresh & Lifecycle Management for Sectors Panel:
   * - Performs initial data fetch when Sectors panel is opened.
   * - Automatically polls & refreshes every 10 seconds while the panel remains active.
   * - Safely cleans up all intervals and retry timers when the panel is closed or unmounted.
   */
  useEffect(() => {
    if (activeMenu === 'sectors') {
      // 1. Initial fetch if we don't have sector data yet
      if (sectorsData.length === 0 && !sectorsLoading) {
        fetchSectorData();
      }

      // 2. Set up recurring 10-second auto-refresh interval
      sectorIntervalRef.current = setInterval(() => {
        if (activeMenuRef.current === 'sectors') {
          fetchSectorData(true);
        }
      }, 10000); // 10,000 milliseconds = 10 seconds
    } else {
      // Clear interval and retry timers if Sectors panel is closed
      if (sectorIntervalRef.current) {
        clearInterval(sectorIntervalRef.current);
        sectorIntervalRef.current = null;
      }
      if (sectorRetryTimerRef.current) {
        clearTimeout(sectorRetryTimerRef.current);
        sectorRetryTimerRef.current = null;
      }
      setSectorRetryCount(0);
    }

    return () => {
      // Cleanup timers when component unmounts or activeMenu changes
      if (sectorIntervalRef.current) {
        clearInterval(sectorIntervalRef.current);
        sectorIntervalRef.current = null;
      }
      if (sectorRetryTimerRef.current) {
        clearTimeout(sectorRetryTimerRef.current);
        sectorRetryTimerRef.current = null;
      }
    };
  }, [activeMenu, fetchSectorData]);

  // Maximum absolute change percent for normalizing bar widths (like the main bars view)
  const maxSectorAbsChange = useMemo(() => {
    const absValues = sectorsData.map((s) => Math.abs(s.changePercent));
    const max = Math.max(...absValues, 0.1);
    return max;
  }, [sectorsData]);

  // Filtered and sorted sector performance list for rendering
  const displayedSectors = useMemo(() => {
    let list = [...sectorsData];

    // Filter by search query
    if (sectorsSearch.trim()) {
      const query = sectorsSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.sector.toLowerCase().includes(query) ||
          s.symbol.toLowerCase().includes(query)
      );
    }

    // Filter by Gainers / Losers tab
    if (sectorsFilter === 'gainers') {
      list = list.filter((s) => s.changePercent >= 0);
    } else if (sectorsFilter === 'losers') {
      list = list.filter((s) => s.changePercent < 0);
    }

    // Sort by selected criteria
    if (sectorsSort === 'performance') {
      list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (sectorsSort === 'name') {
      list.sort((a, b) => a.sector.localeCompare(b.sector));
    }

    return list;
  }, [sectorsData, sectorsSearch, sectorsFilter, sectorsSort]);

  // ---------------------------------------------------------------------------
  // Alpaca REST API Logic & Polling
  // Note: All real-time market data is fetched via Alpaca REST API endpoints.
  // WebSocket streaming has been removed in favor of periodic REST snapshots & polling.
  // ---------------------------------------------------------------------------

  /**
   * Ref flag to ensure bubbles are cleared only once on initial selection/load,
   * rather than clearing all bubbles on every subsequent recurring refresh.
   */
  const hasClearedCanvasForLiveRef = useRef(false);

  /**
   * liveStockPricesAndPercentages:
   * Function executed when "Live" timeframe is selected.
   * Performs real-time calculation and redraws of stock bubbles.
   *
   * Lifecycle & Iteration Steps:
   *  1. Ends all existing and pending API calls via AbortController signal.
   *  2. Clears all stock bubbles in the canvas only once on entry.
   *  3. Runs an endless while loop that breaks only when active timeframe changes or abort signal is received.
   *  4. Inside, runs a 60-second iteration loop (breaks after 60s or when timeframe changes).
   *  5. Iterates through the stock list (retrying failed tickers first, then the rest):
   *     a. Fetches 1D bars (most recent and previous) to determine lastDaysClose based on market hours:
   *        - During market hours (9:30AM - 4:00PM EST): use previous 1D close as lastDaysClose
   *        - Outside market hours: use most recent 1D close as lastDaysClose
   *     b. Fetches 1Min bar close for currentPrice with feed based on time:
   *        - Overnight (8:00PM - 4:00AM EST): feed=boats, limit=1000
   *        - Day (4:00AM - 8:00PM EST): feed=sip, limit=100
   *     c. On error: records ticker in failedAPICallTickers array, logs to console, and moves to next stock.
   *     d. Computes percentage change: ((currentPrice - lastDaysClose) / lastDaysClose) * 100 -> percentageChangeFromLastToCurrent.
   *     e. Stores { symbol, lastDaysClose, percentageChangeFromLastToCurrent } in liveStockPricesAndPercentages array.
   *     f. Prints liveStockPricesAndPercentages array to console.
   *     g. Redraws the bubble with size per percentageChangeFromLastToCurrent.
   *     h. Increments redrawn counter by 1 (up to total stocks).
   *     i. Displays lastDaysClose as bubble price.
   *     j. Displays percentageChangeFromLastToCurrent as bubble percentage.
   *     k. Updates the lastUpdated timestamp for this stock in the stock modal.
   *     l. Repeats until all stocks in current pass are processed.
   *  6. In subsequent 60-second sequences:
   *     FIRST: Retry all tickers in failedAPICallTickers array (re-run full step 5: API calls, calculations, redraws)
   *     THEN:  Process all remaining stocks to pull fresh data and update existing bubbles (re-run full step 5)
   *  7. Updates the timestamp in the Last Update Time Indicator Box.
   */
  const liveStockPricesAndPercentages = useCallback(async (isInitial = false, signal?: AbortSignal) => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) {
      if (isInitial) {
        setError('Alpaca API keys are not configured. Please check environment variables.');
        setLoading(false);
      }
      console.warn('Alpaca API keys are missing for liveStockPricesAndPercentages');
      return;
    }

    // Step 1: Any prior pending API calls were aborted by the controller before this function was invoked.
    if (signal?.aborted) return;

    // Step 2: Clear all stock bubbles in the canvas ONLY ONCE
    setStocks([]);
    hasClearedCanvasForLiveRef.current = true;

    // Helper sleep utility that respects abort signal cancellations immediately
    const sleepWithAbort = (ms: number) =>
      new Promise<void>((resolve) => {
        if (signal?.aborted) return resolve();
        const timer = setTimeout(() => resolve(), ms);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });

    /**
     * Helper: Check if current time (in EST) is within regular market hours (9:30 AM - 4:00 PM EST)
     * @returns true if current EST time is between 9:30 AM and 4:00 PM
     */
    const isMarketHours = (): boolean => {
      const now = new Date();
      // Convert to EST (UTC-5 or UTC-4 during DST)
      // Using toLocaleString with timeZone to get EST time components
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
      return totalMinutes >= 570 && totalMinutes < 960;
    };

    /**
     * Helper: Check if current time (in EST) is within overnight hours (8:00 PM - 4:00 AM EST)
     * @returns true if current EST time is between 8:00 PM and 4:00 AM
     */
    const isOvernightHours = (): boolean => {
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = estTime.getHours();
      // Overnight: 8:00 PM (20) to 4:00 AM (4)
      return hours >= 20 || hours < 4;
    };

    // Array to record tickers whose API calls fail, for retrying in the subsequent 60-second sequence
    let failedAPICallTickers: string[] = [];

    // Step 3: Endless while loop which only breaks when a new timeframe is selected (or component unmounts)
    while (!signal?.aborted && activeTimeframeRef.current === 'Live') {
      const loopStartTime = Date.now();
      const SIXTY_SECONDS_MS = 60 * 1000;

      // ============================================================
      // Step 6: In the next 60-second sequence:
      //   FIRST: Retry all tickers in failedAPICallTickers array
      //          (re-run full step 5: API calls, calculations, redraws)
      //   THEN:  Process all remaining stocks to pull fresh data
      //          and update existing bubbles (re-run full step 5)
      // ============================================================
      let symbolsToProcess: string[];
      if (failedAPICallTickers.length > 0) {
        const failedSet = new Set(failedAPICallTickers);
        const remainingSymbols = SP500_SYMBOLS.filter((s) => !failedSet.has(s));
        // Priority 1: Failed tickers from previous sequence (retry with full step 5 logic)
        // Priority 2: All other stocks (pull new data and update bubbles with full step 5 logic)
        symbolsToProcess = [...failedAPICallTickers, ...remainingSymbols];
      } else {
        // First sequence or no failures: process all stocks with full step 5 logic
        symbolsToProcess = [...SP500_SYMBOLS];
      }

      // Reset failed tickers list for the new sequence pass
      // (will be repopulated during this sequence if any API calls fail)
      failedAPICallTickers = [];

      // Array holding stock prices and percentage changes for logging
      const liveStockPricesAndPercentagesArray: Array<{
        symbol: string;
        lastDaysClose: number;
        percentageChangeFromLastToCurrent: number;
      }> = [];

      // Step 4: Inner loop that breaks after 60 seconds or if a new timeframe is selected
      // This loop executes the FULL step 5 logic for each symbol in priority order
      for (const symbol of symbolsToProcess) {
        // Break out immediately if new timeframe selected or aborted
        if (signal?.aborted || activeTimeframeRef.current !== 'Live') {
          break;
        }

        // Break out of current stock iteration if 60 seconds have elapsed
        if (Date.now() - loopStartTime >= SIXTY_SECONDS_MS) {
          console.log('60 seconds elapsed in live sequence; breaking into next sequence.');
          break;
        }

        try {
          // Dynamic timestamps for API queries:
          // End time: current time minus 16 minutes (to avoid delayed data)
          const now = new Date();
          const endTime = new Date(now.getTime() - 16 * 60 * 1000);
          const endStr = endTime.toISOString();

          // Start time for 1D bars: 30 days ago from end time
          const thirtyDaysAgo = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
          const start30DaysStr = thirtyDaysAgo.toISOString();

          // Start time for 1Min bars: 5 days ago from end time
          const fiveDaysAgo = new Date(endTime.getTime() - 5 * 24 * 60 * 60 * 1000);
          const start5DaysStr = fiveDaysAgo.toISOString();

          // ------------------------------------------------------------
          // Step 5a: Get most recent AND previous one day close (1D bars)
          // We need 2 bars: index 0 = most recent, index 1 = previous
          // ------------------------------------------------------------
          const dailyUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1D&start=${start30DaysStr}&end=${endStr}&limit=30&adjustment=all&feed=sip&sort=desc`;
          const dailyResponse = await fetch(dailyUrl, {
            headers: {
              'APCA-API-KEY-ID': apiKey,
              'APCA-API-SECRET-KEY': secretKey,
            },
            signal,
          });

          if (signal?.aborted || activeTimeframeRef.current !== 'Live') break;

          if (!dailyResponse.ok) {
            throw new Error(`Daily bars request failed for ${symbol}: HTTP ${dailyResponse.status}`);
          }

          const dailyData = await dailyResponse.json();
          if (signal?.aborted || activeTimeframeRef.current !== 'Live') break;

          const dailyBars = dailyData.bars?.[symbol];
          if (!dailyBars || dailyBars.length < 2) {
            throw new Error(`Need at least 2 daily bars for ${symbol}, got ${dailyBars?.length ?? 0}`);
          }

          // With sort=desc:
          // index 0 = most recent daily bar (today's close if market closed, or latest available)
          // index 1 = previous daily bar (yesterday's close)
          const mostRecentDailyClose: number = dailyBars[0].c;
          const previousDailyClose: number = dailyBars[1].c;

          // Determine lastDaysClose based on market hours:
          // - During market hours (9:30AM - 4:00PM EST): use previous day's close
          // - Outside market hours: use most recent day's close
          const lastDaysClose: number = isMarketHours() ? previousDailyClose : mostRecentDailyClose;

          // ------------------------------------------------------------
          // Step 5b/5c: Get most recent close from 1Min bars
          // Feed and limit depend on time of day:
          // - Overnight (8:00PM - 4:00AM EST): feed=boats, limit=1000
          // - Day (4:00AM - 8:00PM EST): feed=sip, limit=100
          // ------------------------------------------------------------
          const isOvernight = isOvernightHours();
          const minuteFeed = isOvernight ? 'boats' : 'sip';
          const minuteLimit = isOvernight ? 1000 : 100;

          const minuteUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1Min&start=${start5DaysStr}&end=${endStr}&limit=${minuteLimit}&adjustment=all&feed=${minuteFeed}&sort=desc`;
          const minuteResponse = await fetch(minuteUrl, {
            headers: {
              'APCA-API-KEY-ID': apiKey,
              'APCA-API-SECRET-KEY': secretKey,
            },
            signal,
          });

          if (signal?.aborted || activeTimeframeRef.current !== 'Live') break;

          if (!minuteResponse.ok) {
            throw new Error(`Minute bars request failed for ${symbol}: HTTP ${minuteResponse.status}`);
          }

          const minuteData = await minuteResponse.json();
          if (signal?.aborted || activeTimeframeRef.current !== 'Live') break;

          const minuteBars = minuteData.bars?.[symbol];
          if (!minuteBars || minuteBars.length === 0) {
            throw new Error(`No 1Min bars found for ${symbol}`);
          }

          // With sort=desc, index 0 is the most recent minute bar
          const currentPrice: number = minuteBars[0].c;

          // Step 5d: Calculate percentage change from lastDaysClose to currentPrice
          const percentageChangeFromLastToCurrent: number =
            lastDaysClose !== 0
              ? ((currentPrice - lastDaysClose) / lastDaysClose) * 100
              : 0;

          // Step 5e: Store in liveStockPricesAndPercentages array
          liveStockPricesAndPercentagesArray.push({
            symbol,
            lastDaysClose,
            percentageChangeFromLastToCurrent,
          });

          // Step 5f: Print to console the array liveStockPricesAndPercentages
          console.log('liveStockPricesAndPercentages:', liveStockPricesAndPercentagesArray);

          if (signal?.aborted || activeTimeframeRef.current !== 'Live') break;

          // Step 5g, 5i, 5j: Redraw bubble with updated price (lastDaysClose) and percentage (percentageChangeFromLastToCurrent)
          // Step 5k: Update the Last Updated Time for this specific stock in the modal
          const currentUpdateTime = new Date();
          setStocks((prevStocks) => {
            const updatedStockItem: Stock = {
              symbol,
              name: SYMBOL_NAMES[symbol] || symbol,
              price: lastDaysClose,
              change: percentageChangeFromLastToCurrent,
              prevClose: lastDaysClose,
              marketCap: 1000000000000,
              lastUpdated: currentUpdateTime, // Store the update time for this stock
            };

            const existingIndex = prevStocks.findIndex((s) => s.symbol === symbol);
            if (existingIndex >= 0) {
              const nextList = [...prevStocks];
              nextList[existingIndex] = updatedStockItem;
              return nextList;
            }
            return [...prevStocks, updatedStockItem];
          });

          // Step 5h: Increase redrawn counter by 1 unless already at total stocks
          setRedrawnStockCount((prev) => (prev < SP500_SYMBOLS.length ? prev + 1 : SP500_SYMBOLS.length));

          // Step 7: Update time in the Last Update Time Indicator Box
          setLastUpdateTime(new Date());

          if (isInitial) {
            setError(null);
            setLoading(false);
          }
        } catch (stockError: any) {
          if (stockError?.name === 'AbortError' || signal?.aborted || activeTimeframeRef.current !== 'Live') {
            return;
          }

          // Step 5c: If API call fails, record ticker in failedAPICallTickers, print to console, and proceed to next stock
          if (!failedAPICallTickers.includes(symbol)) {
            failedAPICallTickers.push(symbol);
          }
          console.warn(`Error processing live data for ${symbol}:`, stockError?.message || stockError);
          console.log('failedAPICallTickers:', failedAPICallTickers);
        }
      }

      // Check if 60 seconds have elapsed; if not, wait out the remainder of the 60s window before starting next sequence
      const elapsed = Date.now() - loopStartTime;
      if (elapsed < SIXTY_SECONDS_MS && !signal?.aborted && activeTimeframeRef.current === 'Live') {
        await sleepWithAbort(SIXTY_SECONDS_MS - elapsed);
      }
    }

    if (isInitial) {
      setLoading(false);
    }
  }, []);

  /**
   * runOneDayLogic — Called when "1D" timeframe is selected.
   *
   * Performs percentage change calculation comparing the most recent 1D bar close (currentPrice)
   * to the previous 1D bar close (lastDaysClose) for each stock.
   *
   * Flow:
   *  1. Aborts if signal already cancelled. Canvas was already cleared by handleTimeframeChange.
   *  2. Clears all stock bubbles in the canvas once.
   *  3. Endless while loop: breaks only when a new timeframe is selected or signal aborted.
   *  4. Inner for-loop: breaks after 60 seconds or when a new timeframe is selected.
   *  5. For each stock:
   *     a. Fetches 1D bars (sort=desc), index 0 = most recent = currentPrice, index 1 = previous = lastDaysClose.
   *     b. On API failure, records ticker in failedAPICallTickers for retry next pass.
   *     c. Calculates percentage change: ((currentPrice - lastDaysClose) / lastDaysClose) * 100.
   *     d. Stores result in liveStockPricesAndPercentages array.
   *     e. Prints liveStockPricesAndPercentages to console.
   *     f. Redraws bubble with size per percentageChangeFromLastToCurrent.
   *     g. Increments redrawn counter by 1 (up to total stocks).
   *     h. Displays lastDaysClose as bubble price.
   *     i. Displays percentageChangeFromLastToCurrent as bubble percentage.
   *    j. Updates the lastUpdated timestamp for this stock in the stock modal.
   *     j. Repeats until all stocks in current pass are processed.
   *  6. In subsequent 60-second sequences, retries failed tickers first before other stocks.
   *  7. Updates the timestamp in the Last Update Time Indicator Box.
   */
  const runOneDayLogic = useCallback(async (signal?: AbortSignal) => {
    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
    if (!apiKey || !secretKey) {
      console.warn('Alpaca API keys are missing for runOneDayLogic');
      return;
    }

    // Step 1: Check if signal was already aborted before starting
    if (signal?.aborted) return;

    // Step 2: Clear all stock bubbles in the canvas ONLY ONCE
    setStocks([]);

    // Helper: sleep that resolves immediately when the abort signal fires
    const sleepWithAbort = (ms: number) =>
      new Promise<void>((resolve) => {
        if (signal?.aborted) return resolve();
        const timer = setTimeout(() => resolve(), ms);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });

    // Array to record tickers whose API calls fail, for retrying in the subsequent 60-second sequence
    let failedAPICallTickers: string[] = [];

    // Step 3: Endless while loop — only breaks when a new timeframe is selected or signal is aborted
    while (!signal?.aborted && activeTimeframeRef.current === '1D') {
      const loopStartTime = Date.now();
      const SIXTY_SECONDS_MS = 60 * 1000;

      // Step 6: Determine execution queue for this 60-second sequence:
      // First retry any failed tickers from previous pass, followed by remaining tickers
      let symbolsToProcess: string[];
      if (failedAPICallTickers.length > 0) {
        const failedSet = new Set(failedAPICallTickers);
        const remainingSymbols = SP500_SYMBOLS.filter((s) => !failedSet.has(s));
        symbolsToProcess = [...failedAPICallTickers, ...remainingSymbols];
      } else {
        symbolsToProcess = [...SP500_SYMBOLS];
      }

      // Reset failed tickers list for the new sequence pass
      failedAPICallTickers = [];

      // Array holding stock prices and percentage changes for logging
      const liveStockPricesAndPercentages: Array<{
        symbol: string;
        lastDaysClose: number;
        percentageChangeFromLastToCurrent: number;
      }> = [];

      // Step 4: Inner loop that breaks after 60 seconds or if a new timeframe is selected
      for (const symbol of symbolsToProcess) {
        // Break out immediately if new timeframe selected or aborted
        if (signal?.aborted || activeTimeframeRef.current !== '1D') {
          break;
        }

        // Break out of current stock iteration if 60 seconds have elapsed
        if (Date.now() - loopStartTime >= SIXTY_SECONDS_MS) {
          console.log('60 seconds elapsed in 1D sequence; breaking into next sequence.');
          break;
        }

        try {
          // Dynamic timestamps for API query:
          // End time: current time minus 16 minutes
          const now = new Date();
          const endTime = new Date(now.getTime() - 16 * 60 * 1000);
          const endStr = endTime.toISOString();

          // Start time for 1D bars: 30 days ago from end time
          const thirtyDaysAgo = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
          const start30DaysStr = thirtyDaysAgo.toISOString();

          // Step 5a: Get the most recent and previous one day close (1D bars, sort=desc)
          const dailyUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1D&start=${start30DaysStr}&end=${endStr}&limit=30&adjustment=all&feed=sip&sort=desc`;
          const dailyResponse = await fetch(dailyUrl, {
            headers: {
              'APCA-API-KEY-ID': apiKey,
              'APCA-API-SECRET-KEY': secretKey,
            },
            signal,
          });

          if (signal?.aborted || activeTimeframeRef.current !== '1D') break;

          if (!dailyResponse.ok) {
            throw new Error(`Daily bars request failed for ${symbol}: HTTP ${dailyResponse.status}`);
          }

          const dailyData = await dailyResponse.json();
          if (signal?.aborted || activeTimeframeRef.current !== '1D') break;

          const dailyBars = dailyData.bars?.[symbol];
          if (!dailyBars || dailyBars.length < 2) {
            throw new Error(`Need at least 2 daily bars for ${symbol}, got ${dailyBars?.length ?? 0}`);
          }

          // With sort=desc: index 0 = most recent = currentPrice, index 1 = previous = lastDaysClose
          const currentPrice: number = dailyBars[0].c;
          const lastDaysClose: number = dailyBars[1].c;

          // Step 5c: Calculate percentage change from lastDaysClose to currentPrice
          const percentageChangeFromLastToCurrent: number =
            lastDaysClose !== 0
              ? ((currentPrice - lastDaysClose) / lastDaysClose) * 100
              : 0;

          // Step 5d: Store in liveStockPricesAndPercentages array
          liveStockPricesAndPercentages.push({
            symbol,
            lastDaysClose,
            percentageChangeFromLastToCurrent,
          });

          // Step 5e: Print to console the array liveStockPricesAndPercentages
          console.log('liveStockPricesAndPercentages (1D):', liveStockPricesAndPercentages);

          if (signal?.aborted || activeTimeframeRef.current !== '1D') break;

          // Step 5f, 5h, 5i: Redraw bubble with updated price (lastDaysClose) and percentage (percentageChangeFromLastToCurrent)
          // Step 5j: Update the Last Updated Time for this specific stock in the modal
          const currentUpdateTime = new Date();
          setStocks((prevStocks) => {
            const updatedStockItem: Stock = {
              symbol,
              name: SYMBOL_NAMES[symbol] || symbol,
              price: lastDaysClose,                           // Step 5h: bubble price = lastDaysClose
              change: percentageChangeFromLastToCurrent,      // Step 5i: bubble percentage = percentageChangeFromLastToCurrent
              prevClose: lastDaysClose,
              marketCap: 1000000000000,
              lastUpdated: currentUpdateTime, // Store the update time for this stock
            };

            const existingIndex = prevStocks.findIndex((s) => s.symbol === symbol);
            if (existingIndex >= 0) {
              const nextList = [...prevStocks];
              nextList[existingIndex] = updatedStockItem;
              return nextList;
            }
            return [...prevStocks, updatedStockItem];
          });

          // Step 5g: Increase redrawn counter by 1 unless already at total stocks
          setRedrawnStockCount((prev) => (prev < SP500_SYMBOLS.length ? prev + 1 : SP500_SYMBOLS.length));

          // Step 7: Update time in the Last Update Time Indicator Box
          setLastUpdateTime(new Date());
        } catch (stockError: any) {
          if (stockError?.name === 'AbortError' || signal?.aborted || activeTimeframeRef.current !== '1D') {
            return;
          }

          // Step 5b: If API call fails, record ticker in failedAPICallTickers, print to console, and proceed to next stock
          if (!failedAPICallTickers.includes(symbol)) {
            failedAPICallTickers.push(symbol);
          }
          console.warn(`Error processing 1D data for ${symbol}:`, stockError?.message || stockError);
          console.log('failedAPICallTickers (1D):', failedAPICallTickers);
        }
      }

      // Wait out the remainder of the 60-second window before starting next sequence
      const elapsed = Date.now() - loopStartTime;
      if (elapsed < SIXTY_SECONDS_MS && !signal?.aborted && activeTimeframeRef.current === '1D') {
        await sleepWithAbort(SIXTY_SECONDS_MS - elapsed);
      }
    }
  }, []);

  const runATHLogic = useCallback(async (signal?: AbortSignal) => {
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
      if (signal?.aborted) return;

      try {
        const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1M&start=${start}&end=${end}&limit=100&adjustment=split&feed=iex&sort=asc`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
          signal,
        });

        if (signal?.aborted) return;
        if (!response.ok) continue;

        const data = await response.json();
        if (signal?.aborted) return;

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

          if (signal?.aborted) return;

          setStocks((prev) => {
            // Update the Last Updated Time for this specific stock in the modal
            const currentUpdateTime = new Date();
            const updatedStockItem: Stock = {
              symbol,
              name: SYMBOL_NAMES[symbol] || symbol,
              price: currentPrice,
              change: percentageChangeToATH,
              prevClose: athPrice,
              marketCap: 1000000000000,
              lastUpdated: currentUpdateTime, // Store the update time for this stock
            };

            const existingIndex = prev.findIndex((s) => s.symbol === symbol);
            if (existingIndex >= 0) {
              const nextList = [...prev];
              nextList[existingIndex] = updatedStockItem;
              return nextList;
            }
            return [...prev, updatedStockItem];
          });

          // Increment counter of redrawn stock bubbles, stopping when total stocks reached
          setRedrawnStockCount((prev) => (prev < SP500_SYMBOLS.length ? prev + 1 : SP500_SYMBOLS.length));

          // Update the timestamp of the last data update
          setLastUpdateTime(new Date());
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || signal?.aborted) {
          return;
        }
        console.error(`Error in ATH logic for ${symbol}:`, err);
      }
    }
  }, []);

  const runOneHourLogic = useCallback(async (signal?: AbortSignal) => {
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
      if (signal?.aborted) return;

      try {
        const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1H&start=${start}&end=${end}&limit=100&adjustment=raw&feed=iex&sort=asc`;
        const response = await fetch(url, {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
          },
          signal,
        });

        if (signal?.aborted) return;
        if (!response.ok) continue;

        const data = await response.json();
        if (signal?.aborted) return;

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

          if (signal?.aborted) return;

          setStocks((prev) => {
            // Update the Last Updated Time for this specific stock in the modal
            const currentUpdateTime = new Date();
            const updatedStockItem: Stock = {
              symbol,
              name: SYMBOL_NAMES[symbol] || symbol,
              price: currentPrice,
              change: percentageChangeFromLastToCurrent,
              prevClose: lastButOneClosingPrice,
              marketCap: 1000000000000,
              lastUpdated: currentUpdateTime, // Store the update time for this stock
            };

            const existingIndex = prev.findIndex((s) => s.symbol === symbol);
            if (existingIndex >= 0) {
              const nextList = [...prev];
              nextList[existingIndex] = updatedStockItem;
              return nextList;
            }
            return [...prev, updatedStockItem];
          });

          // Increment counter of redrawn stock bubbles, stopping when total stocks reached
          setRedrawnStockCount((prev) => (prev < SP500_SYMBOLS.length ? prev + 1 : SP500_SYMBOLS.length));

          // Update the timestamp of the last data update
          setLastUpdateTime(new Date());
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || signal?.aborted) {
          return;
        }
        console.error(`Error in 1H logic for ${symbol}:`, err);
      }
    }
  }, []);

  // Handler function to switch timeframe and trigger appropriate logic
  const handleTimeframeChange = useCallback((timeframe: string) => {
    setActiveTimeframe(timeframe);
    setProgress(0); // Reset polling progress bar immediately
    setRedrawnStockCount(0); // Reset redrawn bubble counter every time a new timeframe is selected

    // 1. Cancel and abort all existing and pending API calls from prior timeframe
    if (timeframeAbortControllerRef.current) {
      timeframeAbortControllerRef.current.abort();
    }
    const newController = new AbortController();
    timeframeAbortControllerRef.current = newController;
    const signal = newController.signal;

    // 2. Clear the canvas of bubbles no matter which timeframe was selected
    setStocks([]);

    if (timeframe === 'Live') {
      // Mark canvas as cleared so the subsequent live iteration populates bubbles cleanly
      hasClearedCanvasForLiveRef.current = true;
      // Trigger live stock prices and percentages calculation
      liveStockPricesAndPercentages(false, signal);
    } else if (timeframe === '1D') {
      runOneDayLogic(signal);
    } else if (timeframe === '1H') {
      runOneHourLogic(signal);
    } else if (timeframe === 'ATH') {
      runATHLogic(signal);
    } else {
      fetchStockData(false, signal);
    }
  }, [liveStockPricesAndPercentages, runOneDayLogic, runOneHourLogic, runATHLogic, fetchStockData]);

  // Handle initial data load on component mount via Alpaca REST API
  // On initial load, 'Live' timeframe is selected by default: cancels any pending calls, clears canvas, then runs.
  useEffect(() => {
    // 1. Cancel any existing controller and instantiate a fresh AbortController for initial load
    if (timeframeAbortControllerRef.current) {
      timeframeAbortControllerRef.current.abort();
    }
    const initialController = new AbortController();
    timeframeAbortControllerRef.current = initialController;
    const signal = initialController.signal;

    // 2. Clear canvas bubbles and reset counter before initial load calculations
    setStocks([]);
    setRedrawnStockCount(0);

    liveStockPricesAndPercentages(true, signal);

    return () => {
      // Cleanup: Abort any running requests on unmount
      initialController.abort();
    };
  }, [liveStockPricesAndPercentages]);

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

            const estHour = parseInt(new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false, hour: 'numeric' }));
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
    if (viewMode !== 'table') return;

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
              const estHour = parseInt(new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false, hour: 'numeric' }));
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
  }, [viewMode]);

  // Fast lookup for stocks by symbol
  const stocksMap = useMemo(() => {
    const map = new Map<string, Stock>();
    stocks.forEach(s => map.set(s.symbol, s));
    return map;
  }, [stocks]);

  // Filter and Search logic for the market list
  const filteredListSymbols = useMemo(() => {
    return SP500_SYMBOLS.filter(symbol => {
      const stock = stocksMap.get(symbol);
      const name = SYMBOL_NAMES[symbol] || '';
      const query = listSearchQuery.toLowerCase();

      const matchesSearch = symbol.toLowerCase().includes(query) || name.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (listFilter === 'gainers') return (stock?.change || 0) > 0;
      if (listFilter === 'losers') return (stock?.change || 0) < 0;
      return true;
    });
  }, [listSearchQuery, listFilter, stocksMap]);

  // Derive ranked stocks for the bars view
  const rankedStocks = useMemo(() => {
    return filteredListSymbols
      .map(symbol => stocksMap.get(symbol))
      .filter((s): s is Stock => !!s)
      .sort((a, b) => b.change - a.change);
  }, [filteredListSymbols, stocksMap]);

  // Determine overall market sentiment for progress bar color
  const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
  const averageChange = stocks.length > 0 ? totalChange / stocks.length : 0;
  const progressBarColorClass = averageChange >= 0 ? 'bg-[#00ff00] shadow-[0_0_15px_#00ff00]' : 'bg-[#ff0000] shadow-[0_0_15px_#ff0000]';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-white text-2xl font-light tracking-widest uppercase">Loading app</div>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#00ff00] shadow-[0_0_15px_#00ff00] animate-pulse" style={{ width: '45%' }} />
        </div>
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
            <div id="desktop-timeframe-selector" className="hidden md:flex items-center gap-1"> {/* Visible on medium screens and up */}
              {(['Live', '1H', '1D', '1W', '1M', '3M', '1Y', 'YTD', 'ATH'] as const).map((timeframeOption) => (
                <button
                  key={timeframeOption}
                  id={`desktop-timeframe-button-${timeframeOption.toLowerCase()}`}
                  onClick={() => handleTimeframeChange(timeframeOption)}
                  className={`px-2 py-1 sm:px-3 rounded-md text-xs font-normal transition-colors ${
                    activeTimeframe === timeframeOption
                      ? 'bg-gray-700 text-white' // Active state styling
                      : 'text-gray-400 hover:text-white hover:bg-gray-800' // Inactive state styling
                  }`}
                  aria-pressed={activeTimeframe === timeframeOption}
                  title={`Switch timeframe to ${timeframeOption}`}
                >
                  {timeframeOption}
                </button>
              ))}
            </div>

            {/* Display Mode Toggle (Desktop) */}
            <div className="hidden md:flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setDisplayMode('change')}
                className={`px-2 py-1 sm:px-3 rounded-md text-[10px] font-normal transition-all ${displayMode === 'change' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                %
              </button>
              <button
                onClick={() => setDisplayMode('price')}
                className={`px-2 py-1 sm:px-3 rounded-md text-[10px] font-normal transition-all ${displayMode === 'price' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                $
              </button>
            </div>

            {/* Redrawn Stock Bubbles Counter Badge */}
            <div
              id="stock-bubbles-redraw-counter"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900/80 border border-gray-800 rounded-lg text-xs font-mono text-gray-300 whitespace-nowrap"
              title={`Stock bubbles redrawn for ${activeTimeframe}: ${redrawnStockCount} of ${SP500_SYMBOLS.length}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-white">
                {redrawnStockCount}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">
                {SP500_SYMBOLS.length}
              </span>
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
              {/* View Mode Toggle (Mobile) */}
              <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
                <button
                  onClick={() => setViewMode('bubbles')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'bubbles' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title="Bubbles View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="6" cy="7" r="2" />
                    <circle cx="18" cy="8" r="2" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title="Table View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3zm0 6h18M3 15h18M9 3v18M15 3v18" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('bars')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'bars' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title="Bars View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
                  </svg>
                </button>
              </div>

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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setViewMode('bubbles')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'bubbles' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
                title="Bubbles View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="6" cy="7" r="2" />
                  <circle cx="18" cy="8" r="2" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3zm0 6h18M3 15h18M9 3v18M15 3v18" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'bars' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                  }`}
                title="Bars View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h14" />
                </svg>
              </button>
            </div>

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

      {/* Main Workspace Area (Left Vertical Menu Bar + Canvas Viewport) */}
      <div className="relative w-full flex-1 overflow-hidden flex flex-row">
        {/* Left Vertical Menu Bar */}
        <aside
          id="canvas-vertical-menu-bar"
          aria-label="Side Navigation"
          className="relative z-20 flex flex-col items-center w-12 sm:w-14 bg-black/60 backdrop-blur-md border-r border-gray-800 py-3 sm:py-4 gap-3 shrink-0 select-none"
        >
          {/* Menu Item: News */}
          <div className="relative group flex items-center justify-center">
            <button
              id="menu-item-news"
              type="button"
              onClick={() => setActiveMenu(prev => prev === 'news' ? null : 'news')}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${
                activeMenu === 'news'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
              aria-label="News"
            >
              {/* News Logo / Icon */}
              <svg
                id="logo-news"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </button>

            {/* Title Displayed on Hover */}
            <span
              id="tooltip-news"
              role="tooltip"
              className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 text-xs font-normal text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
            >
              News
            </span>
          </div>

          {/* Menu Item: Sectors */}
          <div className="relative group flex items-center justify-center">
            <button
              id="menu-item-sectors"
              type="button"
              onClick={() => setActiveMenu(prev => prev === 'sectors' ? null : 'sectors')}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${
                activeMenu === 'sectors'
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
              aria-label="Sectors"
            >
              {/* Sectors Logo / Icon */}
              <svg
                id="logo-sectors"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                />
              </svg>
            </button>

            {/* Title Displayed on Hover */}
            <span
              id="tooltip-sectors"
              role="tooltip"
              className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 text-xs font-normal text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50"
            >
              Sectors
            </span>
          </div>
        </aside>

        {/* Side Panel Overlay (When News or Sectors is Clicked) */}
        {activeMenu && (
          <div
            id="side-menu-panel"
            className="absolute inset-y-0 left-12 sm:left-14 w-80 sm:w-96 md:w-[420px] max-w-[calc(100vw-3.5rem)] bg-gray-950/95 backdrop-blur-md border-r border-gray-800 z-30 flex flex-col shadow-2xl transition-all"
          >
            {/* SECTORS PANEL: Displays daily performance for 18 market sector ETFs from Alpaca */}
            {activeMenu === 'sectors' && (
              <div id="sectors-container" className="flex flex-col h-full overflow-hidden">
                {/* Sectors Header */}
                <div id="sectors-panel-header" className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    {/* Sectors Pie Logo */}
                    <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                      </svg>
                    </div>
                    <div>
                      <h2 id="sectors-title" className="text-base font-semibold text-white leading-tight">
                        Sector Performance
                      </h2>
                    </div>
                  </div>

                  {/* Header Actions: Refresh and Close */}
                  <div className="flex items-center gap-1">
                    {/* Refresh Data Button */}
                    <button
                      id="sectors-refresh-button"
                      type="button"
                      onClick={() => fetchSectorData()}
                      disabled={sectorsLoading}
                      title="Refresh sector data from Alpaca"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Refresh Sectors"
                    >
                      <svg
                        className={`w-4 h-4 ${sectorsLoading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>

                    {/* Close Panel Button */}
                    <button
                      id="sectors-close-button"
                      type="button"
                      onClick={() => setActiveMenu(null)}
                      title="Close panel"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Close Panel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Filter & Sorting Controls */}
                <div id="sectors-controls-bar" className="p-3 border-b border-gray-800/80 flex flex-col gap-2 shrink-0 bg-black/30">
                  {/* Search / Filter Input */}
                  <div className="relative">
                    <input
                      id="sectors-search-input"
                      type="text"
                      placeholder="Filter sector or ETF ticker..."
                      value={sectorsSearch}
                      onChange={(e) => setSectorsSearch(e.target.value)}
                      className="w-full bg-gray-900/90 text-white text-xs border border-gray-700/80 rounded-lg py-1.5 pl-8 pr-7 focus:outline-none focus:border-white/40 transition-colors"
                    />
                    <svg
                      className="w-4 h-4 text-gray-500 absolute left-2.5 top-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {sectorsSearch && (
                      <button
                        onClick={() => setSectorsSearch('')}
                        className="absolute right-2.5 top-2 text-gray-500 hover:text-white"
                        aria-label="Clear Search"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs & Sort Controls (Bars View Representation) */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Filter Tabs: All, Gainers, Losers */}
                    <div id="sectors-filter-tabs" className="flex bg-gray-900/60 p-0.5 rounded-md border border-gray-800">
                      {(['all', 'gainers', 'losers'] as const).map((tab) => (
                        <button
                          key={tab}
                          id={`sectors-filter-${tab}`}
                          type="button"
                          onClick={() => setSectorsFilter(tab)}
                          className={`px-2.5 py-1 rounded text-[10px] font-normal transition-colors uppercase tracking-wider ${
                            sectorsFilter === tab
                              ? 'bg-gray-800 text-white font-medium shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Sort Selector */}
                    <div id="sectors-sort-container" className="flex items-center gap-1 text-[10px]">
                      <span className="text-gray-500 uppercase tracking-wider text-[9px]">Sort:</span>
                      <div className="flex bg-gray-900/60 p-0.5 rounded-md border border-gray-800">
                        {(
                          [
                            { key: 'performance', label: 'Perf' },
                            { key: 'name', label: 'Name' },
                            { key: 'default', label: 'Def' },
                          ] as const
                        ).map((option) => (
                          <button
                            key={option.key}
                            id={`sort-button-${option.key}`}
                            type="button"
                            onClick={() => setSectorsSort(option.key)}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              sectorsSort === option.key
                                ? 'bg-gray-800 text-white font-medium shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continuous Retry Error Banner */}
                {sectorsError && (
                  <div
                    id="sectors-error-alert"
                    className="m-3 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-200 flex flex-col gap-2 shrink-0"
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div className="flex-1 leading-relaxed">
                        <p id="sectors-error-message">{sectorsError}</p>
                        {sectorRetryCount > 0 && (
                          <p id="sectors-retry-status" className="text-[11px] text-amber-300/90 mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                            <span>Continuously retrying (Attempt #{sectorRetryCount})...</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      id="sectors-retry-now-button"
                      type="button"
                      onClick={() => fetchSectorData()}
                      className="self-end px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded text-[11px] font-medium transition-colors"
                    >
                      Retry Now
                    </button>
                  </div>
                )}

                {/* Scrollable Sector Bars List */}
                <div id="sectors-list-container" className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                  {/* Column Legend Header for the Bars View */}
                  {displayedSectors.length > 0 && !sectorsLoading && (
                    <div
                      id="sectors-bar-legend"
                      className="flex items-center gap-2 px-2 pb-1.5 mb-1 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800/60 font-medium"
                    >
                      <div className="w-24 sm:w-28 shrink-0">Sector / ETF</div>
                      <div className="flex-1 relative flex items-center justify-between px-1 text-[8px] text-gray-600 font-mono">
                        <span>- loss</span>
                        <span className="text-gray-400 font-semibold">0%</span>
                        <span>gain +</span>
                      </div>
                      <div className="w-14 sm:w-16 text-right shrink-0">Change</div>
                    </div>
                  )}

                  {/* Loading Skeleton */}
                  {sectorsLoading && sectorsData.length === 0 && (
                    <div id="sectors-loading-skeleton" className="space-y-2">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <div key={idx} className="h-10 bg-gray-900/50 border border-gray-800/50 rounded-lg animate-pulse p-2 flex items-center gap-2">
                          <div className="w-24 h-4 bg-gray-800 rounded"></div>
                          <div className="flex-1 h-3 bg-gray-800/60 rounded"></div>
                          <div className="w-12 h-4 bg-gray-800 rounded"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Sector Performance Bars (Similar to main bars view) */}
                  {!sectorsLoading || sectorsData.length > 0 ? (
                    displayedSectors.map((sectorItem) => {
                      const isPositive = sectorItem.changePercent >= 0;
                      // Calculate relative bar width out of 50% max from the 0% centerline
                      const barWidth = (Math.abs(sectorItem.changePercent) / maxSectorAbsChange) * 50;

                      return (
                        <div
                          key={sectorItem.symbol}
                          id={`sector-bar-row-${sectorItem.symbol.toLowerCase()}`}
                          onClick={() => {
                            if (sectorItem.price > 0) {
                              setSelectedStock({
                                symbol: sectorItem.symbol,
                                name: `${sectorItem.sector} (${sectorItem.symbol})`,
                                price: sectorItem.price,
                                change: sectorItem.changePercent,
                                prevClose: sectorItem.prevClose,
                                marketCap: 0,
                              });
                            }
                          }}
                          className="flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                          title={`Click to view ${sectorItem.sector} (${sectorItem.symbol}) chart`}
                        >
                          {/* Sector Name & ETF Symbol */}
                          <div className="w-24 sm:w-28 shrink-0 flex flex-col min-w-0">
                            <span
                              id={`sector-name-${sectorItem.symbol.toLowerCase()}`}
                              className="text-white text-xs font-medium truncate group-hover:text-blue-400 transition-colors"
                            >
                              {sectorItem.sector}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                              <span className="font-semibold text-gray-400">{sectorItem.symbol}</span>
                              {sectorItem.price > 0 && (
                                <>
                                  <span>•</span>
                                  <span>${sectorItem.price.toFixed(2)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Centerline Relative Bar Track (Mirroring Main Bars View) */}
                          <div
                            id={`sector-bar-track-${sectorItem.symbol.toLowerCase()}`}
                            className="flex-1 relative h-6 sm:h-7 flex items-center"
                          >
                            {/* 0% Center Reference Axis */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 z-10" />
                            {/* Track Background */}
                            <div className="absolute inset-0 bg-gray-900/30 rounded-sm" />
                            {/* Dynamic Performance Filled Bar */}
                            <div
                              id={`sector-bar-fill-${sectorItem.symbol.toLowerCase()}`}
                              className={`h-2 sm:h-2.5 absolute top-1/2 -translate-y-1/2 transition-all duration-500 rounded-sm ${
                                isPositive
                                  ? 'left-1/2 bg-[#00ff00]/60 group-hover:bg-[#00ff00]'
                                  : 'right-1/2 bg-[#ff0000]/60 group-hover:bg-[#ff0000]'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>

                          {/* Performance Percentage Label */}
                          <div
                            id={`sector-change-${sectorItem.symbol.toLowerCase()}`}
                            className={`w-14 sm:w-16 text-right text-[11px] sm:text-xs font-mono font-medium shrink-0 ${
                              isPositive ? 'text-[#00ff00]' : 'text-[#ff0000]'
                            }`}
                          >
                            {sectorItem.price > 0
                              ? `${isPositive ? '+' : ''}${sectorItem.changePercent.toFixed(2)}%`
                              : '---'}
                          </div>
                        </div>
                      );
                    })
                  ) : null}

                  {/* Empty Search / Filter Notice */}
                  {displayedSectors.length === 0 && !sectorsLoading && !sectorsError && (
                    <div id="sectors-empty-search" className="py-12 text-center text-gray-500 text-xs">
                      No sectors match {sectorsSearch ? `"${sectorsSearch}"` : `filter "${sectorsFilter}"`}
                    </div>
                  )}
                </div>

                {/* Footer with Timestamp, Count, and Auto-Refresh Indicator */}
                {sectorsLastUpdated && (
                  <div
                    id="sectors-footer-timestamp"
                    className="p-2.5 border-t border-gray-800/80 bg-black/40 text-[10px] text-gray-500 flex justify-between items-center shrink-0"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${sectorsLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                      <span>Auto-refreshes every 10s</span>
                    </span>
                    <span>Updated {sectorsLastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* NEWS PANEL (Placeholder) */}
            {activeMenu === 'news' && (
              <div id="news-container" className="flex flex-col h-full p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <h2 className="text-base font-medium text-white">Market News</h2>
                  <button
                    id="close-news-panel-button"
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Close News Panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center text-center p-6 text-gray-500 text-sm">
                  Market news and headlines feature coming soon.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas & Content Container */}
        <div className="relative flex-1 h-full w-full overflow-hidden">
          {viewMode === 'bubbles' && (
            <>
              {/* Bubble Canvas with bottom-right exclusion zone (180px x 36px) so bubbles bounce off the box and never render behind it */}
              <BubbleCanvas
                stocks={stocks}
                onStockSelect={setSelectedStock}
                searchTerm={searchTerm}
                displayMode={displayMode}
                exclusionZone={lastUpdateTime ? { width: 180, height: 36 } : undefined}
              />

              {/* Last Update Time Indicator Box - Located in the absolute bottom right corner */}
              {lastUpdateTime && (
                <div
                  id="canvas-last-update-box"
                  className="absolute bottom-0 right-0 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black border-t border-l border-gray-800 text-[11px] font-mono text-gray-400 select-none"
                  title={`Last updated at ${lastUpdateTime.toLocaleTimeString()}`}
                  aria-label="Last update time"
                >
                  {/* Status dot indicator */}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  <span className="text-gray-500 uppercase tracking-wider text-[9px] font-semibold">Updated:</span>
                  <span className="text-gray-200">{lastUpdateTime.toLocaleTimeString()}</span>
                </div>
              )}
            </>
          )}
        {viewMode === 'table' && (
          <div className="absolute inset-0 z-10 bg-black flex flex-col p-2 sm:p-6 md:p-10">
            <div className="flex justify-between items-center mb-4 sm:mb-8 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-normal text-white tracking-tight">Market Overview</h2>
                <p className="text-gray-500 text-sm mt-1">Closing prices for the most recent completed bars</p>
              </div>
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
                    className={`px-4 py-1.5 rounded-md text-[10px] font-normal transition-all uppercase tracking-widest ${listFilter === f
                        ? 'bg-gray-800 text-white shadow-lg'
                        : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/10">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900 sticky top-0 z-10 shadow-lg">
                  <tr>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 whitespace-nowrap">Company / Ticker</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">Price</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1H Close</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1D Close</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1W Close</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1M Close</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">3M Close</th>
                    <th className="p-2 sm:p-4 text-gray-400 text-[9px] sm:text-[10px] font-normal uppercase tracking-widest border-b border-gray-800 text-right whitespace-nowrap">1Y Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredListSymbols.map(symbol => {
                    const data = listHistoricalData[symbol] || {};
                    const currentStock = stocks.find(s => s.symbol === symbol);
                    return (
                      <tr key={symbol} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                        setSelectedStock(stocks.find(s => s.symbol === symbol) || null);
                      }}>
                        <td className="p-2 sm:p-4">
                          <div className="text-white font-normal text-sm sm:text-base leading-tight">{currentStock?.name || symbol}</div>
                          <div className="text-gray-500 text-xs sm:text-sm leading-tight">{symbol}</div>
                        </td>
                        <td className="p-2 sm:p-4 text-white text-xs sm:text-sm text-right">
                          {currentStock ? `$${currentStock.price.toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1H'] ? `$${data['1H'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1D'] ? `$${data['1D'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1W'] ? `$${data['1W'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['1M'] ? `$${data['1M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
                          {data['3M'] ? `$${data['3M'].toFixed(2)}` : '---'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 text-xs sm:text-sm text-right">
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

        {viewMode === 'bars' && (
          <div className="absolute inset-0 z-10 bg-black flex flex-col p-2 sm:p-6 md:p-10">
            <div className="flex-grow overflow-y-auto custom-scrollbar md:grid md:grid-cols-2 md:gap-x-8 lg:gap-x-12">
              {(() => {
                // Scale relative to global performance for consistency
                const maxAbsChange = Math.max(...stocks.map(s => Math.abs(s.change)), 0.1);

                const renderStockBar = (stock: Stock) => {
                    const isPositive = stock.change >= 0;
                    const barWidth = (Math.abs(stock.change) / maxAbsChange) * 50;
  
                    return (
                      <div
                        key={stock.symbol}
                        className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => setSelectedStock(stock)}
                      >
                        <div className="w-12 sm:w-16 shrink-0">
                          <span className="text-white text-[10px] sm:text-xs font-medium">{stock.symbol}</span>
                        </div>
  
                        <div className="flex-1 relative h-6 sm:h-8 flex items-center">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 z-10" />
                          <div className="absolute inset-0 bg-gray-900/20 rounded-sm" />
                          <div
                            className={`h-2 sm:h-3 absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${isPositive ? 'left-1/2 bg-[#00ff00]/60 group-hover:bg-[#00ff00]' : 'right-1/2 bg-[#ff0000]/60 group-hover:bg-[#ff0000]'} rounded-sm`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
  
                        <div className={`w-16 sm:w-20 text-right text-[10px] sm:text-xs font-mono ${isPositive ? 'text-[#00ff00]' : 'text-[#ff0000]'}`}>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                        </div>
                      </div>
                    );
                };

                if (listFilter === 'all') {
                  const gainers = rankedStocks.filter(s => s.change >= 0);
                  const losers = rankedStocks.filter(s => s.change < 0).sort((a, b) => a.change - b.change);

                  return (
                    <>
                      {/* Single column on mobile */}
                      <div className="md:hidden">
                        {rankedStocks.map(renderStockBar)}
                      </div>
                      {/* Two columns on desktop */}
                      <div className="hidden md:block overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/10 p-2 sm:p-4">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-2">Gainers</h3>
                        {gainers.map(renderStockBar)}
                      </div>
                      <div className="hidden md:block overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/10 p-2 sm:p-4">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-2">Losers</h3>
                        {losers.map(renderStockBar)}
                      </div>
                    </>
                  );
                }

                // Fallback for 'gainers' or 'losers' filter, or mobile 'all'
                return (
                  <div className="md:col-span-2">
                     <div className="overflow-y-auto custom-scrollbar border border-gray-800 rounded-xl bg-gray-900/10 p-2 sm:p-4">
                      {rankedStocks.map(renderStockBar)}
                    </div>
                  </div>
                );
              })()}

              {filteredListSymbols.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-600 font-normal tracking-widest uppercase text-sm">
                  No performance data matches search
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market List Modal */}
        {/* Removed redundant Market List Modal as it is now integrated into the table viewMode */}

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

                {/* Last Update Time for this specific stock - displayed at bottom center of modal */}
                {selectedStock.lastUpdated && (
                  <div
                    id="stock-modal-last-update"
                    className="pt-4 text-center border-t border-gray-800 mt-4"
                    aria-label="Stock data last update time"
                  >
                    <span className="text-gray-500 text-[10px] font-normal uppercase tracking-widest block mb-0.5">
                      Last Updated
                    </span>
                    <span className="text-gray-300 text-sm font-mono">
                      {selectedStock.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Mobile Footer with Timeframes */}
      <div id="mobile-timeframe-footer" className="md:hidden bg-black p-2 z-20 border-t border-gray-800 shrink-0">
        <div className="flex items-center justify-between px-4">
          <div className="relative">
            {/* Mobile Timeframe Dropdown Toggle Button */}
            <button
              id="mobile-timeframe-menu-toggle"
              type="button"
              onClick={() => setIsTimeframeMenuOpen(!isTimeframeMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-normal uppercase tracking-widest rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
              aria-expanded={isTimeframeMenuOpen}
              aria-haspopup="listbox"
            >
              <span>TF: {activeTimeframe}</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${isTimeframeMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Timeframe Dropdown Menu List */}
            {isTimeframeMenuOpen && (
              <div
                id="mobile-timeframe-dropdown-list"
                className="absolute bottom-full left-0 mb-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30"
              >
                {(['Live', '1H', '1D', '1W', '1M', '3M', '1Y', 'YTD', 'ATH'] as const).map((timeframeOption) => (
                  <button
                    key={timeframeOption}
                    id={`mobile-timeframe-option-${timeframeOption.toLowerCase()}`}
                    type="button"
                    onClick={() => {
                      handleTimeframeChange(timeframeOption);
                      setIsTimeframeMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[10px] font-normal uppercase tracking-widest transition-colors ${
                      activeTimeframe === timeframeOption
                        ? 'bg-gray-700 text-white font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {timeframeOption}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Display Mode Toggle (Mobile) */}
          <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => { setDisplayMode('change'); setIsTimeframeMenuOpen(false); }}
              className={`px-3 py-1 rounded-md text-[10px] font-normal transition-all ${displayMode === 'change' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              %
            </button>
            <button
              onClick={() => setDisplayMode('price')}
              className={`px-3 py-1 rounded-md text-[10px] font-normal transition-all ${displayMode === 'price' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
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
