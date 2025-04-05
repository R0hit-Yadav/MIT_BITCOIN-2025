import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./Crypto.css";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

// Coin mapping for Binance symbols
const COIN_MAPPING = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  polkadot: "DOTUSDT",
  dogecoin: "DOGEUSDT",
  "avalanche-2": "AVAXUSDT"
};

// Expanded Coin List with icons
const coins = [
  { id: "bitcoin", name: "Bitcoin", icon: "https://cdn-icons-png.flaticon.com/512/5968/5968260.png" },
  { id: "ethereum", name: "Ethereum", icon: "https://cdn-icons-png.flaticon.com/128/15301/15301597.png" },
  { id: "solana", name: "Solana", icon: "https://cdn-icons-png.flaticon.com/128/14446/14446237.png" },
  { id: "binancecoin", name: "Binance Coin", icon: "https://cdn-icons-png.flaticon.com/128/15208/15208359.png" },
  { id: "polkadot", name: "Polkadot", icon: "https://cdn-icons-png.flaticon.com/128/17978/17978730.png" },
  { id: "dogecoin", name: "Dogecoin", icon: "https://cdn-icons-png.flaticon.com/128/6001/6001356.png" },
  { id: "avalanche-2", name: "Avalanche", icon: "https://cdn-icons-png.flaticon.com/128/15301/15301496.png" }
];

// Crypto Tracking Component
function CryptoTracker() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [chartData, setChartData] = useState(null);
  const [coinPrice, setCoinPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [coinInfo, setCoinInfo] = useState(null);

  // Fetch Crypto Data Function using Binance API
  const fetchCryptoData = async (coin = "bitcoin", days = 7) => {
    setLoading(true);
    setError(null);
    const symbol = COIN_MAPPING[coin];
    if (!symbol) {
      setError("Coin not supported");
      setLoading(false);
      return [];
    }

    try {
      // Get historical klines (candlestick data)
      const interval = days <= 1 ? "1h" : days <= 7 ? "4h" : "1d";
      const limit = days <= 1 ? 24 : days <= 7 ? 42 : days;
      
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      return data.map(([timestamp, open, high, low, close]) => ({
        time: new Date(timestamp).toLocaleDateString(),
        price: parseFloat(close),
      }));
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      setError("Failed to fetch price data");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch Current Price and Additional Info using Binance API
  const fetchCoinPrice = async (coin) => {
    const symbol = COIN_MAPPING[coin];
    if (!symbol) return null;

    try {
      const [tickerResponse, statsResponse] = await Promise.all([
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}&type=MINI`)
      ]);

      if (!tickerResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch price');
      }
      
      const [tickerData, statsData] = await Promise.all([
        tickerResponse.json(),
        statsResponse.json()
      ]);

      return {
        price: parseFloat(tickerData.lastPrice),
        priceChange: parseFloat(tickerData.priceChangePercent),
        high24h: parseFloat(tickerData.highPrice),
        low24h: parseFloat(tickerData.lowPrice),
        volume24h: parseFloat(tickerData.volume),
        quoteVolume: parseFloat(tickerData.quoteVolume),
        priceChange24h: parseFloat(tickerData.priceChange),
        weightedAvgPrice: parseFloat(tickerData.weightedAvgPrice)
      };
    } catch (error) {
      console.error("Error fetching coin price:", error);
      setError("Failed to fetch current price");
      return null;
    }
  };

  // Load Data Effect
  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === "1d" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 7;
      
      // Fetch historical price data
      const data = await fetchCryptoData(selectedCoin, days);
      if (data.length > 0) {
        setChartData({
          labels: data.map((d) => d.time),
          datasets: [
            {
              label: `${selectedCoin.toUpperCase()} Price (USD)`,
              data: data.map((d) => d.price),
              borderColor: "#6a5acd",
              backgroundColor: "rgba(106, 90, 205, 0.1)",
              tension: 0.4,
            },
          ],
        });
      }

      // Fetch current coin price and info
      const priceData = await fetchCoinPrice(selectedCoin);
      if (priceData) {
        setCoinPrice(priceData);
      }
    };

    loadData();
  }, [selectedCoin, timeRange]);

  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="crypto-app-wrapper">
      <div className="crypto-app-container">
        <div className="crypto-header">
          <h1 className="crypto-header-title">Cryoto Info</h1>
        </div>

        <div className="crypto-selector-container">
          <div className="crypto-selector">
            <img 
              src={coins.find(coin => coin.id === selectedCoin)?.icon} 
              alt={selectedCoin} 
              className="crypto-selector-icon"
            />
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="crypto-selector-dropdown"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="crypto-error">
            {error}
          </div>
        )}

        {coinPrice && (
          <div className="crypto-price-display">
            <div className="crypto-price-value">
              ${coinPrice.price.toLocaleString()}
            </div>
            <div 
              className={`crypto-price-change ${
                coinPrice.priceChange >= 0 ? "positive" : "negative"
              }`}
            >
              {coinPrice.priceChange.toFixed(2)}%
            </div>
          </div>
        )}

        {coinPrice && (
          <div className="crypto-stats-grid">
            <div className="crypto-stat-card">
              <div className="crypto-stat-label">24h High</div>
              <div className="crypto-stat-value">${coinPrice.high24h.toLocaleString()}</div>
            </div>
            <div className="crypto-stat-card">
              <div className="crypto-stat-label">24h Low</div>
              <div className="crypto-stat-value">${coinPrice.low24h.toLocaleString()}</div>
            </div>
            <div className="crypto-stat-card">
              <div className="crypto-stat-label">24h Volume</div>
              <div className="crypto-stat-value">{formatNumber(coinPrice.volume24h)}</div>
            </div>
            <div className="crypto-stat-card">
              <div className="crypto-stat-label">24h Change</div>
              <div className={`crypto-stat-value ${coinPrice.priceChange24h >= 0 ? "positive" : "negative"}`}>
                {formatNumber(coinPrice.priceChange24h)}
              </div>
            </div>
          </div>
        )}

        <div className="crypto-time-range">
          <button 
            className={`time-range-btn ${timeRange === "1d" ? "active" : ""}`}
            onClick={() => setTimeRange("1d")}
          >
            1D
          </button>
          <button 
            className={`time-range-btn ${timeRange === "7d" ? "active" : ""}`}
            onClick={() => setTimeRange("7d")}
          >
            7D
          </button>
          <button 
            className={`time-range-btn ${timeRange === "30d" ? "active" : ""}`}
            onClick={() => setTimeRange("30d")}
          >
            30D
          </button>
        </div>

        <div className="crypto-chart-container">
          {loading ? (
            <div className="crypto-loading">
              <div className="crypto-loading-spinner"></div>
            </div>
          ) : chartData ? (
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                      label: function(context) {
                        return `$${context.parsed.y.toLocaleString()}`;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 12
                      },
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 12
                      },
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 6
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 6,
                    hoverBackgroundColor: '#6a5acd'
                  }
                }
              }} 
            />
          ) : (
            <div className="crypto-no-data">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CryptoTracker;