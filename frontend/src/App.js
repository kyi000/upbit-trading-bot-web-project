import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 페이지 컴포넌트 임포트
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';

// 컨텍스트 제공자 임포트
import { AuthProvider } from './contexts/AuthContext';
import { TradeProvider } from './contexts/TradeContext';

// 인증이 필요한 라우트를 위한 보호 컴포넌트
const ProtectedRoute = ({ children }) => {
  // 로컬 스토리지에서 인증 정보 확인
  const isAuthenticated = localStorage.getItem('upbit_trading_auth') !== null;
  
  if (!isAuthenticated) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <TradeProvider>
        <Router>
          <Routes>
            {/* 로그인 페이지 */}
            <Route path="/login" element={<Login />} />
            
            {/* 대시보드 - 인증 필요 */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* 설정 - 인증 필요 */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* 기본 경로는 로그인 또는 대시보드로 리디렉션 */}
            <Route path="/" element={
              localStorage.getItem('upbit_trading_auth') !== null ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
            } />
            
            {/* 없는 경로는 대시보드로 리디렉션 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </TradeProvider>
    </AuthProvider>
  );
};

export default App;