import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'model_data.dart';

// 조건부 import로 웹과 모바일 분리
import 'model_viewer_widget_web.dart' if (dart.library.io) 'model_viewer_widget_stub.dart';

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
  final GlobalKey<ModelViewerWebWidgetState> _webWidgetKey = GlobalKey();

  void changeModel(ModelData newModel) {
    if (kIsWeb) {
      _webWidgetKey.currentState?.changeModel(newModel);
    }
  }

  void enableIframeInteraction() {
    if (kIsWeb) {
      _webWidgetKey.currentState?.enableIframeInteraction();
    }
  }

  void disableIframeInteraction() {
    if (kIsWeb) {
      _webWidgetKey.currentState?.disableIframeInteraction();
    }
  }

  void sendMessageToIframe(Map<String, dynamic> message) {
    if (kIsWeb) {
      _webWidgetKey.currentState?.sendMessageToIframe(message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return ModelViewerWebWidget(
        key: _webWidgetKey,
        initialModel: widget.initialModel,
        onModelChanged: widget.onModelChanged,
        onARSessionChanged: widget.onARSessionChanged,
      );
    } else {
      // 모바일 플랫폼에서는 다른 위젯 사용 가능
      return const Center(
        child: Text('AR은 웹에서만 지원됩니다'),
      );
    }
  }
}