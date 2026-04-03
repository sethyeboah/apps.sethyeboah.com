export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 bg-gray-50">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal mb-8 sm:mb-12 text-center">Apps Are Under Construction</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full">
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 relative overflow-hidden">
            <img 
              src="/images/stockBubbles.jpg" 
              alt="Desktop App Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-normal mb-2 text-center">Stock Bubbles</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 text-center sm:text-left">Find opportunities in the stock market at a glance with AI-powered insights.</p>
            <a href="/stockBubbles">
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base">
                Use The App
              </button>
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full">
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 relative overflow-hidden">
            <img 
              src="/images/StockATH.jpg" 
              alt="Mobile App Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-normal mb-2 text-center">Stock Price & ATH Profit</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 text-center sm:text-left">Check the price for any stock and get the % to ATH.</p>
            <a href="/stockATHPrice">
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base">
                Use The App
              </button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}