import 'package:flutter/material.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';
import 'feedback_manager.dart';
import 'gesture_hints_manager.dart';
import 'model_data.dart';

/// 🚀 Pure Flutter ModelViewer widget using model_viewer_plus
/// Replaces the iframe-based implementation with native Flutter
class ModelViewerPlusWidget extends StatefulWidget {
  final ModelData? initialModel;
  final Function(ModelData)? onModelChanged;
  final Function(bool isArMode, bool isPlacementMode)? onARSessionChanged;

  const ModelViewerPlusWidget({
    super.key,
    this.initialModel,
    this.onModelChanged,
    this.onARSessionChanged,
  });

  @override
  State<ModelViewerPlusWidget> createState() => ModelViewerPlusWidgetState();
}

class ModelViewerPlusWidgetState extends State<ModelViewerPlusWidget> {
  final GestureHintsManager _hintsManager = GestureHintsManager();
  ModelData _currentModel = ModelRepository.defaultModel;
  bool _isLoading = true;
  bool _isArMode = false;
  bool _showGroundPlane = false;
  Offset? _groundPlanePosition;

  @override
  void initState() {
    super.initState();
    if (widget.initialModel != null) {
      _currentModel = widget.initialModel!;
    }
  }

  void changeModel(ModelData newModel) {
    debugPrint('🔄 Flutter 모델 변경: ${newModel.name}');

    if (_currentModel.id != newModel.id) {
      setState(() {
        _currentModel = newModel;
        _isLoading = true;
      });

      widget.onModelChanged?.call(newModel);
      FeedbackManager.mediumImpact();

      debugPrint('✅ 모델 변경 완료: ${newModel.name}');
    } else {
      debugPrint('⚠️ 동일한 모델이므로 변경하지 않음: ${newModel.name}');
    }
  }

  void _handleModelTap(Offset position) {
    debugPrint('👆 모델 터치됨: ${position.dx}, ${position.dy}');

    // 햅틱 피드백
    FeedbackManager.mediumImpact();

    // 터치 힌트 업데이트
    _hintsManager.onUserInteraction();

    // 🎯 AR 모드에서 Ground Plane 표시
    if (_isArMode) {
      setState(() {
        _showGroundPlane = true;
        _groundPlanePosition = position;
      });

      // 3초 후 자동 숨김
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _showGroundPlane = false;
            _groundPlanePosition = null;
          });
        }
      });

      debugPrint('🎯 Ground Plane 표시됨 at: ${position.dx}, ${position.dy}');
    }
  }

  void _handleArModeChanged(bool isArMode) {
    debugPrint('🚀 AR 모드 변경: $isArMode');

    setState(() {
      _isArMode = isArMode;
    });

    if (isArMode) {
      FeedbackManager.arSessionStart();
    } else {
      FeedbackManager.arSessionEnd();
      // AR 종료 시 Ground Plane 숨김
      setState(() {
        _showGroundPlane = false;
        _groundPlanePosition = null;
      });
    }

    widget.onARSessionChanged?.call(isArMode, false);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 🎯 Main ModelViewer
        GestureDetector(
          onTapDown: (details) {
            _handleModelTap(details.localPosition);
          },
          child: ModelViewer(
            backgroundColor: const Color.fromARGB(0xFF, 0xEE, 0xEE, 0xEE),
            src: _currentModel.src,
            alt: _currentModel.name,
            ar: true,
            arModes: const ['webxr', 'scene-viewer', 'quick-look'],
            autoRotate: false,
            cameraControls: true,
            disableTap: false,
            loading: Loading.eager,
            onWebViewCreated: (controller) {
              debugPrint('🎯 ModelViewer WebView 생성됨');
              setState(() {
                _isLoading = false;
              });
            },
          ),
        ),

        // 🎯 Ground Plane Visualization
        if (_showGroundPlane && _groundPlanePosition != null)
          _buildGroundPlane(_groundPlanePosition!),

        // 로딩 오버레이
        if (_isLoading)
          Container(
            color: Colors.black.withAlpha(128),
            child: const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF667EEA)),
                    strokeWidth: 3,
                  ),
                  SizedBox(height: 16),
                  Text(
                    "3D 모델 로딩 중...",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "잠시만 기다려주세요",
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  /// 🎯 Ground Plane 위젯 생성
  Widget _buildGroundPlane(Offset position) {
    const double planeSize = 150.0;

    // 화면 중앙 하단에 배치 (터치 위치 기준으로 조정)
    final centerX = MediaQuery.of(context).size.width / 2;
    final bottomY = MediaQuery.of(context).size.height * 0.75;

    return Positioned(
      left: centerX - planeSize / 2,
      top: bottomY - planeSize / 2,
      child: AnimatedOpacity(
        opacity: _showGroundPlane ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 300),
        child: Container(
          width: planeSize,
          height: planeSize,
          decoration: BoxDecoration(
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.9),
              width: 3,
            ),
            borderRadius: BorderRadius.circular(8),
            color: Colors.white.withValues(alpha: 0.1),
          ),
          child: Stack(
            children: [
              // 펄스 효과
              AnimatedBuilder(
                animation: const AlwaysStoppedAnimation(0),
                builder: (context, child) {
                  return Container(
                    width: planeSize,
                    height: planeSize,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.white.withOpacity(0.3),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.4),
                          blurRadius: 8,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}