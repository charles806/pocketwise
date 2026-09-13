import { Redirect } from "expo-router";

// import React from "react";
// import { View } from "react-native";
// import { useAuth } from "../context/AuthContext";

// const Index = () => {
//   const { accessToken, isLoading } = useAuth();

//   if (isLoading) {
//     return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
//   }

//   return <Redirect href={accessToken ? "/wallet" : "/login"} />;
// };

// export default Index;

const Index = () => <Redirect href="/(tabs)/wallet" />;

export default Index;
