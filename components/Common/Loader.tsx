import { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import Colors from "../../services/ColorPalette";

interface LoaderProps {
  visible: boolean;
  borderRadius?: number;
  foreground?: string;
  background?: string;
}

export default function Loader({
  visible,
  borderRadius = 0,
  foreground = "",
  background = "",
}: LoaderProps) {
  const bg = background || Colors.WHITE;
  const dot = foreground || Colors.G700;

  const [smaller, setSmaller] = useState(0);

  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 380,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(760 - delay),
        ]),
      );

    Animated.parallel([pulse(d1, 0), pulse(d2, 180), pulse(d3, 360)]).start();
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSmaller(Math.min(width, height));
  };

  const animScale = (val: Animated.Value) =>
    val.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  const animOpacity = (val: Animated.Value) =>
    val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  if (!visible) return null;

  const dotSize = Math.max(4, Math.round(smaller * 0.16));
  const gap = Math.max(2, Math.round(smaller * 0.08));

  return (
    <View
      style={[s.overlay, { borderRadius, backgroundColor: bg }]}
      pointerEvents="box-only"
      onLayout={onLayout}
    >
      {smaller > 0 && (
        <View style={[s.dotsRow, { gap }]}>
          {[d1, d2, d3].map((val, i) => (
            <Animated.View
              key={i}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dot,
                opacity: animOpacity(val),
                transform: [{ scale: animScale(val) }],
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
