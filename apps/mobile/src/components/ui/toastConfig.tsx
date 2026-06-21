import { View, Text } from "react-native";
import type { BaseToastProps } from "react-native-toast-message";

const borderColor: Record<string, string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  error: "border-l-red-500",
};

function CustomToast({ type, text1, text2 }: BaseToastProps & { type: string }) {
  return (
    <View className={`w-[90%] bg-white rounded-2xl p-4 shadow-md border-l-4 ${borderColor[type]}`}>
      {text1 ? <Text className="font-bold text-slate-900 mb-1">{text1}</Text> : null}
      <Text className="text-slate-600 text-sm">{text2}</Text>
    </View>
  );
}

export const toastConfig = {
  info: (props: BaseToastProps) => <CustomToast type="info" {...props} />,
  warning: (props: BaseToastProps) => <CustomToast type="warning" {...props} />,
  error: (props: BaseToastProps) => <CustomToast type="error" {...props} />,
};