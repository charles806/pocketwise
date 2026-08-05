import React from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return <Redirect href={accessToken ? "/wallet" : "/login"} />;
};

export default Index;
