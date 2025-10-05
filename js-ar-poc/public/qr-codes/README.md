# QR 코드 사용 가이드

## 📱 생성된 QR 코드

### 깔끔한 버전 (권장)
- **qr-1.png** → 온누리 교회 모델 01 (church-model-01)
- **qr-2.png** → 온누리 교회 모델 02 (church-model-02)
- **qr-3.png** → 온누리 교회 모델 03 (church-model-03)

---

## 🎯 추천 사용법

### 실제 배치 시 (행사용)
```
📍 위치 1    → qr-1.png 인쇄 부착 (온누리 교회 모델 01)
📍 위치 2    → qr-2.png 인쇄 부착 (온누리 교회 모델 02)
📍 위치 3    → qr-3.png 인쇄 부착 (온누리 교회 모델 03)
```

### 인쇄 권장 사항
- **크기**: 최소 10cm x 10cm (A4 용지 1/4 크기)
- **해상도**: 300 DPI 이상
- **배경**: 흰색 (대비 최대화)
- **위치**: 눈높이 (약 1.5m)
- **설명**: QR 옆에 "AR로 보기" 같은 안내문 추가

---

## 📲 사용자 경험 흐름

1. **QR 코드 스캔**
   ```
   사용자가 핸드폰 카메라로 QR 스캔
   → 웹앱 자동 실행
   ```

2. **모델 자동 선택**
   ```
   qr-1.png 스캔 → "온누리 교회 01" 모델 로드
   qr-2.png 스캔 → "온누리 교회 02" 모델 로드
   qr-3.png 스캔 → "온누리 교회 03" 모델 로드
   ```

3. **AR 실행**
   ```
   "온누리 교회 01 AR로 보기" 버튼 클릭
   → AR Quick Look (iOS) 또는 Scene Viewer (Android) 실행
   → 공간에 3D 모델 배치
   ```

---

## 🧪 테스트 방법

### 로컬 테스트
1. Vite 개발 서버 실행
   ```bash
   npm run dev
   ```

2. 핸드폰으로 QR 코드 스캔
   - iOS: 카메라 앱 또는 QR 리더 사용
   - Android: Chrome 카메라 또는 QR 리더 사용

3. 자동으로 웹앱 실행되고 모델 로드 확인

### 확인 사항
- ✅ 모델 정보 토스트 표시: "🧊 온누리 교회 01"
- ✅ AR 버튼 텍스트: "온누리 교회 01 AR로 보기"
- ✅ AR 실행 시 올바른 모델 표시

---

## 🔧 문제 해결

### QR 스캔이 안 될 때
- QR 코드 크기를 키워서 재인쇄
- 조명 확인 (어두우면 스캔 어려움)
- 카메라 렌즈 청소

### 잘못된 모델이 로드될 때
- QR 코드 내용 확인 (1, 2, 3 중 하나인지)
- 브라우저 캐시 삭제 후 재시도
- 개발자 도구 콘솔에서 에러 확인

### AR이 실행 안 될 때
- iOS: AR Quick Look 지원 확인 (iOS 12+)
- Android: ARCore 지원 확인, Chrome 90+ 버전 확인

---

## 📊 매핑 규칙

### model-config.js 설정
```javascript
'1' → MODEL_MAPPING['MODEL_CHURCH_01']  // church-model-01.glb/usdz
'2' → MODEL_MAPPING['MODEL_CHURCH_02']  // church-model-02.glb/usdz
'3' → MODEL_MAPPING['MODEL_CHURCH_03']  // church-model-03.glb/usdz
```

### 추가 지원 포맷
QR 코드에 다음 내용을 넣어도 작동:
- "MODEL_CHURCH_01" → 온누리 교회 01
- "MODEL_CHURCH_02" → 온누리 교회 02
- "MODEL_CHURCH_03" → 온누리 교회 03

---

## 🎉 완료!

이제 QR 코드를 인쇄해서 원하는 위치에 부착하시면 됩니다.

**파일 위치**: `/public/qr-codes/`
**권장 파일**: `qr-1.png`, `qr-2.png`, `qr-3.png`

### 매핑 결과
```
qr-1.png (내용: "1") → church-model-01.glb/usdz
qr-2.png (내용: "2") → church-model-02.glb/usdz
qr-3.png (내용: "3") → church-model-03.glb/usdz
```
