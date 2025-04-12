import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Key, Zap, Bell, DollarSign, Percent, LogOut } from 'lucide-react';

// 컨텍스트 임포트
import { AuthContext } from '../contexts/AuthContext';
import { TradeContext } from '../contexts/TradeContext';

const Settings = () => {
  const navigate = useNavigate();
  const { apiKeys, updateApiKeys, logout } = useContext(AuthContext);
  const { tradingConfig, updateTradingConfig, isTrading, stopTrading } = useContext(TradeContext);
  
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState('api');
  
  // 폼 상태 관리
  const [apiForm, setApiForm] = useState({
    accessKey: apiKeys?.accessKey || '',
    secretKey: apiKeys?.secretKey || '',
    testMode: tradingConfig?.testMode || true
  });
  
  const [strategyForm, setStrategyForm] = useState({
    strategyType: 'combined',
    useMAStrategy: tradingConfig?.strategy?.useMAStrategy || true,
    useRSIStrategy: tradingConfig?.strategy?.useRSIStrategy || true,
    useBollingerStrategy: tradingConfig?.strategy?.useBollingerStrategy || true,
    requireConfirmation: tradingConfig?.strategy?.requireConfirmation || false,
    maxOrderAmount: tradingConfig?.riskManagement?.maxOrderAmount || 100000,
    portfolioRatio: tradingConfig?.riskManagement?.portfolioRatio || 0.1,
    stopLoss: tradingConfig?.riskManagement?.stopLoss || 0.05,
    takeProfit: tradingConfig?.riskManagement?.takeProfit || 0.1
  });
  
  const [notificationForm, setNotificationForm] = useState({
    tradeNotifications: true,
    priceAlerts: true,
    dailyReports: false,
    abnormalActivityAlerts: true,
    email: ''
  });
  
  // API 설정 변경 핸들러
  const handleApiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiForm({
      ...apiForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // 전략 설정 변경 핸들러
  const handleStrategyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStrategyForm({
      ...strategyForm,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };
  
  // 알림 설정 변경 핸들러
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationForm({
      ...notificationForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // API 설정 저장 핸들러
  const handleApiSubmit = (e) => {
    e.preventDefault();
    
    // API 키 업데이트
    updateApiKeys({
      accessKey: apiForm.accessKey,
      secretKey: apiForm.secretKey
    });
    
    // 테스트 모드 설정 업데이트
    updateTradingConfig({
      ...tradingConfig,
      testMode: apiForm.testMode
    });
    
    alert('API 설정이 저장되었습니다.');
  };
  
  // 전략 설정 저장 핸들러
  const handleStrategySubmit = (e) => {
    e.preventDefault();
    
    // 트레이딩 설정 업데이트
    const newConfig = {
      ...tradingConfig,
      strategy: {
        useMAStrategy: strategyForm.useMAStrategy,
        useRSIStrategy: strategyForm.useRSIStrategy,
        useBollingerStrategy: strategyForm.useBollingerStrategy,
        requireConfirmation: strategyForm.requireConfirmation
      },
      riskManagement: {
        maxOrderAmount: strategyForm.maxOrderAmount,
        portfolioRatio: strategyForm.portfolioRatio,
        stopLoss: strategyForm.stopLoss,
        takeProfit: strategyForm.takeProfit
      }
    };
    
    updateTradingConfig(newConfig);
    alert('전략 설정이 저장되었습니다.');
  };
  
  // 알림 설정 저장 핸들러
  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    alert('알림 설정이 저장되었습니다.');
  };
  
  // 로그아웃 핸들러
  const handleLogout = () => {
    // 트레이딩 중지
    if (isTrading) {
      stopTrading();
    }
    
    // 로그아웃
    logout();
    navigate('/login');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white p-4 shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">설정</h1>
          </div>
          
          <button
            className="flex items-center text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-1" />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow">
          {/* 탭 네비게이션 */}
          <div className="flex border-b">
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'api' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('api')}
            >
              API 연결
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'trading' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('trading')}
            >
              매매 전략
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('notifications')}
            >
              알림 설정
            </button>
          </div>

          {/* API 탭 내용 */}
          {activeTab === 'api' && (
            <form onSubmit={handleApiSubmit} className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Key className="text-blue-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold">업비트 API 설정</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  업비트 웹사이트에서 API 키를 발급받아 아래에 입력하세요.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key
                  </label>
                  <input
                    type="text"
                    name="accessKey"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Access Key를 입력하세요"
                    value={apiForm.accessKey}
                    onChange={handleApiChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Secret Key를 입력하세요"
                    value={apiForm.secretKey}
                    onChange={handleApiChange}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="test-mode"
                    name="testMode"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={apiForm.testMode}
                    onChange={handleApiChange}
                  />
                  <label htmlFor="test-mode" className="ml-2 block text-sm text-gray-700">
                    테스트 모드 활성화 (실제 거래가 발생하지 않습니다)
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2" />
                  저장하기
                </button>
              </div>
            </form>
          )}

          {/* 매매 전략 탭 내용 */}
          {activeTab === 'trading' && (
            <form onSubmit={handleStrategySubmit} className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Zap className="text-yellow-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold">매매 전략 설정</h2>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전략 유형
                  </label>
                  <select
                    name="strategyType"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={strategyForm.strategyType}
                    onChange={handleStrategyChange}
                  >
                    <option value="combined">결합 전략 (여러 지표 활용)</option>
                    <option value="macd">MACD 기반 매매</option>
                    <option value="rsi">RSI 기반 매매</option>
                    <option value="bollinger">볼린저 밴드 전략</option>
                    <option value="custom">직접 설정</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <p className="block text-sm font-medium text-gray-700 mb-3">
                    사용할 지표 선택
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useMAStrategy"
                        name="useMAStrategy"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={strategyForm.useMAStrategy}
                        onChange={handleStrategyChange}
                      />
                      <label htmlFor="useMAStrategy" className="ml-2 block text-sm text-gray-700">
                        이동평균선 교차 (Moving Average Crossover)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useRSIStrategy"
                        name="useRSIStrategy"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={strategyForm.useRSIStrategy}
                        onChange={handleStrategyChange}
                      />
                      <label htmlFor="useRSIStrategy" className="ml-2 block text-sm text-gray-700">
                        RSI (Relative Strength Index)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useBollingerStrategy"
                        name="useBollingerStrategy"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={strategyForm.useBollingerStrategy}
                        onChange={handleStrategyChange}
                      />
                      <label htmlFor="useBollingerStrategy" className="ml-2 block text-sm text-gray-700">
                        볼린저 밴드 (Bollinger Bands)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireConfirmation"
                        name="requireConfirmation"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={strategyForm.requireConfirmation}
                        onChange={handleStrategyChange}
                      />
                      <label htmlFor="requireConfirmation" className="ml-2 block text-sm text-gray-700">
                        신호 확인 필요 (모든 지표가 동의할 때만 거래)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="inline h-4 w-4 text-gray-500 mr-1" />
                      거래 금액 제한 (KRW)
                    </label>
                    <input
                      type="number"
                      name="maxOrderAmount"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="최대 거래 금액"
                      value={strategyForm.maxOrderAmount}
                      onChange={handleStrategyChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Percent className="inline h-4 w-4 text-gray-500 mr-1" />
                      단일 거래당 자산 비율 (%)
                    </label>
                    <input
                      type="number"
                      name="portfolioRatio"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="예: 10%"
                      value={strategyForm.portfolioRatio * 100}
                      onChange={(e) => setStrategyForm({
                        ...strategyForm,
                        portfolioRatio: parseFloat(e.target.value) / 100
                      })}
                      step="1"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    손절 설정 (%)
                  </label>
                  <input
                    type="number"
                    name="stopLoss"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 5%"
                    value={strategyForm.stopLoss * 100}
                    onChange={(e) => setStrategyForm({
                      ...strategyForm,
                      stopLoss: parseFloat(e.target.value) / 100
                    })}
                    step="0.1"
                    min="0.1"
                    max="50"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    익절 설정 (%)
                  </label>
                  <input
                    type="number"
                    name="takeProfit"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 10%"
                    value={strategyForm.takeProfit * 100}
                    onChange={(e) => setStrategyForm({
                      ...strategyForm,
                      takeProfit: parseFloat(e.target.value) / 100
                    })}
                    step="0.1"
                    min="0.1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2" />
                  저장하기
                </button>
              </div>
            </form>
          )}

          {/* 알림 설정 탭 내용 */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Bell className="text-purple-500 mr-2" size={20} />
                  <h2 className="text-lg font-semibold">알림 설정</h2>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">거래 체결 알림</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        name="tradeNotifications"
                        checked={notificationForm.tradeNotifications} 
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">가격 변동 알림 (5% 이상)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        name="priceAlerts"
                        checked={notificationForm.priceAlerts} 
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">일일 수익 보고서</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        name="dailyReports"
                        checked={notificationForm.dailyReports} 
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">비정상 활동 감지 알림</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        name="abnormalActivityAlerts"
                        checked={notificationForm.abnormalActivityAlerts} 
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    알림 수신 이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이메일 주소를 입력하세요"
                    value={notificationForm.email}
                    onChange={handleNotificationChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2" />
                  저장하기
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;