import { Redirect } from "expo-router";

export default function Index() {
  // TODO: once a real authenticated home screen exists, check useAuth()
  // here and redirect there instead when a session is already valid.
  return <Redirect href="/login" />;
}