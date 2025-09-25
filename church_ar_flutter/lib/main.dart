import 'package:flutter/material.dart';
import 'model_viewer_widget.dart';
import 'liquid_glass_theme.dart';
import 'photo_capture_widget.dart';
import 'feedback_manager.dart';
import 'gesture_hints_manager.dart';
import 'model_selection_carousel.dart';
import 'model_data.dart';
import 'ar_controls_widget.dart';

void main() {
  runApp(const ChurchARApp());
}

class ChurchARApp extends StatelessWidget {
  const ChurchARApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '온누리교회 AR',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: LiquidGlassTheme.primaryBlue,
        ),
        useMaterial3: true,
        fontFamily: 'Pretendard',
      ),
      home: const ARHomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class ARHomePage extends StatefulWidget {
  const ARHomePage({super.key});

  @override
  State<ARHomePage> createState() => _ARHomePageState();
}

class _ARHomePageState extends State<ARHomePage> with TickerProviderStateMixin {
  final GestureHintsManager _hintsManager = GestureHintsManager();
  final GlobalKey<ModelViewerWidgetState> _modelViewerKey = GlobalKey();
  ModelData _currentModel = ModelRepository.defaultModel;
  bool _isArMode = false;
  bool _isPlacementMode = false;
  bool _isPlaneDetected = false;

  @override
  void initState() {
    super.initState();

    // 제스처 힌트 시스템 초기화
    _initializeHints();
  }

  Future<void> _initializeHints() async {
    await _hintsManager.initialize();
  }

  void _onModelSelected(ModelData model) {
    debugPrint('📥 _onModelSelected 호출됨: ${model.name} (${model.id})');

    setState(() {
      _currentModel = model;
    });

    _modelViewerKey.currentState?.changeModel(model);
    debugPrint('🔗 ModelViewer changeModel 호출됨');
    debugPrint('📊 현재 ModelViewer Key: $_modelViewerKey');
    debugPrint('📊 ModelViewer State: ${_modelViewerKey.currentState}');
  }

  void _onARButtonPressed() {
    debugPrint('🚀 AR 버튼 클릭됨');

    // 🚀 Pure Flutter model_viewer_plus가 AR 모드를 자동으로 처리
    setState(() {
      _isArMode = true;
    });
  }

  void _onPlacementButtonPressed() {
    debugPrint('📍 배치 버튼 클릭됨');

    // 🚀 Pure Flutter 구현에서는 자동 배치 처리

    setState(() {
      _isPlacementMode = false;
    });
  }

  @override
  void dispose() {
    _hintsManager.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LiquidGlassTheme.backgroundWhite,
      body: Stack(
        children: [
          // 강화된 배경 레이어링 시스템
          // Layer 1: 베이스 그라디언트
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                stops: const [0.0, 0.3, 0.7, 1.0],
                colors: [
                  LiquidGlassTheme.backgroundWhite,
                  LiquidGlassTheme.primaryBlue.withAlpha(15),
                  LiquidGlassTheme.secondaryPurple.withAlpha(20),
                  LiquidGlassTheme.backgroundWhite,
                ],
              ),
            ),
          ),

          // Layer 2: 정교한 상단 오브 (교회의 신성한 빛)
          Positioned(
            top: -120,
            right: -80,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  stops: const [0.0, 0.4, 0.8, 1.0],
                  colors: [
                    LiquidGlassTheme.primaryBlue.withAlpha(35),
                    LiquidGlassTheme.primaryBlue.withAlpha(25),
                    const Color(0xFF667EEA).withAlpha(15), // 부드러운 색상 전환
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Layer 3: 정교한 하단 오브 (평화로운 보라빛)
          Positioned(
            bottom: -180,
            left: -60,
            child: Container(
              width: 420,
              height: 420,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  stops: const [0.0, 0.3, 0.7, 1.0],
                  colors: [
                    LiquidGlassTheme.secondaryPurple.withAlpha(30),
                    LiquidGlassTheme.secondaryPurple.withAlpha(20),
                    LiquidGlassTheme.primaryBlue.withAlpha(10),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Layer 4: 미묘한 신성한 오라 (중앙 상단)
          Positioned(
            top: -50,
            left: 0,
            right: 0,
            child: Container(
              height: 200,
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topCenter,
                  radius: 1.5,
                  stops: const [0.0, 0.6, 1.0],
                  colors: [
                    const Color(0xFFFFD700).withAlpha(25), // 신성한 금빛
                    LiquidGlassTheme.primaryBlue.withAlpha(15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 모델 뷰어 (중앙 배치)
          GestureHintOverlay(
            child: Center(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  // 가로세로 중 작은 값을 사용하여 정사각형 만들기 (상하단 UI 공간 확보)
                  double size = constraints.maxWidth < constraints.maxHeight
                      ? constraints.maxWidth -
                            40 // 좌우 여백 20px씩
                      : constraints.maxHeight - 200; // 상하단 UI 공간 확보 (100px씩)

                  return Container(
                    width: size,
                    height: size,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      // 프리미엄 3D 프레임 그라디언트
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withAlpha(40),
                          Colors.white.withAlpha(20),
                          Colors.white.withAlpha(35),
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                      border: Border.all(
                        width: 2,
                        color: Colors.white.withAlpha(60),
                      ),
                      boxShadow: [
                        // 외부 그림자 (깊이감)
                        BoxShadow(
                          color: Colors.black.withAlpha(15),
                          blurRadius: 32,
                          offset: const Offset(0, 16),
                          spreadRadius: -4,
                        ),
                        // 신성한 파란 글로우
                        BoxShadow(
                          color: LiquidGlassTheme.primaryBlue.withAlpha(30),
                          blurRadius: 40,
                          offset: const Offset(0, 8),
                          spreadRadius: -8,
                        ),
                        // 내부 하이라이트 (3D 효과)
                        BoxShadow(
                          color: Colors.white.withAlpha(80),
                          blurRadius: 2,
                          offset: const Offset(0, 1),
                          blurStyle: BlurStyle.inner,
                        ),
                      ],
                    ),
                    child: Container(
                      margin: const EdgeInsets.all(8), // 프레임과 내부 컨텐츠 간격
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        color: Colors.black.withAlpha(5), // 매우 약한 배경
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Stack(
                          children: [
                            VisualFeedbackOverlay(
                              isEnabled: true,
                              child: ModelViewerWidget(
                                key: _modelViewerKey,
                                initialModel: _currentModel,
                                onModelChanged: (model) {
                                  setState(() {
                                    _currentModel = model;
                                  });
                                },
                                onARSessionChanged: (isArMode, isPlacementMode, [isPlaneDetected]) {
                                  setState(() {
                                    _isArMode = isArMode;
                                    _isPlacementMode = isPlacementMode;
                                    if (isPlaneDetected != null) {
                                      _isPlaneDetected = isPlaneDetected;
                                    }
                                  });
                                  debugPrint(
                                    '🔄 AR 상태 변경: AR모드=$isArMode, 배치모드=$isPlacementMode, 평면감지=$_isPlaneDetected',
                                  );
                                },
                              ), // Model Viewer
                            ),
                            const PhotoCaptureWidget(), // 포토 캡처 오버레이
                            // 프레임 장식 요소들 (4 모서리)
                            _buildFrameCornerDecorations(),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // 화면 최상단: 모델 선택 캐러셀 (핸드폰 화면 기준 최상단)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10, // 상태바 아래 10px
            left: 0,
            right: 0,
            child: LayoutBuilder(
              builder: (context, constraints) {
                // 중앙 컨테이너와 동일한 크기 계산
                double containerSize =
                    constraints.maxWidth < constraints.maxHeight
                    ? constraints.maxWidth -
                          40 // 좌우 여백 20px씩
                    : constraints.maxHeight - 200; // 상하단 UI 공간 확보

                return ModelSelectionCarousel(
                  onModelSelected: _onModelSelected,
                  containerWidth: containerSize, // 중앙 컨테이너 너비 전달
                );
              },
            ),
          ),

          // 화면 최하단: AR 컨트롤 버튼들 (핸드폰 화면 기준 최하단)
          Positioned(
            bottom:
                MediaQuery.of(context).padding.bottom +
                40, // 하단 안전 영역 위 20px (10 더 추가)
            left: 0,
            right: 0,
            child: ARControlsWidget(
              modelViewerKey: _modelViewerKey,
              isArMode: _isArMode,
              isPlacementMode: _isPlacementMode,
              isPlaneDetected: _isPlaneDetected,
              onARButtonPressed: _onARButtonPressed,
              onPlacementButtonPressed: _onPlacementButtonPressed,
            ),
          ),
        ],
      ),
    );
  }

  // 프레임 모서리 장식 요소들
  Widget _buildFrameCornerDecorations() {
    return Stack(
      children: [
        // 좌상단 모서리 장식
        Positioned(top: 8, left: 8, child: _buildCornerDecoration()),
        // 우상단 모서리 장식
        Positioned(
          top: 8,
          right: 8,
          child: Transform.rotate(
            angle: 1.5708, // 90도 회전
            child: _buildCornerDecoration(),
          ),
        ),
        // 좌하단 모서리 장식
        Positioned(
          bottom: 8,
          left: 8,
          child: Transform.rotate(
            angle: -1.5708, // -90도 회전
            child: _buildCornerDecoration(),
          ),
        ),
        // 우하단 모서리 장식
        Positioned(
          bottom: 8,
          right: 8,
          child: Transform.rotate(
            angle: 3.14159, // 180도 회전
            child: _buildCornerDecoration(),
          ),
        ),
      ],
    );
  }

  // 개별 모서리 장식 요소
  Widget _buildCornerDecoration() {
    return Container(
      width: 24,
      height: 24,
      decoration: const BoxDecoration(
        // 배경을 완전히 투명하게 변경
        color: Colors.transparent,
      ),
      child: CustomPaint(painter: CornerDecorationPainter()),
    );
  }
}

// 교회풍 모서리 장식을 그리는 커스텀 페인터
class CornerDecorationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = LiquidGlassTheme.primaryBlue.withAlpha(120)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final shadowPaint = Paint()
      ..color = Colors.white.withAlpha(180)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    // 신성한 십자가 형태의 장식 라인
    final path = Path();

    // 수직선 (위쪽)
    path.moveTo(size.width * 0.5, 2);
    path.lineTo(size.width * 0.5, size.height * 0.4);

    // 수평선 (좌측)
    path.moveTo(2, size.height * 0.5);
    path.lineTo(size.width * 0.4, size.height * 0.5);

    // 그림자 효과 먼저 그리기
    canvas.drawPath(path, shadowPaint);

    // 메인 라인 그리기
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
