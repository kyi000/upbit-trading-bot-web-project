const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

// 환경 변수 로드
dotenv.config();

// 서버 설정
const app = express();
app.use(cors());
app.use(express.json());

// 포트 설정
const PORT = process.env.PORT || 5000;

// 업비트 API 관련 상수
const UPBIT_API_URL = 'https://api.upbit.com/v1';
const UPBIT_WEBSOCKET_URL = 'wss://api.upbit.com/websocket/v1';

// 활성 트레이딩 세션 관리
const tradingSessions = new Map();

/**
 * 업비트 API 호출을 위한 인증 헤더 생성
 * @param {string} accessKey - 업비트 액세스 키
 * @param {string} secretKey - 업비트 시크릿 키
 * @param {Object} params - 쿼리 파라미터 (선택사항)
 * @returns {Object} 인증 헤더
 */
const generateAuthHeader = (accessKey, secretKey, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const payload = query ? `${query}` : '';
  const nonce = uuidv4();
  
  const hash = CryptoJS.HmacSHA512(payload, secretKey);
  const hashInBase64 = hash.toString(CryptoJS.enc.Base64);
  
  return {
    headers: {
      'Access-Key': accessKey,
      'Nonce': nonce,
      'Signature': hashInBase64
    }
  };
};

/**
 * 업비트 API 클라이언트 클래스
 */
class UpbitAPI {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.axios = axios.create({
      baseURL: UPBIT_API_URL,
      timeout: 30000,
    });
  }

  /**
   * 계좌 잔고 조회
   * @returns {Promise<Array>} 계좌 정보 배열
   */
  async getAccounts() {
    try {
      const authHeader = generateAuthHeader(this.accessKey, this.secretKey);
      const response = await this.axios.get('/accounts', authHeader);
      return response.data;
    } catch (error) {
      console.error('계좌 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 현재가 정보 조회
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   * @returns {Promise<Object>} 현재가 정보
   */
  async getTicker(market) {
    try {
      const response = await this.axios.get('/ticker', {
        params: { markets: market }
      });
      return response.data[0];
    } catch (error) {
      console.error('현재가 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 분(Minute) 캔들 조회
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   * @param {number} unit - 분 단위 (1, 3, 5, 15, 10, 30, 60, 240)
   * @param {number} count - 캔들 개수 (최대 200)
   * @returns {Promise<Array>} 캔들 정보 배열
   */
  async getMinuteCandles(market, unit = 1, count = 100) {
    try {
      const response = await this.axios.get(`/candles/minutes/${unit}`, {
        params: { market, count }
      });
      return response.data;
    } catch (error) {
      console.error('분 캔들 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 일(Day) 캔들 조회
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   * @param {number} count - 캔들 개수 (최대 200)
   * @returns {Promise<Array>} 캔들 정보 배열
   */
  async getDayCandles(market, count = 100) {
    try {
      const response = await this.axios.get('/candles/days', {
        params: { market, count }
      });
      return response.data;
    } catch (error) {
      console.error('일 캔들 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 마켓 코드 목록 조회
   * @returns {Promise<Array>} 마켓 코드 목록
   */
  async getMarkets() {
    try {
      const response = await this.axios.get('/market/all');
      return response.data;
    } catch (error) {
      console.error('마켓 코드 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 가능 정보 조회
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   * @returns {Promise<Object>} 주문 가능 정보
   */
  async getOrderChance(market) {
    try {
      const authHeader = generateAuthHeader(this.accessKey, this.secretKey, { market });
      const response = await this.axios.get('/orders/chance', {
        params: { market },
        ...authHeader
      });
      return response.data;
    } catch (error) {
      console.error('주문 가능 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문하기
   * @param {Object} order - 주문 정보
   * @param {string} order.market - 마켓 코드 (예: KRW-BTC)
   * @param {string} order.side - 주문 종류 (bid: 매수, ask: 매도)
   * @param {number} order.volume - 주문량 (지정가, 시장가 매도 시 필수)
   * @param {number} order.price - 주문 가격 (지정가, 시장가 매수 시 필수)
   * @param {string} order.ord_type - 주문 타입 (limit: 지정가, market: 시장가, price: 시장가 매수)
   * @returns {Promise<Object>} 주문 결과
   */
  async createOrder(order) {
    try {
      const authHeader = generateAuthHeader(this.accessKey, this.secretKey, order);
      const response = await this.axios.post('/orders', order, authHeader);
      return response.data;
    } catch (error) {
      console.error('주문 생성 실패:', error);
      throw error;
    }
  }
}

// API 라우트 정의
// 인증 미들웨어 (실제 서비스에서는 제대로 된 인증 구현 필요)
const authenticate = (req, res, next) => {
  const { accessKey, secretKey } = req.body;
  
  if (!accessKey || !secretKey) {
    return res.status(401).json({ error: 'API 키가 필요합니다.' });
  }
  
  // 임시 사용자 ID (실제 서비스에서는 인증된 사용자 ID 사용)
  req.userId = accessKey.substring(0, 8);
  next();
};

// 계좌 정보 조회
app.post('/api/accounts', authenticate, async (req, res) => {
  try {
    const { accessKey, secretKey } = req.body;
    const api = new UpbitAPI(accessKey, secretKey);
    
    const accounts = await api.getAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('계좌 정보 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 현재가 조회
app.post('/api/ticker', async (req, res) => {
  try {
    const { market, accessKey, secretKey } = req.body;
    const api = new UpbitAPI(accessKey, secretKey);
    
    const ticker = await api.getTicker(market);
    res.json(ticker);
  } catch (error) {
    console.error('현재가 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 마켓 목록 조회
app.get('/api/markets', async (req, res) => {
  try {
    const api = new UpbitAPI('', ''); // 마켓 목록은 인증 필요 없음
    
    const markets = await api.getMarkets();
    res.json(markets);
  } catch (error) {
    console.error('마켓 목록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 캔들 조회
app.post('/api/candles/:unit', async (req, res) => {
  try {
    const { unit } = req.params;
    const { market, count, accessKey, secretKey } = req.body;
    const api = new UpbitAPI(accessKey, secretKey);
    
    let candles;
    
    switch (unit) {
      case 'minutes':
        const minutes = req.body.minutes || 1;
        candles = await api.getMinuteCandles(market, minutes, count);
        break;
      case 'days':
        candles = await api.getDayCandles(market, count);
        break;
      default:
        return res.status(400).json({ error: '지원하지 않는 캔들 단위입니다.' });
    }
    
    res.json(candles);
  } catch (error) {
    console.error('캔들 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 주문
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const { accessKey, secretKey, order } = req.body;
    const api = new UpbitAPI(accessKey, secretKey);
    
    const result = await api.createOrder(order);
    res.json(result);
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});