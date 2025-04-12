import React, { createContext, useState, useEffect } from 'react';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

// 로컬 스토리지 키
const AUTH_STORAGE_KEY = 'upbit_trading_auth';

/**
 * 인증 컨텍스트 제공자 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 요소
 */
export const AuthProvider = ({ children }) => {
  // 상태 정의
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKeys, setApiKeys] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 인증 정보 복원
  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          setApiKeys(authData.apiKeys);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('인증 정보 복원 실패:', error);
        setError('인증 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuth();
  }, []);

  /**
   * 로그인 함수
   * @param {Object} keys - API 키 객체
   * @param {string} keys.accessKey - 액세스 키
   * @param {string} keys.secretKey - 시크릿 키
   * @returns {Promise<boolean>} 로그인 성공 여부
   */
  const login = async (keys) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API 키 유효성 검증
      // 실제 구현에서는 서버에 요청하여 키 유효성 확인
      // 이 예제에서는 간단히 키가 존재하는지만 확인
      if (!keys.accessKey || !keys.secretKey) {
        throw new Error('API 키를 모두 입력해주세요.');
      }
      
      // API 키 정보 저장
      setApiKeys(keys);
      setIsAuthenticated(true);
      
      // 로컬 스토리지에 인증 정보 저장
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        apiKeys: keys
      }));
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 로그아웃 함수
   */
  const logout = () => {
    // 인증 상태 초기화
    setIsAuthenticated(false);
    setApiKeys(null);
    
    // 로컬 스토리지에서 인증 정보 제거
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  /**
   * API 키 업데이트 함수
   * @param {Object} newKeys - 새 API 키 객체
   * @param {string} newKeys.accessKey - 액세스 키
   * @param {string} newKeys.secretKey - 시크릿 키
   * @returns {Promise<boolean>} 업데이트 성공 여부
   */
  const updateApiKeys = async (newKeys) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API 키 유효성 검증
      if (!newKeys.accessKey || !newKeys.secretKey) {
        throw new Error('API 키를 모두 입력해주세요.');
      }
      
      // API 키 정보 업데이트
      setApiKeys(newKeys);
      
      // 로컬 스토리지에 인증 정보 업데이트
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        apiKeys: newKeys
      }));
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 컨텍스트 값 정의
  const contextValue = {
    isAuthenticated,
    apiKeys,
    isLoading,
    error,
    login,
    logout,
    updateApiKeys
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;