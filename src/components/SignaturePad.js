import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';

const SignaturePad = React.forwardRef((props, ref) => {
  const [completedPaths, setCompletedPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const viewShotRef = useRef(null);

  const isValidPoint = useCallback((x, y) => {
    return x >= 0 && y >= 0 && x <= 2000 && y <= 1000 && !isNaN(x) && !isNaN(y);
  }, []);

  const pointsToSVGPath = useCallback((points) => {
    if (!points || points.length === 0) return '';
    
    if (points.length === 1) {
      const p = points[0];
      return `M ${p.x - 1.5},${p.y} a 1.5,1.5 0 1,0 3,0 a 1.5,1.5 0 1,0 -3,0`;
    }

    const parts = [`M ${points[0].x},${points[0].y}`];
    
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];
      
      const midX = (prev.x + curr.x) * 0.5;
      const midY = (prev.y + curr.y) * 0.5;
      
      if (i === 1) {
        parts.push(`L ${midX},${midY}`);
      } else {
        parts.push(`Q ${prev.x},${prev.y} ${midX},${midY}`);
      }
    }
    
    const last = points[points.length - 1];
    parts.push(`L ${last.x},${last.y}`);
    
    return parts.join(' ');
  }, []);

  const handleTouchStart = useCallback((evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    
    if (isValidPoint(locationX, locationY)) {
      setIsDrawing(true);
      setCurrentPath([{ x: locationX, y: locationY }]);
    }
  }, [isValidPoint]);

  const handleTouchMove = useCallback((evt) => {
    if (!isDrawing) return;
    
    const { locationX, locationY } = evt.nativeEvent;
    
    if (!isValidPoint(locationX, locationY)) return;

    setCurrentPath(prev => {
      const len = prev.length;
      if (len > 0) {
        const lastPoint = prev[len - 1];
        const dx = locationX - lastPoint.x;
        const dy = locationY - lastPoint.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < 4) return prev;
      }

      return [...prev, { x: locationX, y: locationY }];
    });
  }, [isDrawing, isValidPoint]);

  const handleTouchEnd = useCallback(() => {
    if (isDrawing && currentPath.length > 0) {
      setCompletedPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
      setIsDrawing(false);
    }
  }, [isDrawing, currentPath]);

  const clearSignature = useCallback(() => {
    setCompletedPaths([]);
    setCurrentPath([]);
    setIsDrawing(false);
  }, []);

  const saveSignature = useCallback(() => {
    return completedPaths.length > 0 || currentPath.length > 0;
  }, [completedPaths.length, currentPath.length]);

  const hasSignature = useCallback(() => {
    return completedPaths.length > 0 || currentPath.length > 0;
  }, [completedPaths.length, currentPath.length]);

  React.useImperativeHandle(ref, () => ({
    saveSignature,
    clearSignature,
    hasSignature,
    getSignatureData: () => ({ 
      paths: currentPath.length > 0 
        ? [...completedPaths, currentPath]
        : completedPaths
    }),
    captureAsJPG: async () => {
      if (!viewShotRef.current) {
        throw new Error('ViewShot ref no disponible');
      }
      try {
        const uri = await viewShotRef.current.capture();
        return uri;
      } catch (error) {
        console.error('Error capturando firma:', error);
        throw error;
      }
    },
  }), [saveSignature, clearSignature, hasSignature, currentPath, completedPaths]);

  const currentPathSVG = useMemo(() => 
    pointsToSVGPath(currentPath), 
    [currentPath, pointsToSVGPath]
  );

  const showPlaceholder = completedPaths.length === 0 && currentPath.length === 0;

  return (
    <View style={styles.container}>
      <ViewShot 
        ref={viewShotRef}
        options={{ 
          format: 'jpg', 
          quality: 0.8,
          result: 'tmpfile'
        }}
        style={styles.captureArea}
      >
        <View style={styles.canvasContainer}>
          <Svg width="100%" height="100%">
            {completedPaths.map((pathPoints, idx) => (
              <Path
                key={idx}
                d={pointsToSVGPath(pathPoints)}
                stroke="#000"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            
            {currentPath.length > 0 && (
              <Path
                d={currentPathSVG}
                stroke="#000"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
          
          {showPlaceholder && (
            <View style={styles.placeholder} pointerEvents="none">
              <View style={styles.placeholderLine} />
            </View>
          )}
        </View>
      </ViewShot>
      
      {/* Capa transparente para capturar toques sobre ViewShot */}
      <View 
        style={styles.touchLayer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      />
    </View>
  );
});

SignaturePad.displayName = 'SignaturePad';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  captureArea: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  canvasContainer: {
    flex: 1,
  },
  touchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  placeholder: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  placeholderLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#bbb',
  },
});

export default SignaturePad;