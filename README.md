# 업비트 트레이딩 봇 웹 프로젝트

Figma 디자인에서 시작하여 웹 기반 업비트 자동 매매 봇까지 구현한 풀스택 프로젝트입니다.

## 프로젝트 기능

- 실시간 시세 모니터링
- 다양한 트레이딩 전략 설정
- 자동 매매 실행 및 모니터링
- 포트폴리오 및 수익률 분석
- 거래 내역 조회
- 가격 알림 설정

## 기술 스택

### 프론트엔드
- React.js
- Tailwind CSS
- Recharts (차트 시각화)
- Context API (상태 관리)

### 백엔드
- Node.js
- Express
- WebSocket (실시간 데이터)

### API 통합
- 업비트 API 연동

## 프로젝트 구조

```
upbit-trading-bot-web-project/
├── frontend/                # 프론트엔드 애플리케이션
│   ├── public/              # 정적 파일
│   └── src/                 # 소스 코드
│       ├── api/             # API 연동 코드
│       ├── components/      # UI 컴포넌트
│       ├── contexts/        # React Context
│       ├── pages/           # 페이지 컴포넌트
│       └── utils/           # 유틸리티 함수
│
├── backend/                 # 백엔드 서버
│   ├── server.js            # 메인 서버 파일
│   └── utils/               # 백엔드 유틸리티
│
└── docs/                    # 프로젝트 문서화
```

## 설치 및 실행 방법

### 사전 요구사항
- Node.js 14.x 이상
- npm 또는 yarn
- 업비트 API 키

### 프론트엔드 설정
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

### 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
touch .env
# .env 파일에 필요한 환경 변수 추가:
# PORT=5000
# UPBIT_ACCESS_KEY=your_access_key
# UPBIT_SECRET_KEY=your_secret_key

# 서버 시작
npm start
```

## 개발 및 기여 방법

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 생성합니다.

## 라이선스

MIT 라이선스에 따라 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

프로젝트 관련 문의는 GitHub 이슈를 통해 해주세요.
