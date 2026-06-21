import { Platform } from "react-native";
import {
  deleteItemAsync as nativeDelete,
  getItemAsync as nativeGet,
  setItemAsync as nativeSet,
} from "expo-secure-store";

const webStorage = {
  getItemAsync: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItemAsync: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  deleteItemAsync: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const nativeStorage = {
  getItemAsync: (key: string) => nativeGet(key),
  setItemAsync: (key: string, value: string) => nativeSet(key, value),
  deleteItemAsync: (key: string) => nativeDelete(key),
};

export const secureStorage = Platform.OS === "web" ? webStorage : nativeStorage;
