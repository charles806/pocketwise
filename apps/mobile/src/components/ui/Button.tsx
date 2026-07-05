import { Pressable, ActivityIndicator, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
  icon?: React.ReactNode;
  gradientColors?: [string, string];
}

const defaultColors: [string, string] = ["#7c3aed", "#9333ea"];

export function Button({
  onPress,
  disabled,
  loading,
  children,
  icon,
  gradientColors,
}: ButtonProps) {
  const isInactive = disabled || loading;
  const activeColors = gradientColors || defaultColors;
  const colors = isInactive
    ? (["#e2e8f0", "#e2e8f0"] as [string, string])
    : activeColors;

  return (
    <Pressable onPress={onPress} disabled={isInactive}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 12,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          shadowColor: isInactive ? "#cbd5e1" : activeColors[0],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text
              className="font-bold text-sm"
              style={{ color: isInactive ? "#94a3b8" : "#fff" }}
            >
              {children}
            </Text>
            {icon}
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
