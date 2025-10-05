/**
 * Camera Permission Screen
 * 앱 시작 시 카메라 권한 요청 화면
 */

export class CameraPermissionScreen {
  constructor() {
    this.permissionGranted = false;
  }

  /**
   * 권한 요청 화면 표시
   */
  async show() {
    return new Promise((resolve) => {
      // 권한 요청 화면 생성
      const screen = document.createElement('div');
      screen.id = 'camera-permission-screen';
      screen.innerHTML = `
        <style>
          #camera-permission-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            z-index: 100000;
            font-family: var(--font-primary, 'Pretendard', sans-serif);
            color: white;
            padding: 20px;
            padding-top: max(40px, env(safe-area-inset-top));
            padding-bottom: max(40px, env(safe-area-inset-bottom));
            animation: fadeIn 0.3s ease-out;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .permission-content {
            max-width: 400px;
            width: 100%;
            text-align: center;
            margin: auto 0;
          }

          .permission-icon {
            font-size: 64px;
            margin-bottom: 24px;
            animation: bounceIn 0.6s ease-out;
          }

          @keyframes bounceIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }

          .permission-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 20px;
            line-height: 1.2;
          }

          .permission-subtitle {
            font-size: 15px;
            opacity: 0.95;
            margin-bottom: 12px;
            line-height: 1.6;
          }

          .permission-event-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .permission-description {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 24px 20px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .permission-reason {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
            text-align: left;
          }

          .permission-reason:last-child {
            margin-bottom: 0;
          }

          .permission-reason-icon {
            font-size: 24px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .permission-reason-text {
            font-size: var(--font-size-base, 16px);
            line-height: 1.5;
          }

          .permission-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-top: 8px;
          }

          .permission-btn {
            padding: 16px 32px;
            border: none;
            border-radius: 9999px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            font-family: var(--font-primary, 'Pretendard', sans-serif);
            transition: all 0.2s ease;
            width: 100%;
          }

          .permission-btn-primary {
            background: white;
            color: #667eea;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .permission-btn-primary:active {
            transform: scale(0.97);
          }

          .permission-btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .permission-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }

          .permission-btn-secondary:active {
            transform: scale(0.97);
            background: rgba(255, 255, 255, 0.15);
          }

          .permission-error {
            margin-top: var(--spacing-lg, 24px);
            padding: var(--spacing-md, 16px);
            background: rgba(255, 0, 0, 0.2);
            border: 1px solid rgba(255, 0, 0, 0.4);
            border-radius: var(--radius-lg, 16px);
            color: white;
            font-size: var(--font-size-sm, 14px);
            display: none;
          }

          .permission-error.show {
            display: block;
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>

        <div class="permission-content">
          <div class="permission-icon"><i class="ph-fill ph-camera" style="font-size: 64px;"></i></div>

          <h1 class="permission-title">온누리 교회 AR 체험</h1>

          <div class="permission-event-badge">
            <i class="ph-fill ph-confetti"></i> 온누리 교회 창립 40주년 기념
          </div>

          <p class="permission-subtitle">
            증강현실(AR)로 특별한 체험을 선사합니다
          </p>

          <div class="permission-description">
            <div class="permission-reason">
              <div class="permission-reason-icon"><i class="ph-bold ph-camera"></i></div>
              <div class="permission-reason-text">
                <strong>카메라 권한이 필요합니다</strong><br>
                QR 코드를 스캔하여 정확한 위치에 AR 모델을 배치합니다
              </div>
            </div>

            <div class="permission-reason">
              <div class="permission-reason-icon"><i class="ph-fill ph-church"></i></div>
              <div class="permission-reason-text">
                <strong>교회를 3D로 체험하세요</strong><br>
                현실 공간에 온누리 교회 모델을 띄워 감상할 수 있습니다
              </div>
            </div>

            <div class="permission-reason">
              <div class="permission-reason-icon"><i class="ph-fill ph-camera-plus"></i></div>
              <div class="permission-reason-text">
                <strong>추억을 사진으로 저장</strong><br>
                AR 모델과 함께 특별한 기념사진을 촬영하세요
              </div>
            </div>
          </div>

          <div class="permission-buttons">
            <button class="permission-btn permission-btn-primary" id="permission-allow-btn">
              카메라 권한 허용하기
            </button>
            <button class="permission-btn permission-btn-secondary" id="permission-deny-btn">
              나중에 하기
            </button>
          </div>

          <div class="permission-error" id="permission-error">
            <i class="ph-bold ph-warning"></i> 카메라 권한이 필요합니다. 권한을 허용하지 않으면 AR 체험을 이용할 수 없습니다.
          </div>
        </div>
      `;

      document.body.appendChild(screen);

      // 허용 버튼
      document.getElementById('permission-allow-btn').addEventListener('click', async () => {
        console.log('[CameraPermission] Requesting camera permission...');

        try {
          // 카메라 권한 요청
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          });

          // 권한 허용됨 - 스트림 즉시 종료
          stream.getTracks().forEach(track => track.stop());

          console.log('[CameraPermission] ✅ Permission granted');
          this.permissionGranted = true;

          // 화면 페이드아웃 후 제거
          screen.style.animation = 'fadeIn 0.3s ease-out reverse';
          setTimeout(() => {
            screen.remove();
            resolve(true);
          }, 300);

        } catch (error) {
          console.error('[CameraPermission] ❌ Permission denied:', error);

          // 에러 메시지 표시
          const errorEl = document.getElementById('permission-error');
          errorEl.classList.add('show');

          // 3초 후 에러 메시지 숨김
          setTimeout(() => {
            errorEl.classList.remove('show');
          }, 3000);
        }
      });

      // 거부 버튼
      document.getElementById('permission-deny-btn').addEventListener('click', () => {
        console.log('[CameraPermission] ❌ Permission denied by user');

        // 접근 차단 화면 표시
        this.showBlockedScreen();
        screen.remove();
        resolve(false);
      });
    });
  }

  /**
   * 접근 차단 화면 표시
   */
  showBlockedScreen() {
    const blockedScreen = document.createElement('div');
    blockedScreen.id = 'camera-blocked-screen';
    blockedScreen.innerHTML = `
      <style>
        #camera-blocked-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 100000;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
          color: white;
          padding: var(--spacing-2xl, 40px) var(--spacing-lg, 24px);
          text-align: center;
        }

        .blocked-icon {
          font-size: 80px;
          margin-bottom: var(--spacing-xl, 32px);
          opacity: 0.6;
        }

        .blocked-title {
          font-size: var(--font-size-2xl, 28px);
          font-weight: var(--font-weight-bold, 700);
          margin-bottom: var(--spacing-lg, 24px);
        }

        .blocked-message {
          font-size: var(--font-size-base, 16px);
          opacity: 0.9;
          margin-bottom: var(--spacing-2xl, 40px);
          line-height: 1.6;
          max-width: 400px;
        }

        .blocked-refresh-btn {
          padding: var(--spacing-lg, 20px) var(--spacing-2xl, 40px);
          background: white;
          color: #667eea;
          border: none;
          border-radius: var(--radius-full, 9999px);
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-bold, 700);
          cursor: pointer;
          font-family: var(--font-primary, 'Pretendard', sans-serif);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .blocked-refresh-btn:active {
          transform: scale(0.97);
        }
      </style>

      <div class="blocked-icon"><i class="ph-fill ph-prohibit" style="font-size: 80px; opacity: 0.6;"></i></div>
      <h2 class="blocked-title">카메라 권한이 필요합니다</h2>
      <p class="blocked-message">
        온누리 교회 AR 체험을 이용하려면 카메라 권한을 허용해주세요.<br>
        페이지를 새로고침하여 다시 시도할 수 있습니다.
      </p>
      <button class="blocked-refresh-btn" onclick="location.reload()">
        <i class="ph-bold ph-arrow-clockwise"></i> 페이지 새로고침
      </button>
    `;

    document.body.appendChild(blockedScreen);
  }

  /**
   * 권한 상태 확인
   */
  isGranted() {
    return this.permissionGranted;
  }
}

console.log('[CameraPermission] Module loaded');
