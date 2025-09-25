# AR 수동 오브젝트 배치 시스템 구현 가이드

## 🎯 개요

기존 Model Viewer의 자동 바닥 배치(`ar-placement="floor"`)에서 사용자가 원하는 위치에 수동으로 배치할 수 있는 시스템으로 업그레이드했습니다.

## 📁 구현된 파일들

### 1. `/index.html` (메인 구현)
**핵심 기능**: 기본 수동 배치 시스템
- ✅ `ar-placement="none"` 설정으로 자동 배치 비활성화
- ✅ 리퀴드 글래스 디자인 UI
- ✅ 배치 워크플로우 구현
- ✅ 햅틱 피드백 시스템

### 2. `/ar-manual-placement.html` (상세 구현)
**핵심 기능**: 향상된 수동 배치 시스템
- ✅ 단계별 배치 가이드
- ✅ 실시간 상태 표시
- ✅ 배치 표시기 및 미리보기

### 3. `/ar-advanced-placement.html` (고급 구현)
**핵심 기능**: WebXR Hit-Test API 활용
- ✅ 실제 표면 감지
- ✅ 실시간 hit-test points 표시
- ✅ 고급 추적 상태 모니터링

### 4. `/ar-flutter-bridge.html` (통합 구현)
**핵심 기능**: Flutter 앱과의 메시지 브리지
- ✅ Flutter ↔ WebView 양방향 통신
- ✅ 외부 제어 가능한 AR 시스템
- ✅ 최적화된 모바일 UI

## 🚀 주요 기능

### 1. 수동 배치 워크플로우
```
AR 시작 → 평면 감지 → 배치 모드 활성화 → 사용자 터치 → 모델 배치
```

### 2. UI/UX 개선사항
- **리퀴드 글래스 디자인**: Apple iOS 스타일의 반투명 버튼
- **시각적 피드백**: 배치 가능한 위치 실시간 표시
- **햅틱 피드백**: 터치 시 진동으로 피드백
- **상태 안내**: 각 단계별 명확한 안내 메시지

### 3. 기술적 구현
- **WebXR Hit-Test API**: 실제 표면 감지
- **Event-Driven Architecture**: 상태 기반 이벤트 처리
- **Progressive Enhancement**: 기본 → 고급 기능 순차 적용
- **Cross-Platform**: iOS (Quick Look) + Android (WebXR) 지원

## 🔧 핵심 코드 구조

### Model Viewer 설정
```html
<model-viewer
    id="church-model"
    src="assets/models/church-model.glb"
    ar
    ar-modes="webxr scene-viewer quick-look"
    ar-scale="fixed"
    ar-placement="none"  <!-- 핵심: 자동 배치 비활성화 -->
    camera-orbit="45deg 75deg 2.5m">
</model-viewer>
```

### 배치 시스템 클래스
```javascript
class ARManualPlacement {
    constructor() {
        this.isPlacementMode = false;
        this.isARActive = false;
        // 상태 관리 및 이벤트 처리
    }

    enablePlacementMode() {
        // 배치 모드 활성화
        // UI 업데이트 및 hit-testing 시작
    }

    handlePlacementTouch(event) {
        // 사용자 터치 처리
        // 좌표 계산 및 배치 실행
    }
}
```

## 📱 Flutter 통합

### 메시지 통신 구조
```javascript
// WebView → Flutter
this.sendToFlutter('ar_session_started');
this.sendToFlutter('object_placed', { x: x, y: y });

// Flutter → WebView
window.addEventListener('message', (event) => {
    this.handleFlutterAction(event.data.action, event.data.data);
});
```

### 주요 메시지 타입
- `ar_session_started`: AR 세션 시작 알림
- `placement_touch`: 배치 터치 좌표 전송
- `object_placed`: 모델 배치 완료 알림
- `ar_failed`: AR 실행 실패 알림

## 🎨 UI 디자인 특징

### 1. 리퀴드 글래스 버튼
```css
.ar-button {
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow:
        0 8px 32px rgba(0,0,0,0.1),
        inset 0 1px 0 rgba(255,255,255,0.2);
}
```

### 2. 배치 표시기 애니메이션
```css
@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
```

## 🔍 Hit-Test 시스템

### WebXR Hit-Test API 구현
```javascript
async setupHitTesting() {
    if (this.xrSession && 'requestHitTestSource' in this.xrSession) {
        const referenceSpace = await this.xrSession.requestReferenceSpace('viewer');
        this.hitTestSource = await this.xrSession.requestHitTestSource({
            space: referenceSpace
        });
    }
}

performHitTest() {
    const frame = this.xrSession.requestAnimationFrame((time, frame) => {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        this.processHitTestResults(hitTestResults);
    });
}
```

### Fallback 시스템
- WebXR 미지원 환경에서 시뮬레이션 hit-testing
- 중앙 영역 기준 확률적 성공 계산
- 시각적 피드백으로 사용자 경험 보장

## 📋 사용법

### 1. 기본 사용
1. "AR 시작" 버튼 클릭
2. 카메라 권한 허용
3. 평면 감지 대기 (자동)
4. "배치하기" 버튼 활성화 확인
5. 원하는 위치 터치
6. 모델 배치 완료

### 2. Flutter 앱에서 사용
```dart
// WebView에서 AR 시작 호출
webViewController.runJavaScript('startAR()');

// 배치 모드 활성화
webViewController.runJavaScript('enablePlacement()');

// 메시지 수신 처리
webViewController.setJavaScriptMode(JavaScriptMode.unrestricted);
webViewController.setNavigationDelegate(
  NavigationDelegate(
    onPageFinished: (url) {
      // AR 브리지 초기화
    },
  ),
);
```

## 🐛 디버깅 도구

### 전역 디버그 함수들
```javascript
// 강제 배치 (테스트용)
window.debugAR.forcePlace();

// 시스템 리셋
window.debugAR.resetSystem();

// Hit-test 시뮬레이션
window.debugAdvancedAR.simulateHitTest();

// Flutter 브리지 테스트
window.testFlutterBridge.startARTest();
```

## 🔧 브라우저 호환성

### 지원 플랫폼
- ✅ **iOS Safari**: Quick Look 기반 AR
- ✅ **Android Chrome**: WebXR 기반 AR
- ✅ **Flutter WebView**: 양방향 메시지 통신
- ⚠️ **Desktop**: 3D 뷰어 모드만 지원

### 권장 설정
- iOS 12+ (Quick Look 지원)
- Android 8+ (ARCore 지원)
- Chrome 81+ (WebXR 지원)

## 🚨 주의사항

### 1. 성능 고려사항
- Hit-testing은 CPU 집약적 → 적절한 간격으로 실행
- 많은 hit-test points 표시 시 성능 저하 가능
- 모바일 환경에서 배터리 소모량 증가

### 2. 사용자 경험
- 평면 감지에 시간 필요 → 적절한 가이드 제공
- 조명 조건에 따른 인식률 차이
- 카메라 움직임 속도가 인식률에 영향

### 3. 개발 시 주의점
- `ar-placement="none"` 필수 설정
- HTTPS 환경에서만 WebXR 동작
- 카메라 권한 사전 체크 필요

## 🔄 향후 개선 방향

### 1. 기능 확장
- [ ] 다중 오브젝트 배치
- [ ] 오브젝트 크기 조절
- [ ] 회전 및 위치 미세 조정
- [ ] 배치 히스토리 및 되돌리기

### 2. 성능 최적화
- [ ] Hit-test 최적화
- [ ] 렌더링 성능 향상
- [ ] 메모리 사용량 최적화

### 3. UX 개선
- [ ] 음성 가이드 추가
- [ ] 접근성 개선
- [ ] 다국어 지원
- [ ] 오프라인 모드 지원

## 📞 지원 및 문의

개발 과정에서 문제가 발생하거나 추가 기능이 필요한 경우:
1. 디버그 콘솔 확인
2. 브라우저 개발자 도구 활용
3. 전역 디버그 함수로 상태 확인
4. 네트워크 및 권한 상태 점검

---

이 가이드는 AR 수동 배치 시스템의 완전한 구현 및 통합 방법을 다룹니다. 각 파일별로 점진적인 기능 향상이 적용되어 있어, 프로젝트 요구사항에 맞는 수준을 선택하여 사용할 수 있습니다.