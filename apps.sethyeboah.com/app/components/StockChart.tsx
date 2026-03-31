'use client';

interface StockChartProps {
  symbol: string;
  color: string;
}

export default function StockChart({ symbol, color }: StockChartProps) {
  // Simple logic to determine the mock path based on performance
  const isUp = color === '#00ff00';
  const pathData = isUp 
    ? "M0,80 L20,70 L40,75 L60,40 L80,45 L100,20" 
    : "M0,20 L20,30 L40,25 L60,60 L80,55 L100,80";

  return (
    <div className="w-full flex-grow flex items-center justify-center relative">
      {/* Simulated Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-10">
        <div className="border-t border-gray-500 w-full h-0"></div>
        <div className="border-t border-gray-500 w-full h-0"></div>
        <div className="border-t border-gray-500 w-full h-0"></div>
      </div>

      <svg className="w-full h-full px-1" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="opacity-40"
        />
      </svg>
    </div>
  );
}