import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

const SignaturePad = React.forwardRef((props, ref) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths(prevPaths => [...prevPaths, currentPath]);
          setCurrentPath([]);
        }
      },
    })
  ).current;

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const saveSignature = () => {
    // Retorna true si hay firma, false si no hay
    return paths.length > 0 || currentPath.length > 0;
  };

  const hasSignature = () => {
    return paths.length > 0 || currentPath.length > 0;
  };

  // Expone estas funciones para que el componente padre pueda llamarlas
  React.useImperativeHandle(ref, () => ({
    saveSignature,
    clearSignature,
    hasSignature,
    getSignatureData: () => ({ paths, currentPath }),
  }));

  const renderPath = (pathPoints, index) => {
    if (pathPoints.length < 2) return null;

    return pathPoints.map((point, i) => {
      if (i === 0) return null;
      const prevPoint = pathPoints[i - 1];
      
      return (
        <View
          key={`${index}-${i}`}
          style={[
            styles.line,
            {
              left: Math.min(prevPoint.x, point.x),
              top: Math.min(prevPoint.y, point.y),
              width: Math.abs(point.x - prevPoint.x) || 3,
              height: Math.abs(point.y - prevPoint.y) || 3,
              transform: [
                {
                  rotate: `${Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x)}rad`,
                },
              ],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {paths.map((path, index) => renderPath(path, index))}
      {currentPath.length > 0 && renderPath(currentPath, 'current')}
      
      {/* Indicador de área de dibujo */}
      {paths.length === 0 && currentPath.length === 0 && (
        <View style={styles.placeholder}>
          <View style={styles.placeholderLine} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  placeholder: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  placeholderLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#ccc',
    borderStyle: 'dashed',
  },
});

export default SignaturePad;
