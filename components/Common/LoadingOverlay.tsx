import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Modal, Image } from "react-native";
import Colors from "../../services/ColorPalette";

// ── Animated dots ─────────────────────────────────────────
function Dots() {
  const d1 = useRef(new Animated.Value(0.25)).current;
  const d2 = useRef(new Animated.Value(0.25)).current;
  const d3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.delay(720 - delay),
        ]),
      ).start();

    pulse(d1, 0);
    pulse(d2, 200);
    pulse(d3, 400);
  }, []);

  return (
    <View style={dots.row}>
      <Animated.View style={[dots.dot, { opacity: d1 }]} />
      <Animated.View style={[dots.dot, { opacity: d2 }]} />
      <Animated.View style={[dots.dot, { opacity: d3 }]} />
    </View>
  );
}

const dots = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 22,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: Colors.G500,
  },
});

function RoosterAnimation() {
  const [frame, setFrame] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => !prev);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={rooster.container}>
      <Image
        source={
          frame
            ? require("../../assets/ChickAnim/rooster2.png")
            : require("../../assets/ChickAnim/rooster1.png")
        }
        style={rooster.image}
      />
    </View>
  );
}

const rooster = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    position: "absolute",
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});

// ── Loading overlay ───────────────────────────────────────
interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      // Mount first, then fade in
      setMounted(true);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out first
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal transparent animationType="none" visible={mounted}>
      <Animated.View style={[s.overlay, { opacity }]}>
        <RoosterAnimation />
        <Dots />
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
});
