import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Shield, Lock, AlertCircle } from 'lucide-react';

// 인증 컨텍스트 임포트
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading, error } = useContext(AuthContext);
  
  // 입력 상태 관리
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // 사용자가 이미 인증된 경우 대시보드로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    // 입력 검증
    if (!accessKey.trim()) {
      setLocalError('액세스 키를 입력해주세요.');
      return;
    }
    
    if (!secretKey.trim()) {
      setLocalError('시크릿 키를 입력해주세요.');
      return;
    }
    
    // 로그인 시도
    const success = await login({ accessKey, secretKey });
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            업비트 트레이딩 봇
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            API 키를 입력하여 시작하세요
          </p>
        </div>
        
        {/* 에러 메시지 */}
        {(error || localError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700">{error || localError}</span>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 액세스 키 입력 필드 */}
            <div className="mb-4">
              <label htmlFor="access-key" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Key className="h-4 w-4 mr-1" />
                액세스 키
              </label>
              <input
                id="access-key"
                name="accessKey"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="액세스 키를 입력하세요"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
              />
            </div>
            
            {/* 시크릿 키 입력 필드 */}
            <div className="mb-4">
              <label htmlFor="secret-key" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Shield className="h-4 w-4 mr-1" />
                시크릿 키
              </label>
              <div className="relative">
                <input
                  id="secret-key"
                  name="secretKey"
                  type={showSecretKey ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="시크릿 키를 입력하세요"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  <Lock className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 옵션 체크박스 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                정보 기억하기
              </label>
            </div>
            
            {/* 테스트 모드 안내 */}
            <div className="text-sm">
              <span className="text-blue-600 hover:text-blue-500">
                처음이신가요?
              </span>
            </div>
          </div>
          
          {/* 로그인 버튼 */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </span>
              ) : '시작하기'}
            </button>
          </div>
          
          {/* 안내 텍스트 */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              업비트 API 키는 <a href="https://upbit.com/service_center/open_api_guide" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-500">업비트 개발자 센터</a>에서 발급받을 수 있습니다.
            </p>
            <p className="mt-2">
              키는 안전하게 저장되며, 로컬에서만 사용됩니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;