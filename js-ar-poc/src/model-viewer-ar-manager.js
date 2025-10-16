/**
 * model-viewer AR Manager
 * iOS/Android 통합 AR 관리자
 */

import { platformDetector } from './platform-detector.js';
import { arGuideScreen } from './ar-guide-screen.js';
import { getModelFromQR, DEFAULT_MODEL_KEY, MODEL_MAPPING } from './model-config.js';

export class ModelViewerARManager {
  constructor() {
    this.modelViewer = null;
    this.isARActive = false;
    this.qrLocation = null;
    this.photoDataURL = null;
    this.currentModel = null; // 현재 로드된 모델 정보
  }

  /**
   * model-viewer 초기화 (매개변수 없이 호출 가능)
   * @param {string} glbPath - GLB 모델 경로 (Android용) - 옵션
   * @param {string} usdzPath - USDZ 모델 경로 (iOS용) - 옵션
   */
  initialize(glbPath = null, usdzPath = null) {
    console.log('[ModelViewerAR] Initializing...');
    console.log('[ModelViewerAR] Platform:', platformDetector.getPlatformInfo());

    // 기본 모델로 초기화 (경로가 제공되지 않은 경우)
    if (!glbPath || !usdzPath) {
      const defaultModel = MODEL_MAPPING[DEFAULT_MODEL_KEY];
      glbPath = defaultModel.glb;
      usdzPath = defaultModel.usdz;
      this.currentModel = defaultModel;
      console.log('[ModelViewerAR] Using default model:', defaultModel.name);
    }

    // model-viewer 엘리먼트 생성
    this.createModelViewer(glbPath, usdzPath, this.currentModel?.scale);

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // 나머지 모델들 백그라운드 프리로드
    this.preloadOtherModels();

    console.log('[ModelViewerAR] ✅ Initialized');
  }

  /**
   * model-viewer 엘리먼트 생성
   * @param {string} glbPath - GLB 모델 경로
   * @param {string} usdzPath - USDZ 모델 경로
   * @param {string} scale - AR 스케일 (옵션, 예: "0.3 0.3 0.3")
   */
  createModelViewer(glbPath, usdzPath, scale = null) {
    // 기존 model-viewer 제거
    const existing = document.getElementById('ar-model-viewer');
    if (existing) {
      existing.remove();
    }

    // 새 model-viewer 생성
    this.modelViewer = document.createElement('model-viewer');
    this.modelViewer.id = 'ar-model-viewer';

    // 플랫폼 감지
    const platform = platformDetector.getPlatformInfo();
    const isIOS = platform.platform === 'iOS';

    // 조건부 로딩: 플랫폼별로 필요한 포맷만 설정
    if (isIOS) {
      // iOS: USDZ만 로드 (AR Quick Look용)
      this.modelViewer.setAttribute('ios-src', usdzPath);
      console.log('[ModelViewerAR] 📱 iOS detected - Loading USDZ only:', usdzPath);
    } else {
      // Android/Desktop: GLB만 로드 (Scene Viewer/WebXR용)
      this.modelViewer.setAttribute('src', glbPath);
      console.log('[ModelViewerAR] 🤖 Android detected - Loading GLB only:', glbPath);
    }

    // 공통 속성 설정
    this.modelViewer.setAttribute('ar', '');
    this.modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    this.modelViewer.setAttribute('camera-controls', '');

    // iOS AR Quick Look 프롬프트 비활성화
    this.modelViewer.removeAttribute('ar-prompt');

    // 로딩 최적화 속성
    this.modelViewer.setAttribute('loading', 'eager'); // 즉시 로드
    this.modelViewer.setAttribute('reveal', 'auto'); // 자동 표시
    console.log('[ModelViewerAR] ⚡ Loading optimization: eager + auto reveal');

    // ar-scale 설정 (모델별 기본 크기 지정)
    if (scale) {
      this.modelViewer.setAttribute('ar-scale', scale);
      console.log('[ModelViewerAR] 📏 AR scale set:', scale);
    }

    // 스타일 설정 (초기에는 숨김, showModelViewer()로 표시)
    this.modelViewer.style.display = 'none';
    this.modelViewer.style.width = '100%';
    this.modelViewer.style.height = '100%';
    this.modelViewer.style.position = 'fixed';
    this.modelViewer.style.top = '0';
    this.modelViewer.style.left = '0';
    this.modelViewer.style.zIndex = '9999';
    this.modelViewer.style.background = '#000';

    // AR 버튼 커스터마이징 (기본 버튼 숨김)
    this.modelViewer.setAttribute('ar-button', 'none');

    // DOM에 추가
    document.body.appendChild(this.modelViewer);

    console.log('[ModelViewerAR] model-viewer created:', {
      glb: glbPath,
      usdz: usdzPath,
      platform: platformDetector.getPlatformInfo()
    });
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    if (!this.modelViewer) return;

    // AR 세션 시작
    this.modelViewer.addEventListener('ar-status', (event) => {
      const status = event.detail.status;
      console.log('[ModelViewerAR] AR Status:', status);

      if (status === 'session-started') {
        this.isARActive = true;
        console.log('[ModelViewerAR] ✅ AR session started');
      } else if (status === 'not-presenting') {
        this.isARActive = false;
        console.log('[ModelViewerAR] AR session ended');
        this.handleARSessionEnd();
      }
    });

    // AR 준비 완료
    this.modelViewer.addEventListener('load', () => {
      console.log('[ModelViewerAR] Model loaded');
    });

    // 에러 처리
    this.modelViewer.addEventListener('error', (event) => {
      console.error('[ModelViewerAR] Error:', event);

      // Android Scene Viewer ARCore 에러 처리
      if (platformDetector.isAndroid()) {
        const errorMsg = event.detail?.message || '';

        // ARCore 관련 에러 감지
        if (errorMsg.includes('ARCore') ||
            errorMsg.includes('AR session') ||
            errorMsg.includes('AR not available') ||
            errorMsg.includes('not supported')) {

          this.showARCoreError();
        }
      }
    });

    // Page Visibility API로 AR 종료 감지 (iOS AR Quick Look, Android Scene Viewer)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isARActive) {
        const viewerName = platformDetector.getARViewerName();
        console.log(`[ModelViewerAR] Returned from ${viewerName} (visibility change)`);
        this.isARActive = false;
        this.handleARSessionEnd();
      }
    });
  }

  /**
   * 모델 변경 (동적 모델 로딩)
   * @param {Object} modelInfo - 모델 정보 객체
   */
  changeModel(modelInfo) {
    if (!this.modelViewer || !modelInfo) {
      console.error('[ModelViewerAR] Cannot change model: invalid state');
      return;
    }

    console.log('[ModelViewerAR] Changing model to:', modelInfo.name);

    // 로딩 오버레이 표시
    this.showLoadingOverlay(modelInfo.name);

    // 플랫폼 감지
    const platform = platformDetector.getPlatformInfo();
    const isIOS = platform.platform === 'iOS';

    // 조건부 로딩: 플랫폼별로 필요한 포맷만 변경
    if (isIOS) {
      // iOS: USDZ만 변경
      this.modelViewer.setAttribute('ios-src', modelInfo.usdz);
      console.log('[ModelViewerAR] 📱 iOS - Switching to USDZ:', modelInfo.usdz);
    } else {
      // Android/Desktop: GLB만 변경
      this.modelViewer.setAttribute('src', modelInfo.glb);
      console.log('[ModelViewerAR] 🤖 Android - Switching to GLB:', modelInfo.glb);
    }

    // AR 스케일 변경 (모델별 설정)
    if (modelInfo.scale) {
      this.modelViewer.setAttribute('ar-scale', modelInfo.scale);
      console.log('[ModelViewerAR] 📏 AR scale updated:', modelInfo.scale);
    }

    // 현재 모델 정보 업데이트
    this.currentModel = modelInfo;

    // 모델 로드 완료 시 로딩 오버레이 제거
    const onLoad = () => {
      this.hideLoadingOverlay();
      this.modelViewer.removeEventListener('load', onLoad);
      console.log('[ModelViewerAR] ✅ Model changed successfully:', modelInfo.name);
    };

    this.modelViewer.addEventListener('load', onLoad);
  }

  /**
   * 로딩 오버레이 표시
   */
  showLoadingOverlay(modelName) {
    const existing = document.getElementById('model-loading-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'model-loading-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 10500;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: var(--font-primary); color: white;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <i class="ph-bold ph-spinner" style="font-size: 48px; animation: spin 1s linear infinite;"></i>
        <div style="margin-top: 20px; font-size: 18px; font-weight: bold;">${modelName}</div>
        <div style="margin-top: 8px; font-size: 14px; opacity: 0.8;">모델 불러오는 중...</div>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * 로딩 오버레이 제거
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById('model-loading-overlay');
    if (overlay) overlay.remove();
  }

  /**
   * 3D 모델 뷰어 표시 (QR 스캔 후)
   * @param {Object} qrLocation - QR 코드 위치 정보
   * @param {string} photoDataURL - QR 캡처 이미지
   */
  async showModelViewer(qrLocation = null, photoDataURL = null) {
    if (!this.modelViewer) {
      console.error('[ModelViewerAR] model-viewer not initialized');
      return;
    }

    console.log('[ModelViewerAR] Showing 3D model viewer with guide overlay...');

    // QR 스캐너 UI 제거 (AR Quick Look 종료 후 다시 나타나는 문제 방지)
    const qrUI = document.getElementById('qr-scanner-ui');
    if (qrUI) {
      qrUI.remove();
      console.log('[ModelViewerAR] ✅ QR Scanner UI removed');
    }

    // QR 위치 정보 저장
    this.qrLocation = qrLocation;
    this.photoDataURL = photoDataURL;

    // QR 코드 내용에서 모델 선택
    const qrContent = qrLocation?.data || null;
    const selectedModel = getModelFromQR(qrContent);

    // 선택된 모델이 현재 모델과 다르면 변경
    if (selectedModel && selectedModel !== this.currentModel) {
      this.changeModel(selectedModel);
    }

    // 모델 정보 토스트 표시
    if (selectedModel) {
      this.showModelInfoToast(selectedModel);
    }

    // model-viewer 먼저 표시
    this.modelViewer.style.display = 'block';

    // 커스텀 AR 버튼 추가 (모델 이름 포함)
    this.addCustomARButton(selectedModel?.name);

    // model-viewer 위에 AR 조작법 가이드 오버레이 표시 (3초)
    await this.showGuideOverlay(3000);

    console.log('[ModelViewerAR] ✅ 3D viewer displayed with guide overlay');
  }

  /**
   * 모델 정보 토스트 표시
   */
  showModelInfoToast(modelInfo) {
    const existing = document.getElementById('model-info-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'model-info-toast';
    toast.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      background: rgba(102, 126, 234, 0.95); color: white;
      padding: 16px 24px; border-radius: 16px; z-index: 10500;
      font-family: var(--font-primary); text-align: center;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      animation: slideDown 0.3s ease-out;
    `;
    toast.innerHTML = `
      <style>
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">
        <i class="ph-fill ph-cube"></i> ${modelInfo.name}
      </div>
      <div style="font-size: 13px; opacity: 0.9;">
        ${modelInfo.description}
      </div>
    `;
    document.body.appendChild(toast);

    // 3초 후 제거
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * model-viewer 위에 가이드 오버레이 표시
   */
  async showGuideOverlay(duration = 3000) {
    return new Promise((resolve) => {
      // 기존 오버레이 제거
      const existing = document.getElementById('ar-guide-overlay');
      if (existing) existing.remove();

      // 오버레이 생성
      const overlay = document.createElement('div');
      overlay.id = 'ar-guide-overlay';
      overlay.innerHTML = `
        <style>
          #ar-guide-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--overlay-darkest);
            font-family: var(--font-primary);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: var(--spacing-2xl) var(--spacing-lg);
            animation: fadeIn var(--transition-base) ease-out;
          }

          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .ar-guide-content {
            max-width: 90%;
            text-align: center;
            color: white;
          }

          .ar-guide-title {
            font-size: var(--font-size-3xl);
            font-weight: var(--font-weight-bold);
            line-height: var(--line-height-tight);
            margin-bottom: var(--spacing-xl);
            color: var(--color-accent);
            text-shadow: var(--glow-accent);
          }

          .ar-controls-list {
            background: var(--overlay-medium);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: var(--radius-xl);
            padding: var(--spacing-xl) var(--spacing-lg);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            box-shadow: var(--shadow-2xl);
            animation: slideUp 0.4s ease-out;
          }

          .ar-control-item {
            display: flex;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            text-align: left;
          }

          .ar-control-item:last-child {
            margin-bottom: 0;
          }

          .ar-control-icon {
            font-size: 32px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--overlay-medium);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--radius-md);
            margin-right: var(--spacing-lg);
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 217, 160, 0.2);
          }

          .ar-control-text {
            flex: 1;
          }

          .ar-control-title {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-bold);
            line-height: var(--line-height-normal);
            margin-bottom: var(--spacing-xs);
            color: white;
          }

          .ar-control-desc {
            font-size: var(--font-size-sm);
            color: rgba(255,255,255,0.85);
            line-height: var(--line-height-normal);
          }

          .ar-guide-footer {
            margin-top: var(--spacing-lg);
            font-size: var(--font-size-sm);
            color: rgba(255,255,255,0.7);
            font-style: italic;
          }
        </style>

        <div class="ar-guide-content">
          <div class="ar-guide-title">
            <i class="ph-bold ph-game-controller"></i> AR 조작법
          </div>

          <div class="ar-controls-list">
            <div class="ar-control-item">
              <div class="ar-control-icon"><i class="ph-fill ph-hand-tap"></i></div>
              <div class="ar-control-text">
                <div class="ar-control-title">오브젝트 이동</div>
                <div class="ar-control-desc">화면을 터치하여 원하는 위치로 옮길 수 있어요</div>
              </div>
            </div>

            <div class="ar-control-item">
              <div class="ar-control-icon"><i class="ph-fill ph-arrows-clockwise"></i></div>
              <div class="ar-control-text">
                <div class="ar-control-title">모델 회전</div>
                <div class="ar-control-desc">두 손가락으로 드래그하여 모델을 돌려보세요</div>
              </div>
            </div>

            <div class="ar-control-item">
              <div class="ar-control-icon"><i class="ph-fill ph-arrows-out"></i></div>
              <div class="ar-control-text">
                <div class="ar-control-title">크기 조절</div>
                <div class="ar-control-desc">핀치 줌으로 모델 크기를 자유롭게 변경하세요</div>
              </div>
            </div>

            <div class="ar-control-item">
              <div class="ar-control-icon"><i class="ph-fill ph-camera"></i></div>
              <div class="ar-control-text">
                <div class="ar-control-title">사진 촬영</div>
                <div class="ar-control-desc">완벽한 순간을 카메라 버튼으로 담아보세요</div>
              </div>
            </div>
          </div>

          <div class="ar-guide-footer">
            잠시 후 자동으로 사라집니다...
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // duration 후 페이드아웃 및 제거
      setTimeout(() => {
        overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 300);
      }, duration);
    });
  }

  /**
   * 커스텀 AR 버튼 추가
   * @param {string} modelName - 모델 이름 (옵션)
   */
  addCustomARButton(modelName = null) {
    // 기존 버튼 제거
    const existing = document.getElementById('custom-ar-button');
    if (existing) {
      existing.remove();
    }

    // 버튼 텍스트 생성
    const buttonText = modelName ? `${modelName} AR로 보기` : 'AR로 보기';

    // 커스텀 AR 버튼 생성
    const button = document.createElement('button');
    button.id = 'custom-ar-button';
    button.innerHTML = `
      <style>
        #custom-ar-button {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          padding: 18px 48px;
          background: rgba(102, 126, 234, 0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 30px;
          font-size: 18px;
          font-weight: bold;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
          cursor: pointer;
          z-index: 10000;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4),
                      0 0 60px rgba(102, 126, 234, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3);
          animation: slideUp 0.3s ease-out;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #custom-ar-button:hover {
          background: rgba(102, 126, 234, 0.4);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 12px 48px rgba(102, 126, 234, 0.5),
                      0 0 80px rgba(102, 126, 234, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: translateX(-50%) translateY(-2px);
        }

        #custom-ar-button:active {
          transform: translateX(-50%) translateY(0) scale(0.98);
          box-shadow: 0 4px 24px rgba(102, 126, 234, 0.4),
                      0 0 40px rgba(102, 126, 234, 0.2);
        }

        @keyframes slideUp {
          0% { transform: translateX(-50%) translateY(20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
      <i class="ph-fill ph-sparkle"></i> ${buttonText}
    `;

    // 클릭 이벤트: 가이드 → AR 실행
    button.addEventListener('click', async () => {
      console.log('[ModelViewerAR] Custom AR button clicked');
      await this.launchARWithGuide();
    });

    document.body.appendChild(button);

    // 닫기 버튼 추가
    this.addCloseButton();
  }

  /**
   * 3D 뷰어 닫기 버튼 추가
   */
  addCloseButton() {
    // 기존 닫기 버튼 제거
    const existing = document.getElementById('model-viewer-close-btn');
    if (existing) {
      existing.remove();
    }

    const closeBtn = document.createElement('button');
    closeBtn.id = 'model-viewer-close-btn';
    closeBtn.innerHTML = `
      <style>
        #model-viewer-close-btn {
          position: fixed;
          top: 20px;
          left: 20px;
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10001;
          transition: all 0.2s ease;
        }

        #model-viewer-close-btn:hover {
          background: rgba(0, 0, 0, 0.75);
          transform: scale(1.05);
        }

        #model-viewer-close-btn:active {
          transform: scale(0.9);
          background: rgba(0, 0, 0, 0.8);
        }
      </style>
      <i class="ph-bold ph-x"></i>
    `;

    closeBtn.addEventListener('click', () => {
      console.log('[ModelViewerAR] Close button clicked');
      // 글로벌 returnToHome 함수 호출
      if (window.returnToHome) {
        window.returnToHome();
      }
    });

    document.body.appendChild(closeBtn);
  }

  /**
   * AR 로딩 인디케이터 표시
   */
  showARLoadingIndicator() {
    const existing = document.getElementById('ar-loading-indicator');
    if (existing) return;

    const indicator = document.createElement('div');
    indicator.id = 'ar-loading-indicator';
    indicator.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9); color: white;
      padding: 24px 32px; border-radius: 16px; z-index: 10500;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      font-family: var(--font-primary);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    `;
    indicator.innerHTML = `
      <i class="ph-bold ph-spinner" style="font-size: 48px; animation: spin 1s linear infinite;"></i>
      <div style="font-size: 16px; font-weight: bold;">AR 준비 중...</div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(indicator);
  }

  /**
   * AR 로딩 인디케이터 제거
   */
  hideARLoadingIndicator() {
    const indicator = document.getElementById('ar-loading-indicator');
    if (indicator) indicator.remove();
  }

  /**
   * AR 실행 (가이드 없이 바로 실행)
   * 모델 로드 완료 확인 후 AR 활성화
   */
  async launchARWithGuide() {
    try {
      console.log('[ModelViewerAR] Launching AR directly...');

      // 1. 커스텀 버튼 제거
      const button = document.getElementById('custom-ar-button');
      if (button) {
        button.remove();
      }

      // 2. 모델 로드 완료 확인 (방법 1: 모델 로드 검증)
      if (!this.modelViewer.loaded) {
        console.log('[ModelViewerAR] ⏳ Model not loaded yet, waiting...');

        // 로딩 인디케이터 표시
        this.showARLoadingIndicator();

        // 모델 로드 완료 대기 (최대 10초)
        await this.waitForModelLoad(10000);

        // 로딩 인디케이터 제거
        this.hideARLoadingIndicator();
      }

      console.log('[ModelViewerAR] ✅ Model loaded, ready for AR');

      // 3. 3D 뷰어 숨김
      this.modelViewer.style.display = 'none';

      // 4. AR 즉시 활성화 (가이드는 QR 스캔 후 이미 표시됨)
      this.modelViewer.activateAR();
      console.log('[ModelViewerAR] ✅ AR activated');

    } catch (error) {
      console.error('[ModelViewerAR] Failed to launch AR:', error);

      // 로딩 인디케이터 제거
      this.hideARLoadingIndicator();

      // 에러 발생 시 3D 뷰어와 버튼 복구
      this.restoreViewer();
    }
  }

  /**
   * 모델 로드 완료 대기
   * @param {number} timeout - 최대 대기 시간 (ms)
   * @returns {Promise<boolean>}
   */
  waitForModelLoad(timeout = 10000) {
    return new Promise((resolve, reject) => {
      // 이미 로드된 경우 즉시 반환
      if (this.modelViewer.loaded) {
        resolve(true);
        return;
      }

      let timeoutId;

      // 로드 완료 이벤트 리스너
      const onLoad = () => {
        clearTimeout(timeoutId);
        console.log('[ModelViewerAR] ✅ Model load completed');
        resolve(true);
      };

      // 에러 이벤트 리스너
      const onError = (event) => {
        clearTimeout(timeoutId);
        console.error('[ModelViewerAR] ❌ Model load failed:', event);
        reject(new Error('Model load failed'));
      };

      // 이벤트 리스너 등록
      this.modelViewer.addEventListener('load', onLoad, { once: true });
      this.modelViewer.addEventListener('error', onError, { once: true });

      // 타임아웃 설정
      timeoutId = setTimeout(() => {
        this.modelViewer.removeEventListener('load', onLoad);
        this.modelViewer.removeEventListener('error', onError);
        console.warn('[ModelViewerAR] ⚠️ Model load timeout');
        reject(new Error('Model load timeout'));
      }, timeout);
    });
  }

  /**
   * AR 세션 종료 처리
   */
  handleARSessionEnd() {
    console.log('[ModelViewerAR] Handling AR session end...');

    // QR 위치 저장
    if (this.qrLocation && this.photoDataURL) {
      this.saveQRLocation(this.qrLocation, this.photoDataURL);
    }

    // AR 뷰어 종료 후 홈으로 복귀 (iOS AR Quick Look / Android Scene Viewer)
    const viewerName = platformDetector.getARViewerName();
    console.log(`[ModelViewerAR] ${viewerName} closed, returning to home...`);
    if (window.returnToHome) {
      window.returnToHome();
    }

    // 초기화
    this.qrLocation = null;
    this.photoDataURL = null;
  }

  /**
   * 3D 뷰어와 AR 버튼 복구
   */
  restoreViewer() {
    console.log('[ModelViewerAR] Restoring 3D viewer and AR button...');

    // model-viewer 다시 표시
    if (this.modelViewer) {
      this.modelViewer.style.display = 'block';
    }

    // AR 버튼 다시 추가
    this.addCustomARButton();

    console.log('[ModelViewerAR] ✅ Viewer restored');
  }

  /**
   * QR 위치 저장
   */
  saveQRLocation(qrLocation, photoDataURL) {
    console.log('[ModelViewerAR] Saving QR location...');

    const locationData = {
      qrCode: qrLocation.data,
      location: qrLocation.location,
      timestamp: qrLocation.timestamp,
      photoDataURL: photoDataURL
    };

    localStorage.setItem('saved_qr_location', JSON.stringify(locationData));
    console.log('[ModelViewerAR] ✅ QR location saved:', locationData);
  }

  /**
   * 저장된 QR 위치 불러오기
   */
  getSavedQRLocation() {
    const saved = localStorage.getItem('saved_qr_location');
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * ARCore 미지원 에러 표시 (Android 전용)
   */
  showARCoreError() {
    // 기존 에러 메시지 제거 (중복 방지)
    const existing = document.getElementById('arcore-error');
    if (existing) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'arcore-error';
    errorDiv.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(239, 68, 68, 0.95); color: white;
      padding: 32px; border-radius: 20px; z-index: 150000;
      max-width: 85%; text-align: center;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      font-family: var(--font-primary);
    `;
    errorDiv.innerHTML = `
      <i class="ph-bold ph-device-mobile-slash" style="font-size: 64px;"></i>
      <h3 style="margin-top: 20px; font-size: 20px; font-weight: bold;">AR 미지원 기기</h3>
      <p style="margin-top: 16px; font-size: 14px; opacity: 0.9; line-height: 1.6;">
        이 기기는 Google ARCore를 지원하지 않습니다.<br><br>
        <strong>필요 사항:</strong><br>
        • Android 7.0 (Nougat) 이상<br>
        • ARCore 지원 기기<br>
        • Google Play Services for AR 설치
      </p>
      <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
        <button onclick="window.open('https://developers.google.com/ar/devices', '_blank')" style="padding: 12px 24px; background: white; color: #EF4444; border: none; border-radius: 10px; font-weight: bold; font-size: 14px;">
          지원 기기 확인
        </button>
        <button onclick="document.getElementById('arcore-error').remove(); window.returnToHome && window.returnToHome();" style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 1px solid white; border-radius: 10px; font-weight: bold; font-size: 14px;">
          홈으로
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }

  /**
   * 위치 기억 안내 표시
   */
  showLocationReminder() {
    const reminder = document.createElement('div');
    reminder.id = 'location-reminder';
    reminder.innerHTML = `
      <style>
        #location-reminder {
          position: fixed;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 15px 30px;
          border-radius: 30px;
          text-align: center;
          z-index: 10003;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
          font-size: 16px;
        }

        @keyframes slideUp {
          0% { transform: translateX(-50%) translateY(20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
      ✅ 완료! 다음에도 이 QR로 실행하세요
    `;

    document.body.appendChild(reminder);

    // 3초 후 자동 제거
    setTimeout(() => {
      if (reminder.parentElement) {
        reminder.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => reminder.remove(), 300);
      }
    }, 3000);
  }

  /**
   * 나머지 모델들 백그라운드 프리로드
   * 현재 로드된 모델을 제외한 모든 모델을 브라우저 캐시에 미리 로드
   */
  preloadOtherModels() {
    console.log('[ModelViewerAR] 🔄 Starting background preload...');

    // 현재 모델을 제외한 나머지 모델들 가져오기
    const modelsToPreload = Object.values(MODEL_MAPPING).filter(
      model => model.id !== this.currentModel?.id
    );

    console.log(`[ModelViewerAR] Preloading ${modelsToPreload.length} models in background`);

    // 플랫폼에 따라 적절한 포맷만 프리로드 (조건부 로딩)
    const platform = platformDetector.getPlatformInfo();
    const isIOS = platform.platform === 'iOS';

    console.log(`[ModelViewerAR] Platform: ${isIOS ? 'iOS (USDZ only)' : 'Android (GLB only)'}`);

    modelsToPreload.forEach((model, index) => {
      // 플랫폼별 필요한 포맷만 프리로드 (불필요한 다운로드 제거)
      const modelUrl = isIOS ? model.usdz : model.glb;
      const formatType = isIOS ? 'USDZ' : 'GLB';

      // 필요한 포맷만 프리로드 (즉시 병렬 시작)
      this.preloadAsset(modelUrl, 'prefetch', `${model.name} (${formatType})`, 0);

      console.log(`[ModelViewerAR] 📥 Queued: ${model.name} - ${formatType} only`);
    });

    console.log('[ModelViewerAR] ✅ Conditional preload initiated (50% bandwidth saved)');
  }

  /**
   * 개별 에셋 프리로드 (지연 로딩 지원)
   * @param {string} url - 프리로드할 파일 URL
   * @param {string} rel - link rel 속성 (prefetch 또는 preload)
   * @param {string} name - 모델 이름 (로깅용)
   * @param {number} delay - 프리로드 시작 지연 시간 (ms)
   */
  preloadAsset(url, rel = 'prefetch', name = '', delay = 0) {
    setTimeout(() => {
      // 이미 프리로드된 URL인지 확인
      const existing = document.querySelector(`link[href="${url}"]`);
      if (existing) {
        console.log(`[ModelViewerAR] ⏭️ Already preloaded: ${name}`);
        return;
      }

      const link = document.createElement('link');
      link.rel = rel;
      link.href = url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';

      // 프리로드 성공/실패 이벤트
      link.onload = () => {
        console.log(`[ModelViewerAR] ✅ Preloaded: ${name} (${(url.length / 1024).toFixed(1)}KB URL)`);
      };

      link.onerror = () => {
        console.warn(`[ModelViewerAR] ⚠️ Preload failed: ${name}`);
      };

      document.head.appendChild(link);
      console.log(`[ModelViewerAR] 🔄 Preloading: ${name}...`);
    }, delay);
  }

  /**
   * 정리
   */
  cleanup() {
    if (this.modelViewer) {
      this.modelViewer.remove();
      this.modelViewer = null;
    }
    this.isARActive = false;
    this.qrLocation = null;
    this.photoDataURL = null;
    console.log('[ModelViewerAR] Cleaned up');
  }
}

// 싱글톤 인스턴스
export const modelViewerAR = new ModelViewerARManager();
