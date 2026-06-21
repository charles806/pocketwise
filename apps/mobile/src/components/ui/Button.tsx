import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
}

export function Button({ onPress, disabled, loading, children }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full rounded-xl py-3.5 items-center mt-2 ${
        isDisabled ? "bg-slate-200" : "bg-[#0f172a]"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`font-bold text-base ${isDisabled ? "text-slate-400" : "text-white"}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}