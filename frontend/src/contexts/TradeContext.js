import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 인증 컨텍스트 임포트
import { AuthContext } from './AuthContext';

// 트레이딩 컨텍스트 생성
export const TradeContext = createContext();

// API 기본 URL
const API_BASE_URL = 'http://localhost:5000/api';

// 로컬 스토리지 키
const TRADING_CONFIG_KEY = 'upbit_trading_config';

/**
 * 트레이딩 컨텍스트 제공자 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 요소
 */
export const TradeProvider = ({ children }) => {
  // 인증 컨텍스트에서 값 가져오기
  const { isAuthenticated, apiKeys } = useContext(AuthContext);
  
  // 상태 정의
  const [isTrading, setIsTrading] = useState(false);
  const [tradingStatus, setTradingStatus] = useState(null);
  const [tradingConfig, setTradingConfig] = useState({
    strategy: {
      useMAStrategy: true,
      useRSIStrategy: true,
      useBollingerStrategy: true,
      requireConfirmation: false
    },
    riskManagement: {
      maxOrderAmount: 100000,
      portfolioRatio: 0.1,
      stopLoss: 0.05,
      takeProfit: 0.1
    },
    testMode: true,
    interval: 60000 // 1분마다 분석
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 컴포넌트 마운트 시 트레이딩 설정 복원 및 상태 조회
  useEffect(() => {
    const loadTradingConfig = () => {
      try {
        const storedConfig = localStorage.getItem(TRADING_CONFIG_KEY);
        
        if (storedConfig) {
          setTradingConfig(JSON.parse(storedConfig));
        }
      } catch (error) {
        console.error('트레이딩 설정 복원 실패:', error);
      }
    };
    
    loadTradingConfig();
    
    // 인증된 상태인 경우 트레이딩 상태 조회
    if (isAuthenticated && apiKeys) {
      fetchTradingStatus();
    }
  }, [isAuthenticated, apiKeys]);
  
  /**
   * 트레이딩 상태 조회 함수
   */
  const fetchTradingStatus = async () => {
    if (!isAuthenticated || !apiKeys) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/trading/status`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          accessKey: apiKeys.accessKey,
          secretKey: apiKeys.secretKey
        }
      });
      
      const { status } = response.data;
      
      if (status) {
        setTradingStatus(status);
        setIsTrading(status.isRunning);
      } else {
        setTradingStatus(null);
        setIsTrading(false);
      }
    } catch (error) {
      console.error('트레이딩 상태 조회 실패:', error);
      setError('트레이딩 상태를 조회하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 트레이딩 시작 함수
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   */
  const startTrading = async (market) => {
    if (!isAuthenticated || !apiKeys) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/trading/start`, {
        accessKey: apiKeys.accessKey,
        secretKey: apiKeys.secretKey,
        market,
        config: tradingConfig
      });
      
      const { status } = response.data;
      
      setTradingStatus(status);
      setIsTrading(true);
      
      return true;
    } catch (error) {
      console.error('트레이딩 시작 실패:', error);
      setError('트레이딩을 시작하는 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 트레이딩 중지 함수
   */
  const stopTrading = async () => {
    if (!isAuthenticated || !apiKeys) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/trading/stop`, {
        accessKey: apiKeys.accessKey,
        secretKey: apiKeys.secretKey
      });
      
      const { status } = response.data;
      
      setTradingStatus(status);
      setIsTrading(false);
      
      return true;
    } catch (error) {
      console.error('트레이딩 중지 실패:', error);
      setError('트레이딩을 중지하는 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 트레이딩 설정 업데이트 함수
   * @param {Object} newConfig - 새 트레이딩 설정
   */
  const updateTradingConfig = (newConfig) => {
    try {
      // 새 설정으로 업데이트
      setTradingConfig(newConfig);
      
      // 로컬 스토리지에 저장
      localStorage.setItem(TRADING_CONFIG_KEY, JSON.stringify(newConfig));
      
      return true;
    } catch (error) {
      console.error('트레이딩 설정 업데이트 실패:', error);
      setError('트레이딩 설정을 업데이트하는 중 오류가 발생했습니다.');
      return false;
    }
  };
  
  // 컨텍스트 값 정의
  const contextValue = {
    isTrading,
    tradingStatus,
    tradingConfig,
    isLoading,
    error,
    fetchTradingStatus,
    startTrading,
    stopTrading,
    updateTradingConfig
  };
  
  return (
    <TradeContext.Provider value={contextValue}>
      {children}
    </TradeContext.Provider>
  );
};

export default TradeProvider;