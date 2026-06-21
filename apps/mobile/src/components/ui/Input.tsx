import { View, Text, TextInput, type TextInputProps } from "react-native";
import type { ReactNode } from "react";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export function Input({ label, error, rightElement, ...props }: InputProps) {
  return (
    <View className="w-full">
      <Text className="text-sm text-slate-600 mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center border rounded-xl px-4 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
      >
        <TextInput
          className="flex-1 py-3.5 text-base text-slate-900"
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text className="text-xs text-red-500 mt-1">{error}</Text> : null}
    </View>
  );
}