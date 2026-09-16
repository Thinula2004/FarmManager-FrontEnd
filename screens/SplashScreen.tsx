import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { getToken } from "../services/AuthService";
import { navigateFromStack } from "../navigation/navigator";

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const lineScale = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(lineScale, {
      toValue: 1,
      duration: 500,
      delay: 450,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 450,
        delay: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(titleY, {
        toValue: 0,
        duration: 450,
        delay: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(bottomOpacity, {
      toValue: 1,
      duration: 400,
      delay: 950,
      useNativeDriver: true,
    }).start();

    Animated.timing(dotsOpacity, {
      toValue: 1,
      duration: 300,
      delay: 1100,
      useNativeDriver: true,
    }).start(() => {
      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.delay(760 - delay),
          ]),
        ).start();

      pulse(dot1, 0);
      pulse(dot2, 180);
      pulse(dot3, 360);
    });
  }, []);

  const checkLogin = async () => {
    const token = await getToken();
    if (token) {
      navigateFromStack("Home", undefined, true);
    } else {
      navigateFromStack("Login", undefined, true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkLogin();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Animated.View
        style={[
          s.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("../assets/logo.png")}
          style={s.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[s.line, { transform: [{ scaleX: lineScale }] }]} />

      <Animated.Text
        style={[
          s.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        Uva Farm
      </Animated.Text>

      <Animated.Text style={[s.subtitle, { opacity: subtitleOpacity }]}>
        Mahiyanganaya
      </Animated.Text>

      <Animated.View style={[s.dotsRow, { opacity: dotsOpacity }]}>
        <Animated.View style={[s.dot, { opacity: dot1 }]} />
        <Animated.View style={[s.dot, { opacity: dot2 }]} />
        <Animated.View style={[s.dot, { opacity: dot3 }]} />
      </Animated.View>

      <Animated.Text style={[s.bottomText, { opacity: bottomOpacity }]}>
        Farm Management System
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },

  logoWrap: {
    marginBottom: 28,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#dcfce7",
  },
  logo: {
    width: 100,
    height: 100,
  },

  line: {
    width: 40,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#15803D",
    marginBottom: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#5db37d",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 0,
  },

  dotsRow: {
    position: "absolute",
    bottom: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#15803D",
  },

  bottomText: {
    position: "absolute",
    bottom: 68,
    fontSize: 10,
    fontWeight: "600",
    color: "#5ca375",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
});
