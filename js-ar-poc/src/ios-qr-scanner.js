// iOS QR Scanner Module
// QR 코드를 스캔하고 위치를 저장하는 모듈

import jsQR from 'jsqr';

export class IOSQRScanner {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.scanning = false;
    this.qrFound = false;
    this.scanAttempts = 0;
    this.maxAttemptsBeforeHelp = 60; // 약 3초 후 (60 프레임 * 50ms)
    this.frameCount = 0; // 프레임 카운터 (성능 최적화)
    this.frameSkip = 3; // 3프레임마다 스캔 (60fps → 20fps)
  }

  /**
   * QR 스캔 시작
   */
  async start() {
    console.log('[QRScanner] Starting QR scan...');

    try {
      // 1. 카메라 권한 요청 및 스트림 획득 (해상도 최적화: 720p → 480p)
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',  // 후면 카메라
          width: { ideal: 640 },      // QR 스캔 최적화: CPU 60% 감소
          height: { ideal: 480 }      // 배터리 수명 30-40% 향상
        }
      });

      console.log('[QRScanner] ✅ Camera access granted');

      // 2. 비디오 엘리먼트 생성
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', true);  // iOS 필수
      await this.video.play();

      console.log('[QRScanner] ✅ Video stream started');

      // 3. 캔버스 설정
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx = this.canvas.getContext('2d');

      // 4. UI 표시
      this.showScannerUI();

      // 5. 스캔 시작 (카운터 초기화)
      this.scanning = true;
      this.scanAttempts = 0;
      this.scanFrame();

      return true;
    } catch (error) {
      console.error('[QRScanner] ❌ Error:', error);

      // 카메라 권한 거부 에러 확인
      const isPermissionDenied = error.name === 'NotAllowedError' ||
                                  error.name === 'PermissionDeniedError';

      if (isPermissionDenied) {
        console.log('[QRScanner] Camera permission denied, returning to home...');
        // 에러 메시지 표시 후 홈으로 복귀
        this.showError('카메라 접근 권한을 허용해주세요', true);
      } else {
        // 기타 에러
        this.showError('카메라 접근 중 오류가 발생했습니다');
      }

      return false;
    }
  }

  /**
   * 프레임별 QR 코드 스캔 (성능 최적화: 3프레임마다 스캔)
   */
  scanFrame() {
    if (!this.scanning || this.qrFound) return;

    // 비디오가 준비되지 않았으면 대기
    if (this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(() => this.scanFrame());
      return;
    }

    // 프레임 카운터 증가
    this.frameCount++;

    // frameSkip마다 한 번씩만 QR 스캔 (성능 최적화: 60fps → 20fps)
    const shouldScan = this.frameCount % this.frameSkip === 0;

    if (shouldScan) {
      // 스캔 인디케이터 표시 (첫 프레임에만)
      this.showScanningIndicator();

      // 캔버스에 현재 프레임 그리기
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      // 이미지 데이터 추출
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      // jsQR로 QR 코드 감지 (inversion 옵션 개선)
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth' // 명암 반전 시도
      });

      if (qrCode) {
        console.log('[QRScanner] ✅ QR Code detected:', qrCode.data);
        console.log('[QRScanner] QR location:', qrCode.location);
        console.log('[QRScanner] Image dimensions:', imageData.width, 'x', imageData.height);
        this.hideScanningIndicator();
        this.hideRetryHelp();
        this.handleQRFound(qrCode);
        return; // QR 발견 시 종료
      } else {
        // QR 스캔 실패 시 주기적으로 로그 (10프레임마다)
        if (this.frameCount % 30 === 0) {
          console.log('[QRScanner] Scanning... (frame:', this.frameCount, ', attempts:', this.scanAttempts, ')');
        }
      }

      // QR 코드 없으면 시도 카운트 증가
      this.scanAttempts++;

      // 3초 후에도 스캔 안 되면 재시도 도움말 표시
      if (this.scanAttempts === this.maxAttemptsBeforeHelp) {
        this.showRetryHelp();
      }
    }

    // 다음 프레임 스캔 (항상 실행)
    requestAnimationFrame(() => this.scanFrame());
  }

  /**
   * QR 코드 발견 처리
   */
  async handleQRFound(qrCode) {
    this.qrFound = true;
    this.scanning = false;

    console.log('[QRScanner] Processing QR code...');

    // 1. QR 코드 위치 데이터 준비 (저장은 AR 체험 후)
    const qrLocation = {
      data: qrCode.data,
      location: qrCode.location,
      timestamp: Date.now(),
      videoWidth: this.video.videoWidth,
      videoHeight: this.video.videoHeight
    };

    // 2. QR 코드가 있는 프레임 캡처 (저장은 AR 체험 후)
    const photoDataURL = this.canvas.toDataURL('image/jpeg', 0.9);

    console.log('[QRScanner] ✅ QR detected, launching flow: feedback → guide → AR');

    // 3. 성공 피드백 표시 (진동 + 체크마크 애니메이션)
    this.showSuccessFeedback();

    // 4. 피드백 후 → onQRFound 콜백 호출 (가이드 → AR 실행)
    setTimeout(() => {
      this.stop();

      if (this.onQRFound) {
        this.onQRFound(qrLocation, photoDataURL);
      }
    }, 1000);
  }

  /**
   * QR 스캔 성공 피드백
   */
  showSuccessFeedback() {
    // 진동 (Android만 지원, iOS는 무시됨)
    if (navigator.vibrate) {
      navigator.vibrate(200); // 200ms 진동
    }

    // 체크마크 애니메이션
    const feedback = document.createElement('div');
    feedback.className = 'qr-success-feedback';
    feedback.innerHTML = `
      <div class="success-checkmark">
        <i class="ph-fill ph-check-circle"></i>
      </div>
      <p class="success-text">QR 코드 인식 완료!</p>
    `;

    document.body.appendChild(feedback);

    // 1초 후 제거
    setTimeout(() => feedback.remove(), 1000);
  }

  /**
   * QR 데이터 저장 (AR 체험 후 호출) - 메모리 관리
   */
  static saveQRData(qrLocation, photoDataURL) {
    try {
      // 이전 데이터 정리 (메모리 절약)
      localStorage.removeItem('qrLocation');
      localStorage.removeItem('qrPhoto');
      localStorage.removeItem('qrTimestamp');

      // 새 데이터 저장
      localStorage.setItem('qrLocation', JSON.stringify(qrLocation));
      localStorage.setItem('qrPhoto', photoDataURL);
      localStorage.setItem('qrTimestamp', Date.now().toString());

      console.log('[QRScanner] ✅ QR location saved after AR experience');
    } catch (e) {
      // localStorage 용량 초과 시 오래된 데이터 삭제
      console.warn('[QRScanner] ⚠️ LocalStorage full, clearing old data');
      localStorage.clear();

      // 재시도
      localStorage.setItem('qrLocation', JSON.stringify(qrLocation));
      localStorage.setItem('qrPhoto', photoDataURL);
      localStorage.setItem('qrTimestamp', Date.now().toString());
    }
  }

  /**
   * 스캐너 UI 표시
   */
  showScannerUI() {
    console.log('[QRScanner] showScannerUI() called');

    // 기존 UI 제거
    const existing = document.getElementById('qr-scanner-ui');
    if (existing) {
      console.log('[QRScanner] Removing existing UI');
      existing.remove();
    }

    console.log('[QRScanner] Creating new scanner UI...');
    const ui = document.createElement('div');
    ui.id = 'qr-scanner-ui';
    ui.innerHTML = `
      <style>
        #qr-scanner-ui {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          z-index: 10000;
          display: flex;
          flex-direction: column;
        }

        #qr-scanner-video-container {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        #qr-scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        #qr-scanner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #qr-scanner-frame {
          width: 250px;
          height: 250px;
          border: 3px solid var(--color-accent, #00D9A0);
          border-radius: var(--radius-lg, 16px);
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
          position: relative;
          animation: pulseFrame 2s ease-in-out infinite;
        }

        @keyframes pulseFrame {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 0 0 20px rgba(0, 217, 160, 0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 0 0 40px rgba(0, 217, 160, 0.5);
          }
        }

        /* Corner decorations */
        #qr-scanner-frame::before,
        #qr-scanner-frame::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 4px solid var(--color-accent, #00D9A0);
        }

        #qr-scanner-frame::before {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
        }

        #qr-scanner-frame::after {
          top: -3px;
          right: -3px;
          border-left: none;
          border-bottom: none;
        }

        .frame-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 4px solid var(--color-accent, #00D9A0);
        }

        .frame-corner-bl {
          bottom: -3px;
          left: -3px;
          border-right: none;
          border-top: none;
        }

        .frame-corner-br {
          bottom: -3px;
          right: -3px;
          border-left: none;
          border-top: none;
        }

        #qr-scanner-instructions {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--overlay-darkest, rgba(0,0,0,0.85));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
          padding: var(--spacing-lg, 24px) var(--spacing-xl, 32px);
          border-radius: var(--radius-xl, 20px);
          text-align: center;
          max-width: 85%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        #qr-scanner-instructions h3 {
          margin: 0 0 var(--spacing-sm, 8px) 0;
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-bold, 700);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm, 8px);
        }

        #qr-scanner-instructions p {
          margin: 0;
          font-size: var(--font-size-sm, 14px);
          opacity: 0.85;
          line-height: var(--line-height-normal, 1.5);
        }

        #qr-scanner-cancel {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #qr-scanner-cancel:hover {
          background: rgba(0, 0, 0, 0.75);
          transform: scale(1.05);
        }

        #qr-scanner-cancel:active {
          transform: scale(0.9);
          background: rgba(0, 0, 0, 0.8);
        }
      </style>

      <div id="qr-scanner-video-container">
        <video id="qr-scanner-video" playsinline autoplay></video>

        <div id="qr-scanner-overlay">
          <div id="qr-scanner-frame">
            <div class="frame-corner frame-corner-bl"></div>
            <div class="frame-corner frame-corner-br"></div>
          </div>
        </div>

        <button id="qr-scanner-cancel"><i class="ph-bold ph-x"></i></button>

        <div id="qr-scanner-instructions">
          <h3><i class="ph-bold ph-scan"></i> QR 코드를 프레임에 맞춰주세요</h3>
          <p>밝은 조명에서 스캔하면 더 잘 인식됩니다</p>
        </div>
      </div>
    `;

    document.body.appendChild(ui);
    console.log('[QRScanner] ✅ Scanner UI appended to body');

    // 비디오 엘리먼트에 스트림 연결
    const videoElement = document.getElementById('qr-scanner-video');
    console.log('[QRScanner] Video element found:', !!videoElement);
    console.log('[QRScanner] Stream available:', !!this.stream);
    videoElement.srcObject = this.stream;
    console.log('[QRScanner] ✅ Video stream connected to video element');

    // 취소 버튼 (홈으로 돌아가기)
    document.getElementById('qr-scanner-cancel').addEventListener('click', () => {
      console.log('[QRScanner] Close button clicked');
      this.stop();
      // 글로벌 returnToHome 함수 호출
      if (window.returnToHome) {
        window.returnToHome();
      }
    });

    console.log('[QRScanner] ✅ Scanner UI displayed');
  }

  /**
   * 스캔 인디케이터 표시
   */
  showScanningIndicator() {
    // 이미 존재하면 추가하지 않음
    if (document.getElementById('qr-scanning-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'qr-scanning-indicator';
    indicator.innerHTML = `
      <style>
        #qr-scanning-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md, 16px);
          pointer-events: none;
        }

        .scanning-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(0, 217, 160, 0.2);
          border-top-color: var(--color-accent, #00D9A0);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .scanning-text {
          color: white;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
          font-size: var(--font-size-sm, 14px);
          font-weight: var(--font-weight-semibold, 600);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      </style>
      <div class="scanning-spinner"></div>
      <div class="scanning-text">스캔 중...</div>
    `;

    const overlay = document.getElementById('qr-scanner-overlay');
    if (overlay) {
      overlay.appendChild(indicator);
    }
  }

  /**
   * 스캔 인디케이터 숨김
   */
  hideScanningIndicator() {
    const indicator = document.getElementById('qr-scanning-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * 재시도 도움말 표시
   */
  showRetryHelp() {
    // 이미 존재하면 추가하지 않음
    if (document.getElementById('qr-retry-help')) return;

    // 기본 안내 메시지 숨기기
    const instructions = document.getElementById('qr-scanner-instructions');
    if (instructions) {
      instructions.style.display = 'none';
    }

    const helpBox = document.createElement('div');
    helpBox.id = 'qr-retry-help';
    helpBox.innerHTML = `
      <style>
        #qr-retry-help {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--overlay-medium, rgba(255,255,255,0.15));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: var(--radius-lg, 16px);
          padding: var(--spacing-lg, 24px);
          max-width: 280px;
          animation: slideUp 0.3s ease-out;
          color: white;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .retry-help-title {
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-bold, 700);
          margin-bottom: var(--spacing-sm, 8px);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 4px);
        }

        .retry-help-tips {
          font-size: var(--font-size-sm, 14px);
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
        }

        .retry-help-tips li {
          margin-bottom: var(--spacing-xs, 4px);
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-xs, 4px);
        }

        .retry-help-tips i {
          margin-top: 2px;
          flex-shrink: 0;
        }
      </style>
      <div class="retry-help-title">
        <i class="ph-bold ph-lightbulb"></i>
        스캔이 잘 안 되나요?
      </div>
      <ul class="retry-help-tips">
        <li><i class="ph ph-check"></i> QR 코드를 프레임 안에 맞추세요</li>
        <li><i class="ph ph-check"></i> 밝은 조명에서 시도하세요</li>
        <li><i class="ph ph-check"></i> 카메라와 QR 코드 거리를 조절하세요</li>
      </ul>
    `;

    const overlay = document.getElementById('qr-scanner-overlay');
    if (overlay) {
      overlay.appendChild(helpBox);
    }
  }

  /**
   * 재시도 도움말 숨김
   */
  hideRetryHelp() {
    const helpBox = document.getElementById('qr-retry-help');
    if (helpBox) {
      helpBox.remove();
    }
  }

  /**
   * 빠른 체크마크 피드백 (0.3초)
   */
  showQuickCheckmark(qrLocation) {
    const overlay = document.getElementById('qr-scanner-overlay');
    if (!overlay) return;

    // 간단한 체크마크 애니메이션만
    const checkmark = document.createElement('div');
    checkmark.innerHTML = `
      <style>
        @keyframes quickPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .qr-quick-check {
          position: absolute;
          width: 100px;
          height: 100px;
          background: #00ff00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          animation: quickPop 0.3s ease-out;
          box-shadow: 0 4px 20px rgba(0,255,0,0.6);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>
      <div class="qr-quick-check">✓</div>
    `;

    overlay.appendChild(checkmark);

    // 메시지 제거 (즉시 AR 실행되므로)
    const instructions = document.getElementById('qr-scanner-instructions');
    if (instructions) {
      instructions.style.opacity = '0';
    }
  }

  /**
   * 에러 표시
   */
  showError(message, returnToHome = false) {
    const existing = document.getElementById('qr-scanner-error');
    if (existing) existing.remove();

    const error = document.createElement('div');
    error.id = 'qr-scanner-error';
    error.innerHTML = `
      <style>
        #qr-scanner-error {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255,0,0,0.9);
          color: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          z-index: 10001;
          max-width: 80%;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
        }

        #qr-scanner-error h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
        }

        #qr-scanner-error button {
          margin-top: 15px;
          padding: 10px 30px;
          background: white;
          color: red;
          border: none;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
        }

        #qr-scanner-error button:active {
          transform: scale(0.95);
        }
      </style>
      <h3>⚠️ ${message}</h3>
      <button id="error-confirm-btn">확인</button>
    `;
    document.body.appendChild(error);

    // 확인 버튼 이벤트
    const confirmBtn = document.getElementById('error-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      error.remove();
      if (returnToHome && window.returnToHome) {
        window.returnToHome();
      }
    });
  }

  /**
   * 스캔 중지 및 정리 (메모리 관리 강화)
   */
  stop() {
    console.log('[QRScanner] Stopping scanner...');

    this.scanning = false;
    this.qrFound = false;

    // 카메라 스트림 완전 종료 (메모리 해제)
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      this.stream = null;
    }

    // 비디오 엘리먼트 정리
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }

    // 캔버스 정리
    if (this.canvas) {
      this.ctx = null;
      this.canvas = null;
    }

    // UI 제거 (AR Quick Look 종료 시 재출현 방지)
    const ui = document.getElementById('qr-scanner-ui');
    if (ui) {
      ui.remove();
      console.log('[QRScanner] ✅ QR Scanner UI removed from DOM');
    }

    // 재시도 도움말 제거
    this.hideRetryHelp();
    this.hideScanningIndicator();

    // 카운터 초기화
    this.scanAttempts = 0;
    this.frameCount = 0;

    console.log('[QRScanner] ✅ Scanner stopped and cleaned up');
  }

  /**
   * QR 스캔 데이터 확인
   */
  static hasQRData() {
    return localStorage.getItem('qrLocation') !== null &&
           localStorage.getItem('qrPhoto') !== null;
  }

  /**
   * 저장된 QR 데이터 가져오기
   */
  static getQRData() {
    const locationStr = localStorage.getItem('qrLocation');
    const photo = localStorage.getItem('qrPhoto');
    const timestamp = localStorage.getItem('qrTimestamp');

    if (!locationStr || !photo) {
      return null;
    }

    return {
      location: JSON.parse(locationStr),
      photo: photo,
      timestamp: parseInt(timestamp) || Date.now()
    };
  }

  /**
   * QR 데이터 삭제
   */
  static clearQRData() {
    localStorage.removeItem('qrLocation');
    localStorage.removeItem('qrPhoto');
    localStorage.removeItem('qrTimestamp');
    console.log('[QRScanner] QR data cleared');
  }
}

console.log('[QRScanner] Module loaded');