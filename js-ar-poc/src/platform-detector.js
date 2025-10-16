// Platform Detection and WebXR Support Check
// 플랫폼 감지 및 WebXR 지원 확인

export class PlatformDetector {
  constructor() {
    this.userAgent = navigator.userAgent.toLowerCase();
    this.platform = this.detectPlatform();
    this.supportsWebXR = false;
    this.supportsARjs = true; // AR.js는 모든 플랫폼 지원
  }

  /**
   * 플랫폼 감지
   * @returns {Object} 플랫폼 정보
   */
  detectPlatform() {
    const ua = this.userAgent;

    // WebView 감지
    const isWebView = (() => {
      // Android WebView 감지
      if (/android/.test(ua)) {
        // 방법 1: 'wv' 토큰 확인 (Android Lollipop 5.0+)
        if (/wv/.test(ua)) return true;

        // 방법 2: Version/X.X 문자열 확인
        if (/Version\/\d+\.\d+/.test(ua) && /Chrome\/\d+/.test(ua)) return true;

        // 방법 3: 특정 앱 WebView 확인
        if (/KAKAOTALK|Instagram|FBAN|FBAV|Line/i.test(ua)) return true;
      }

      // iOS WebView/Safari View Controller 감지
      if (/iphone|ipad|ipod/.test(ua)) {
        // Safari 문자열이 없으면 WebView (소문자로 검색)
        if (!(/safari/.test(ua))) return true;

        // 특정 앱 WebView 확인
        if (/KAKAOTALK|Instagram|FBAN|FBAV|Line/i.test(navigator.userAgent)) return true;
      }

      return false;
    })();

    return {
      isAndroid: /android/.test(ua),
      isIOS: /iphone|ipad|ipod/.test(ua),
      isChrome: /chrome/.test(ua) && !/edge/.test(ua) && !isWebView,
      isSafari: /safari/.test(ua) && !/chrome/.test(ua),
      isFirefox: /firefox/.test(ua),
      isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua),
      isWebView: isWebView,
      isInAppBrowser: isWebView // 별칭
    };
  }

  /**
   * WebXR 지원 확인 (비동기)
   * @returns {Promise<boolean>}
   */
  async checkWebXRSupport() {
    // WebXR 지원 확인
    if (!navigator.xr) {
      console.log('[PlatformDetector] WebXR not supported');
      this.supportsWebXR = false;
      return false;
    }

    try {
      // immersive-ar 세션 지원 확인
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      this.supportsWebXR = supported;
      console.log('[PlatformDetector] WebXR immersive-ar supported:', supported);
      return supported;
    } catch (error) {
      console.warn('[PlatformDetector] Error checking WebXR support:', error);
      this.supportsWebXR = false;
      return false;
    }
  }

  /**
   * 최적의 AR 모드 결정
   * @returns {Promise<string>} 'webxr' | 'arjs'
   */
  async getBestARMode() {
    await this.checkWebXRSupport();

    // Android Chrome + WebXR 지원 = WebXR 모드
    if (this.platform.isAndroid &&
        this.platform.isChrome &&
        this.supportsWebXR) {
      console.log('[PlatformDetector] ✅ Best mode: WebXR (Android Chrome)');
      return 'webxr';
    }

    // 그 외 = AR.js 폴백
    console.log('[PlatformDetector] ⚠️ Fallback mode: AR.js');
    return 'arjs';
  }

  /**
   * 플랫폼 정보 출력
   * @returns {string}
   */
  getPlatformInfo() {
    const { isAndroid, isIOS, isChrome, isSafari, isFirefox, isMobile } = this.platform;

    let info = '';
    if (isAndroid) info += 'Android ';
    if (isIOS) info += 'iOS ';
    if (isChrome) info += 'Chrome ';
    if (isSafari) info += 'Safari ';
    if (isFirefox) info += 'Firefox ';
    if (isMobile) info += '(Mobile)';

    return info.trim() || 'Desktop';
  }

  /**
   * 사용자에게 표시할 메시지 생성
   * @param {string} mode - AR 모드 ('webxr' | 'arjs')
   * @returns {string}
   */
  getUserMessage(mode) {
    if (mode === 'webxr') {
      return '🌟 고급 AR 모드: 마커 없이도 모델이 공간에 고정됩니다!';
    } else {
      return '📱 기본 AR 모드: 마커를 계속 보여주세요.';
    }
  }

  /**
   * iOS 여부 확인
   */
  isIOS() {
    return this.platform.isIOS;
  }

  /**
   * Android 여부 확인
   */
  isAndroid() {
    return this.platform.isAndroid;
  }

  /**
   * AR Quick Look/Scene Viewer 지원 확인
   */
  supportsNativeAR() {
    return this.platform.isIOS || this.platform.isAndroid;
  }

  /**
   * 플랫폼별 AR 뷰어 이름 반환
   */
  getARViewerName() {
    if (this.platform.isIOS) {
      return 'AR Quick Look';
    }
    if (this.platform.isAndroid) {
      return 'Scene Viewer';
    }
    return 'AR Viewer';
  }

  /**
   * 플랫폼별 가이드 이미지 경로 반환
   */
  getGuideImagePath() {
    if (this.platform.isIOS) {
      return 'assets/images/ios-ar-guide.png';
    }
    if (this.platform.isAndroid) {
      return 'assets/images/android-ar-guide.png';
    }
    return null;
  }

  /**
   * iOS 버전 체크
   */
  checkIOSVersion() {
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Chrome 버전 확인
   * @returns {number} Chrome 버전 번호, Chrome이 아니면 0
   */
  getChromeVersion() {
    const match = this.userAgent.match(/Chrome\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Chrome 버전이 Scene Viewer에 충분한지 확인
   * @returns {boolean}
   */
  isChromeSufficient() {
    if (!this.platform.isChrome) return false;
    const version = this.getChromeVersion();
    return version >= 90; // Scene Viewer 최소 요구 버전
  }

  /**
   * WebView에서 사용 중인 앱 이름 감지
   * @returns {string} 앱 이름
   */
  getWebViewAppName() {
    const ua = this.userAgent;
    if (/KAKAOTALK/i.test(ua)) return '카카오톡';
    if (/Instagram/i.test(ua)) return '인스타그램';
    if (/FBAN|FBAV/i.test(ua)) return '페이스북';
    if (/Line/i.test(ua)) return '라인';
    return '인앱 브라우저';
  }
}

// 싱글톤 인스턴스
export const platformDetector = new PlatformDetector();

console.log('[PlatformDetector] Module loaded');
console.log('[PlatformDetector] Platform:', platformDetector.getPlatformInfo());