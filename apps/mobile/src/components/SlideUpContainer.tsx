import { useEffect, useState } from "react";
import { Animated, Dimensions, Easing } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible?: boolean;
  children: React.ReactNode;
}

export const SlideUpContainer = ({ visible = true, children }: Props) => {
  const [translateY] = useState(() => new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};
