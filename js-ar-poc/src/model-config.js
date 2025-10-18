// Model Configuration and QR Code Mapping
// QR 코드와 3D 모델 매핑 설정

/**
 * 사용 가능한 3D 모델 목록
 * QR 코드 스캔 시 이 매핑을 기반으로 모델 선택
 */
export const MODEL_MAPPING = {
  // 온누리 교회 모델 1
  'MODEL_CHURCH_01': {
    id: 'church_01',
    name: '온누리 교회 01',
    description: '온누리 교회 40주년 기념 모델 1',
    glb: '/assets/models/church-model-01.glb',
    usdz: '/assets/models/church-model-01-rescale.usdz',
    scale: '0.3 0.3 0.3',
    preload: true
  },

  // 온누리 교회 모델 2
  'MODEL_CHURCH_02': {
    id: 'church_02',
    name: '온누리 교회 02',
    description: '온누리 교회 40주년 기념 모델 2',
    glb: '/assets/models/church-model-02.glb',
    usdz: '/assets/models/church-model-02.usdz',
    scale: '1 1 1',
    preload: true
  },

  // 온누리 교회 모델 3
  'MODEL_CHURCH_03': {
    id: 'church_03',
    name: '온누리 교회 03',
    description: '온누리 교회 40주년 기념 모델 3',
    glb: '/assets/models/church-model-03.glb',
    usdz: '/assets/models/church-model-03.usdz',
    scale: '1 1 1',
    preload: true
  }
};

/**
 * 기본 모델 (QR 스캔 없이 직접 접속 시)
 */
export const DEFAULT_MODEL_KEY = 'MODEL_CHURCH_01';

/**
 * QR 코드 내용에서 모델 정보 추출
 * @param {string} qrContent - QR 코드 스캔 결과
 * @returns {Object|null} 모델 정보 객체 또는 null
 */
export function getModelFromQR(qrContent) {
  if (!qrContent) {
    console.log('[ModelConfig] No QR content, using default model');
    return MODEL_MAPPING[DEFAULT_MODEL_KEY];
  }

  console.log('[ModelConfig] Processing QR content:', qrContent);

  // 1. 직접 매칭 (가장 우선)
  if (MODEL_MAPPING[qrContent]) {
    console.log('[ModelConfig] ✅ Direct match found:', qrContent);
    return MODEL_MAPPING[qrContent];
  }

  // 2. URL에서 query parameter 추출 시도
  try {
    const url = new URL(qrContent);

    // 숫자 매핑 정의
    const numericMapping = {
      '1': 'MODEL_CHURCH_01',
      '2': 'MODEL_CHURCH_02',
      '3': 'MODEL_CHURCH_03'
    };

    // 2-1. ?code=1 형식 확인 (우선순위 1)
    const codeParam = url.searchParams.get('code');
    if (codeParam) {
      // 직접 매칭 시도
      if (MODEL_MAPPING[codeParam]) {
        console.log('[ModelConfig] ✅ URL code parameter direct match found:', codeParam);
        return MODEL_MAPPING[codeParam];
      }

      // 숫자 매핑 시도
      if (numericMapping[codeParam]) {
        const key = numericMapping[codeParam];
        console.log('[ModelConfig] ✅ URL code parameter numeric match found:', codeParam, '→', key);
        return MODEL_MAPPING[key];
      }
    }

    // 2-2. ?model=MODEL_CHURCH_01 형식 확인 (기존 호환성)
    const modelParam = url.searchParams.get('model');
    if (modelParam && MODEL_MAPPING[modelParam]) {
      console.log('[ModelConfig] ✅ URL model parameter match found:', modelParam);
      return MODEL_MAPPING[modelParam];
    }
  } catch (e) {
    // URL이 아닌 경우 무시
  }

  // 3. 숫자 매핑 (QR에 "1", "2", "3" 같은 번호만 있는 경우)
  const numericMapping = {
    '1': 'MODEL_CHURCH_01',
    '2': 'MODEL_CHURCH_02',
    '3': 'MODEL_CHURCH_03'
  };

  if (numericMapping[qrContent.trim()]) {
    const key = numericMapping[qrContent.trim()];
    console.log('[ModelConfig] ✅ Numeric mapping found:', qrContent, '→', key);
    return MODEL_MAPPING[key];
  }

  // 4. 부분 문자열 매칭 (대소문자 무시)
  const qrLower = qrContent.toLowerCase();
  for (const [key, model] of Object.entries(MODEL_MAPPING)) {
    if (qrLower.includes(key.toLowerCase()) ||
        qrLower.includes(model.id.toLowerCase())) {
      console.log('[ModelConfig] ✅ Substring match found:', key);
      return model;
    }
  }

  // 5. 매칭 실패 시 기본 모델
  console.log('[ModelConfig] ⚠️ No match found, using default model');
  return MODEL_MAPPING[DEFAULT_MODEL_KEY];
}

/**
 * 모든 모델 목록 가져오기
 * @returns {Array} 모델 정보 배열
 */
export function getAllModels() {
  return Object.entries(MODEL_MAPPING).map(([key, model]) => ({
    key,
    ...model
  }));
}

/**
 * 프리로드 대상 모델 목록
 * @returns {Array} 프리로드할 모델 배열
 */
export function getPreloadModels() {
  return getAllModels().filter(model => model.preload);
}

console.log('[ModelConfig] Module loaded');
console.log('[ModelConfig] Available models:', Object.keys(MODEL_MAPPING));
