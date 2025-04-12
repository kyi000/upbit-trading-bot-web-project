import axios from 'axios';

// API 기본 URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 업비트 API 클라이언트 클래스
 */
class UpbitAPI {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });
  }

  /**
   * 계좌 잔고 조회
   * @returns {Promise<Array>} 계좌 정보 배열
   */
  async getAccounts() {
    try {
      const response = await this.axios.post('/accounts', {
        accessKey: this.accessKey,
        secretKey: this.secretKey
      });
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
      const response = await this.axios.post('/ticker', {
        market,
        accessKey: this.accessKey,
        secretKey: this.secretKey
      });
      return response.data;
    } catch (error) {
      console.error('현재가 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 마켓 코드 목록 조회
   * @returns {Promise<Array>} 마켓 코드 목록
   */
  async getMarkets() {
    try {
      const response = await this.axios.get('/markets');
      return response.data;
    } catch (error) {
      console.error('마켓 코드 목록 조회 실패:', error);
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
  async getMinuteCandles(market, minutes = 1, count = 100) {
    try {
      const response = await this.axios.post('/candles/minutes', {
        market,
        minutes,
        count,
        accessKey: this.accessKey,
        secretKey: this.secretKey
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
      const response = await this.axios.post('/candles/days', {
        market,
        count,
        accessKey: this.accessKey,
        secretKey: this.secretKey
      });
      return response.data;
    } catch (error) {
      console.error('일 캔들 조회 실패:', error);
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
      const response = await this.axios.post('/orders', {
        accessKey: this.accessKey,
        secretKey: this.secretKey,
        order
      });
      return response.data;
    } catch (error) {
      console.error('주문 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 트레이딩 시작
   * @param {string} market - 마켓 코드 (예: KRW-BTC)
   * @param {Object} config - 트레이딩 설정
   * @returns {Promise<Object>} 트레이딩 세션 정보
   */
  async startTrading(market, config = {}) {
    try {
      const response = await this.axios.post('/trading/start', {
        accessKey: this.accessKey,
        secretKey: this.secretKey,
        market,
        config
      });
      return response.data;
    } catch (error) {
      console.error('트레이딩 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 트레이딩 중지
   * @returns {Promise<Object>} 트레이딩 세션 정보
   */
  async stopTrading() {
    try {
      const response = await this.axios.post('/trading/stop', {
        accessKey: this.accessKey,
        secretKey: this.secretKey
      });
      return response.data;
    } catch (error) {
      console.error('트레이딩 중지 실패:', error);
      throw error;
    }
  }

  /**
   * 트레이딩 상태 조회
   * @returns {Promise<Object>} 트레이딩 세션 정보
   */
  async getTradingStatus() {
    try {
      const response = await this.axios.get('/trading/status', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          accessKey: this.accessKey,
          secretKey: this.secretKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('트레이딩 상태 조회 실패:', error);
      throw error;
    }
  }
}

export default UpbitAPI;