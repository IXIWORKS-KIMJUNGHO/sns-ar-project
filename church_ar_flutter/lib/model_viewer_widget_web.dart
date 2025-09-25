// ignore_for_file: avoid_web_libraries_in_flutter

import 'package:flutter/material.dart';
import 'dart:html' as html;
// ignore: undefined_prefixed_name
import 'dart:ui_web' as ui_web;
import 'feedback_manager.dart';
import 'gesture_hints_manager.dart';
import 'model_data.dart';

class ModelViewerWebWidget extends StatefulWidget {
  final ModelData? initialModel;
  final Function(ModelData)? onModelChanged;
  final Function(bool isArMode, bool isPlacementMode, [bool? isPlaneDetected])? onARSessionChanged;

  const ModelViewerWebWidget({
    super.key,
    this.initialModel,
    this.onModelChanged,
    this.onARSessionChanged,
  });

  @override
  State<ModelViewerWebWidget> createState() => ModelViewerWebWidgetState();
}

class ModelViewerWebWidgetState extends State<ModelViewerWebWidget> {
  final String viewType = 'model-viewer-html';
  bool isLoading = true;
  html.IFrameElement? _iframeElement;
  final GestureHintsManager _hintsManager = GestureHintsManager();
  ModelData _currentModel = ModelRepository.defaultModel;

  @override
  void initState() {
    super.initState();
    if (widget.initialModel != null) {
      _currentModel = widget.initialModel!;
    }
    _registerViewFactory();
    _setupMessageListener();
  }

  void changeModel(ModelData newModel) {
    debugPrint('🔄 Flutter 모델 변경: ${newModel.name}');

    if (_currentModel.id != newModel.id) {
      setState(() {
        _currentModel = newModel;
        isLoading = true;
      });

      // iframe은 항상 활성화 상태 유지

      // 새 모델 로드 메시지를 Model Viewer에 전송
      final message = {
        'type': 'changeModel',
        'src': newModel.src,
        'name': newModel.name,
      };

      _sendMessageToModelViewer(message);
      widget.onModelChanged?.call(newModel);
      FeedbackManager.mediumImpact();

      debugPrint('✅ 모델 변경 요청 완료: ${newModel.name}');
    } else {
      debugPrint('⚠️ 동일한 모델이므로 변경하지 않음: ${newModel.name}');
    }
  }

  
  void _setupMessageListener() {
    // Model Viewer에서 오는 메시지 수신
    html.window.addEventListener('message', (html.Event event) {
      try {
        final messageEvent = event as html.MessageEvent;
        final data = messageEvent.data;

        // LinkedMap<dynamic, dynamic>을 Map<String, dynamic>으로 변환
        Map<String, dynamic>? convertedData;

        if (data is Map<String, dynamic>) {
          convertedData = data;
        } else if (data is Map) {
          try {
            convertedData = Map<String, dynamic>.from(data);
          } catch (e) {
            debugPrint('❌ 타입 변환 실패: $e');
          }
        }

        if (convertedData != null) {
          _handleModelViewerMessage(convertedData);
        }
      } catch (e) {
        debugPrint('❌ 메시지 처리 중 에러: $e');
      }
    });
  }

  void _handleModelViewerMessage(Map<String, dynamic> message) {
    final type = message['type'] as String?;

    switch (type) {
      case 'arButtonPressed':
        FeedbackManager.mediumImpact();
        _hintsManager.onArButtonPressed();
        break;

      case 'modelTouched':
        FeedbackManager.modelTouch();
        _hintsManager.onUserInteraction();
        break;

      case 'gestureStart':
        FeedbackManager.gestureStart();
        _hintsManager.onUserInteraction();
        break;

      case 'gestureEnd':
        FeedbackManager.gestureEnd();
        break;

      case 'rotation':
        _hintsManager.onRotationGesture();
        break;

      case 'zoom':
        _hintsManager.onZoomGesture();
        break;

      case 'arSessionStarted':
        FeedbackManager.arSessionStart();
        debugPrint('🚀 AR 세션 시작');
        if (widget.onARSessionChanged != null) {
          widget.onARSessionChanged!(true, true);
        }
        break;

      case 'arSessionEnded':
        FeedbackManager.arSessionEnd();
        debugPrint('🛑 AR 세션 종료');
        if (widget.onARSessionChanged != null) {
          widget.onARSessionChanged!(false, false);
        }
        break;

      case 'modelLoading':
        setState(() {
          isLoading = true;
        });
        debugPrint('🔄 모델 로딩 시작: ${message['name']}');
        break;

      case 'modelLoaded':
        setState(() {
          isLoading = false;
        });

        // iframe은 계속 활성화 상태 유지 (3D 모델 터치 가능)

        FeedbackManager.successPattern();
        debugPrint('✅ 모델 로딩 완료: ${message['name']}');
        break;

      case 'error':
        // iframe은 에러 상황에서도 활성화 상태 유지
        setState(() {
          isLoading = false;
        });
        FeedbackManager.errorPattern();
        debugPrint('❌ 모델 로딩 에러: ${message['message']}');
        break;

      case 'modelsPreloaded':
        debugPrint('🎉 모든 모델 프리로딩 완료: ${message['count']}개');
        break;

      case 'modelPlaced':
        debugPrint('📍 모델 배치 완료');
        if (widget.onARSessionChanged != null) {
          widget.onARSessionChanged!(true, false);
        }
        break;

      case 'planeDetectionChanged':
        bool detected = message['detected'] ?? false;
        String? detectionMessage = message['message'];
        debugPrint('🔍 평면 감지 상태 변경: $detected');
        if (detectionMessage != null) {
          debugPrint('💬 평면 감지 메시지: $detectionMessage');
        }
        if (widget.onARSessionChanged != null) {
          widget.onARSessionChanged!(true, true, detected);
        }
        break;

      case 'modelDragging':
        // 터치 기반 모델 이동 피드백
        double? x = message['x']?.toDouble();
        double? y = message['y']?.toDouble();
        double? distance = message['distance']?.toDouble();

        if (x != null && y != null && distance != null) {
          // 거리에 따른 햅틱 피드백 강도 조절
          if (distance > 100) {
            FeedbackManager.lightImpact(); // 멀리 드래그할 때는 가벼운 피드백
          } else if (distance > 50) {
            FeedbackManager.mediumImpact(); // 중간 거리는 중간 피드백
          }

          debugPrint('👆 모델 드래그 피드백: x=$x, y=$y, distance=${distance.toStringAsFixed(1)}');
        }
        break;

      case 'groundPlaneShown':
        // Ground Plane 시각화 시 햅틱 피드백
        FeedbackManager.mediumImpact();
        double? width = message['width']?.toDouble();
        double? height = message['height']?.toDouble();
        double? x = message['x']?.toDouble();
        double? y = message['y']?.toDouble();

        debugPrint('🎯 Ground Plane 표시됨: ${width}x$height at ($x, $y)');
        break;

      default:
        debugPrint('❓ 알 수 없는 메시지 타입: $type');
    }
  }

  void _sendMessageToModelViewer(Map<String, dynamic> message) {
    _iframeElement?.contentWindow?.postMessage(message, '*');
  }

  void enableIframeInteraction() {
    // iframe은 항상 활성화 상태
    debugPrint('✅ iframe 터치 항상 활성화됨 (Smart Overlay 방식)');
  }

  void disableIframeInteraction() {
    // Smart Overlay 방식에서는 iframe 비활성화하지 않음
    debugPrint('ℹ️ Smart Overlay 방식 - iframe 비활성화하지 않음');
  }

  void sendMessageToIframe(Map<String, dynamic> message) {
    debugPrint('📤 Flutter에서 iframe으로 메시지 전송: $message');
    _sendMessageToModelViewer(message);
  }

  void _registerViewFactory() {
    // ignore: undefined_prefixed_name
    ui_web.platformViewRegistry.registerViewFactory(
      viewType,
      (int viewId) {
        _iframeElement = html.IFrameElement()
          ..src = 'model_viewer.html'
          ..style.border = 'none'
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.pointerEvents = 'auto' // 3D 모델 터치 가능
          ..setAttribute('scrolling', 'no') // 스크롤 비활성화
          ..setAttribute('allow', 'xr-spatial-tracking'); // AR 권한

        // iframe 로드 완료 후 초기 모델 설정
        _iframeElement!.onLoad.listen((_) {
          Future.delayed(const Duration(milliseconds: 500), () {
            _sendMessageToModelViewer({
              'type': 'changeModel',
              'src': _currentModel.src,
              'name': _currentModel.name,
            });

            // 로딩 완료 후 pointer-events 제어 준비
            debugPrint('🔗 iframe 로드 완료, 이벤트 제어 활성화');
          });
        });

        return _iframeElement!;
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        HtmlElementView(
          viewType: viewType,
        ),
        // 로딩 오버레이
        if (isLoading)
          Container(
            color: Colors.black.withAlpha(128),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(26),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Column(
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
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "잠시만 기다려주세요",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}