# 피드백 시스템 구현 가이드

## 개요
온누리교회 AR 앱에 구현된 종합적인 피드백 시스템으로, 사용자 경험을 크게 향상시키는 햅틱 및 시각적 피드백을 제공합니다.

## 주요 기능

### 1. 햅틱 피드백 시스템
- **경량 피드백**: UI 버튼 터치, 일반적인 상호작용
- **중간 피드백**: AR 버튼, 중요한 액션
- **강력 피드백**: 성공/실패, 경고, 시스템 이벤트
- **패턴 피드백**: 성공 패턴(2번), 에러 패턴(3번)

### 2. 시각적 피드백
- **터치 리플**: 터치 지점에 원형 파장 효과
- **모델 하이라이트**: 3D 모델 터치 시 하이라이트 효과
- **버튼 스케일**: 터치 시 스케일 다운 애니메이션
- **AR 버튼 펄스**: 지속적인 펄스 애니메이션

### 3. 실시간 통신
- **Model Viewer → Flutter**: postMessage API 활용
- **Flutter → Model Viewer**: iframe 통신
- **이벤트 기반**: 모든 상호작용이 즉시 피드백으로 연결

## 파일 구조

```
lib/
├── feedback_manager.dart          # 중앙 피드백 관리 시스템
├── model_viewer_widget_web.dart   # Model Viewer와 Flutter 브리지
├── main.dart                      # 메인 앱 (FeedbackButton 통합)
└── liquid_glass_theme.dart        # 스타일링 (피드백 제거)

web/
└── model_viewer.html              # 시각적 효과 및 이벤트 처리
```

## 구현 세부사항

### FeedbackManager 클래스
```dart
// 사용 예시
FeedbackManager.lightImpact();        // 가벼운 터치
FeedbackManager.mediumImpact();       // AR 버튼
FeedbackManager.heavyImpact();        // 중요한 이벤트
FeedbackManager.successPattern();     // 성공 패턴
FeedbackManager.errorPattern();       // 에러 패턴
```

### 피드백 타입별 용도

#### 햅틱 피드백 매핑
- **lightImpact**: UI 버튼, 모델 터치, 제스처 종료
- **mediumImpact**: AR 버튼, 정보/공유 버튼
- **heavyImpact**: AR 세션 시작/종료, 에러
- **selectionClick**: 제스처 시작, 선택 변경

#### 시각적 피드백
- **TouchRipple**: 터치 지점에서 확산되는 원형 효과
- **ModelHighlight**: 3D 모델 터치 하이라이트
- **ButtonScale**: 버튼 터치 시 스케일 애니메이션
- **ARButtonPulse**: AR 버튼의 지속적 펄스

### Model Viewer-Flutter 통신

#### Flutter → Model Viewer 메시지
```dart
_sendMessageToModelViewer({
  'type': 'startAR',
  'data': {}
});
```

#### Model Viewer → Flutter 메시지
```javascript
sendMessageToFlutter('arButtonPressed');
sendMessageToFlutter('modelTouched', { x: 100, y: 200 });
sendMessageToFlutter('gestureStart', { type: 'rotate' });
```

### 이벤트 타입

#### AR 관련
- `arButtonPressed`: AR 버튼 터치
- `arSessionStarted`: AR 세션 시작
- `arSessionEnded`: AR 세션 종료

#### 모델 상호작용
- `modelTouched`: 3D 모델 터치
- `modelLoaded`: 모델 로딩 완료
- `gestureStart`: 제스처 시작 (rotate/pinch)
- `gestureEnd`: 제스처 종료

#### 시스템 이벤트
- `error`: 오류 발생
- `htmlLoaded`: HTML 초기화 완료

## 사용자 경험 개선사항

### 1. 직관적 피드백
- 터치할 때마다 즉각적인 햅틱 응답
- 시각적 터치 리플로 터치 확인
- 제스처별 맞춤형 피드백

### 2. AR 세션 피드백
- AR 시작 시 특별한 패턴 진동
- 세션 종료 시 부드러운 마무리 진동
- AR 버튼의 지속적 시각적 유도

### 3. 에러 처리
- 오류 발생 시 구별되는 에러 패턴
- 성공 시 만족감을 주는 성공 패턴
- 중요도에 따른 피드백 강도 조절

## 성능 최적화

### 1. 메모리 관리
- 애니메이션 자동 정리
- 이벤트 리스너 적절한 해제
- DOM 요소 생성/삭제 최적화

### 2. 배터리 효율성
- 적절한 진동 강도와 지속시간
- 불필요한 연속 피드백 방지
- 사용자 설정에 따른 피드백 조절 가능

### 3. 반응성
- 터치 이벤트 즉시 처리
- 비동기 피드백으로 UI 블로킹 방지
- 부드러운 애니메이션 곡선

## 테스트 가이드

### 1. 햅틱 피드백 테스트
```bash
# Flutter Web에서 실행
flutter run -d chrome --web-renderer canvaskit
```

### 2. 확인사항
- [ ] AR 버튼 터치 시 중간 강도 진동
- [ ] 3D 모델 터치 시 가벼운 진동 + 하이라이트
- [ ] 제스처 시작/종료 시 적절한 피드백
- [ ] 정보/공유 버튼 터치 시 스케일 + 진동
- [ ] AR 세션 시작/종료 시 패턴 진동

### 3. 브라우저별 테스트
- Chrome (권장): 모든 기능 지원
- Safari: 햅틱 피드백 제한적
- Firefox: 기본 기능 지원

## 향후 개선사항

### 1. 사용자 설정
- 햅틱 피드백 강도 조절
- 시각적 효과 on/off
- 접근성 모드 지원

### 2. 고급 피드백
- 공간 오디오 피드백
- 3D 터치 지원 (iOS)
- 제스처별 맞춤 진동 패턴

### 3. 분석 및 최적화
- 사용자 피드백 패턴 분석
- 배터리 사용량 모니터링
- 성능 메트릭 수집

## 결론

구현된 피드백 시스템은 사용자에게 직관적이고 만족스러운 AR 경험을 제공합니다. 햅틱과 시각적 피드백의 조합으로 터치 반응성이 크게 향상되었으며, 특히 AR 세션에서의 몰입감이 증대되었습니다.

### 주요 성과
- **사용자 만족도 향상**: 즉각적이고 직관적인 피드백
- **접근성 개선**: 시각적/촉각적 다중 감각 피드백
- **AR 경험 강화**: 실제 공간과의 상호작용 감각 증대
- **코드 품질**: 모듈화된 피드백 시스템으로 유지보수성 향상