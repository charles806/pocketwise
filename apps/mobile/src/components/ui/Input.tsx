import { View, Text, TextInput, type TextInputProps } from "react-native";
import type { ReactNode } from "react";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  focused?: boolean;
  disabled?: boolean;
}

export function Input({
  label,
  error,
  leftElement,
  rightElement,
  focused,
  disabled,
  ...props
}: InputProps) {
  return (
    <View className="w-full">
      <Text className="text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">
        {label}
      </Text>
      <View
        className="flex-row items-center px-4"
        style={{
          backgroundColor: focused && !error ? "#fff" : "#f8f7fb",
          borderWidth: 1.5,
          borderColor: error ? "#ef4444" : focused ? "#4f65dc" : "#e2e8f0",
          borderRadius: 14,
        }}
      >
        {leftElement}
        <TextInput
          className="flex-1 py-3.5 text-sm text-slate-900"
          placeholderTextColor="#94a3b8"
          editable={!disabled}
          {...props}
        />
        {rightElement}
      </View>
      {error ? (
        <Text className="text-xs font-medium text-red-500 mt-1 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
