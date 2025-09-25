import 'package:flutter/material.dart';
import 'model_data.dart';

// 🚀 Pure Flutter ModelViewer using model_viewer_plus
import 'model_viewer_plus_widget.dart';

class ModelViewerWidget extends StatefulWidget {
  final ModelData? initialModel;
  final Function(ModelData)? onModelChanged;
  final Function(bool isArMode, bool isPlacementMode, [bool? isPlaneDetected])? onARSessionChanged;

  const ModelViewerWidget({
    super.key,
    this.initialModel,
    this.onModelChanged,
    this.onARSessionChanged,
  });

  @override
  State<ModelViewerWidget> createState() => ModelViewerWidgetState();
}

class ModelViewerWidgetState extends State<ModelViewerWidget> {
  final GlobalKey<ModelViewerPlusWidgetState> _modelViewerKey =
      GlobalKey<ModelViewerPlusWidgetState>();

  void changeModel(ModelData newModel) {
    _modelViewerKey.currentState?.changeModel(newModel);
  }

  void enableIframeInteraction() {
    // 🚀 Pure Flutter 구현에서는 iframe 없음
    debugPrint('📝 iframe 인터랙션 무시됨 (Pure Flutter 구현)');
  }

  void disableIframeInteraction() {
    // 🚀 Pure Flutter 구현에서는 iframe 없음
    debugPrint('📝 iframe 인터랙션 무시됨 (Pure Flutter 구현)');
  }

  void sendMessageToIframe(Map<String, dynamic> message) {
    // 🚀 iframe 메시지는 더 이상 필요 없음 (pure Flutter)
    debugPrint('📝 iframe 메시지 무시됨 (Pure Flutter 구현): $message');
  }

  @override
  Widget build(BuildContext context) {
    return ModelViewerPlusWidget(
      key: _modelViewerKey,
      initialModel: widget.initialModel,
      onModelChanged: widget.onModelChanged,
      onARSessionChanged: (isArMode, isPlacementMode) {
        // 3번째 파라미터(plane detection)는 model_viewer_plus에서 자동 처리
        widget.onARSessionChanged?.call(isArMode, isPlacementMode, null);
      },
    );
  }
}