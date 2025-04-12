import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Settings, Activity, Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

// 컨텍스트 임포트
import { AuthContext } from '../contexts/AuthContext';
import { TradeContext } from '../contexts/TradeContext';

// API 임포트
import UpbitAPI from '../api/upbit';

// 현재가 포맷 함수
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 날짜 포맷 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, apiKeys } = useContext(AuthContext);
  const { startTrading, stopTrading, isTrading, tradingConfig } = useContext(TradeContext);
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ticker, setTicker] = useState(null);
  const [candles, setCandles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('KRW-BTC');
  const [markets, setMarkets] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30초
  
  // API 인스턴스 생성
  const upbitAPI = new UpbitAPI(
    apiKeys?.accessKey || '',
    apiKeys?.secretKey || ''
  );
  
  // 선택된 마켓 변경 처리 함수
  const handleMarketChange = (e) => {
    setSelectedMarket(e.target.value);
  };
  
  // 데이터 로딩 함수
  const loadData = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 병렬로 데이터 가져오기 (실제 API 호출)
      const accountsData = await upbitAPI.getAccounts();
      const tickerData = await upbitAPI.getTicker(selectedMarket);
      const candlesData = await upbitAPI.getMinuteCandles(selectedMarket, 15, 100);
      const marketsData = await upbitAPI.getMarkets();
      
      // 임시 거래 내역 (실제로는 API에서 가져와야 함)
      const dummyTransactions = [
        { id: 1, type: 'buy', market: selectedMarket, amount: 0.05, price: 45200000, time: '2024-04-12 10:15:23' },
        { id: 2, type: 'sell', market: selectedMarket, amount: 0.03, price: 45800000, time: '2024-04-12 13:25:41' },
        { id: 3, type: 'buy', market: selectedMarket, amount: 0.02, price: 45100000, time: '2024-04-12 14:30:07' }
      ];
      
      // 상태 업데이트
      setAccounts(accountsData || []);
      setTicker(tickerData);
      
      // 차트 데이터 가공
      const chartData = (candlesData || []).map(candle => ({
        time: formatDate(candle.candle_date_time_kst),
        price: candle.trade_price,
        volume: candle.candle_acc_trade_volume
      })).reverse();
      
      setCandles(chartData);
      
      // 마켓 데이터 가공 (KRW 마켓만 필터링)
      const krwMarkets = (marketsData || [])
        .filter(market => market.market.startsWith('KRW-'))
        .map(market => ({
          value: market.market,
          label: `${market.korean_name} (${market.market})`
        }));
      
      setMarkets(krwMarkets);
      
      // 거래 내역 설정
      setTransactions(dummyTransactions);
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };
  
  // 주기적 데이터 새로고침 설정
  useEffect(() => {
    // 첫 로딩
    loadData();
    
    // 주기적 새로고침 설정
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
    
  }, [selectedMarket, isAuthenticated, refreshInterval]);
  
  // 총 자산 계산
  const calculateTotalAssets = () => {
    if (!accounts || accounts.length === 0) {
      return 0;
    }
    
    // KRW 잔고
    const krwBalance = accounts.find(account => account.currency === 'KRW')?.balance || 0;
    let totalKRW = parseFloat(krwBalance);
    
    // 코인 자산 (간략 계산용)
    accounts.forEach(account => {
      if (account.currency !== 'KRW' && account.balance > 0) {
        // 단순화를 위해 BTC를 현재 시세로 계산
        if (account.currency === 'BTC' && ticker) {
          totalKRW += parseFloat(account.balance) * ticker.trade_price;
        }
      }
    });
    
    return totalKRW;
  };
  
  // 특정 코인 보유량 가져오기
  const getCoinBalance = (currency) => {
    const coinAccount = accounts.find(account => account.currency === currency);
    return coinAccount ? parseFloat(coinAccount.balance) : 0;
  };
  
  // 선택된 코인 심볼 (예: BTC)
  const selectedCoinSymbol = selectedMarket.split('-')[1];
  
  // 선택된 코인 보유량
  const selectedCoinBalance = getCoinBalance(selectedCoinSymbol);
  
  // 트레이딩 시작/중지 토글
  const toggleTrading = () => {
    if (isTrading) {
      stopTrading();
    } else {
      startTrading(selectedMarket);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 네비게이션 헤더 */}
      <header className="bg-white p-4 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">업비트 매매봇</h1>
          <div className="flex items-center space-x-4">
            {/* 마켓 선택 */}
            <select
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedMarket}
              onChange={handleMarketChange}
            >
              {markets.map(market => (
                <option key={market.value} value={market.value}>
                  {market.label}
                </option>
              ))}
            </select>
            
            {/* 새로고침 버튼 */}
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={loadData}
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            
            {/* 알림 버튼 */}
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            
            {/* 설정 버튼 */}
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* 자동 매매 컨트롤 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">자동 매매 설정</h2>
            <div className="flex items-center">
              <span className={`mr-2 text-sm ${isTrading ? 'text-green-500' : 'text-gray-500'}`}>
                {isTrading ? '실행 중' : '중지됨'}
              </span>
              <button
                className={`px-4 py-2 rounded-md text-white ${
                  isTrading ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={toggleTrading}
              >
                {isTrading ? '중지하기' : '시작하기'}
              </button>
            </div>
          </div>
          
          {isTrading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>현재 전략:</strong> {tradingConfig?.strategy?.useMAStrategy ? '이동평균선 교차' : ''} 
                {tradingConfig?.strategy?.useRSIStrategy ? ', RSI' : ''} 
                {tradingConfig?.strategy?.useBollingerStrategy ? ', 볼린저 밴드' : ''}
              </p>
            </div>
          )}
        </div>
        
        {/* 요약 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <Wallet className="text-blue-500 mr-2" size={20} />
              <h2 className="text-gray-600">총 자산</h2>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? '로딩 중...' : `₩${formatPrice(calculateTotalAssets())}`}
            </p>
            <p className="text-green-500 text-sm flex items-center">
              <TrendingUp size={16} className="mr-1" /> +2.3%
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <Activity className="text-purple-500 mr-2" size={20} />
              <h2 className="text-gray-600">{selectedCoinSymbol} 보유량</h2>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? '로딩 중...' : `${selectedCoinBalance.toFixed(8)} ${selectedCoinSymbol}`}
            </p>
            <p className="text-gray-500 text-sm">
              {ticker ? `≈ ₩${formatPrice(selectedCoinBalance * ticker.trade_price)}` : '로딩 중...'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <TrendingUp className="text-green-500 mr-2" size={20} />
              <h2 className="text-gray-600">당일 수익</h2>
            </div>
            <p className="text-2xl font-bold">₩280,000</p>
            <p className="text-green-500 text-sm">+2.5%</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <TrendingDown className="text-red-500 mr-2" size={20} />
              <h2 className="text-gray-600">현재가</h2>
            </div>
            <p className="text-2xl font-bold">
              {ticker ? `₩${formatPrice(ticker.trade_price)}` : '로딩 중...'}
            </p>
            <p className={`text-sm flex items-center ${
              ticker && ticker.change === 'RISE' ? 'text-green-500' : 'text-red-500'
            }`}>
              {ticker && ticker.change === 'RISE' ? (
                <>
                  <TrendingUp size={16} className="mr-1" />
                  +{ticker.change_rate ? (ticker.change_rate * 100).toFixed(2) : 0}%
                </>
              ) : ticker && ticker.change === 'FALL' ? (
                <>
                  <TrendingDown size={16} className="mr-1" />
                  -{ticker.change_rate ? (ticker.change_rate * 100).toFixed(2) : 0}%
                </>
              ) : (
                '0.00%'
              )}
            </p>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">{selectedMarket} 시세</h2>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
              </div>
            ) : candles.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={candles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip formatter={(value) => `₩${formatPrice(value)}`} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 거래 내역 테이블 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">최근 거래 내역</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
              </div>
            ) : transactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수량
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type === 'buy' ? '매수' : '매도'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.amount.toFixed(8)} {tx.market.split('-')[1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₩{formatPrice(tx.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500">
                거래 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;