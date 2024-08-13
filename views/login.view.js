import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useAuthContext } from "../contexts/auth.context";
import { useState } from "react";
import { View } from "react-native";
import LoadingButton from "../components/loading-button.component";

export default function LoginView({ navigation }) {
  const { login, loading } = useAuthContext();

  const [state, setState] = useState({
    email: "email",
    password: "password",
  });

  return (
    <Layout
      style={{
        width: "100%",
        height: "100%",
        padding: 16,
        gap: 16,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text category="h3" style={{ width: "100%" }}>
        Welcome back!
      </Text>

      <Input
        value={state.email}
        onChangeText={(value) => setState({ ...state, email: value })}
        label="Email"
      />
      <Input
        value={state.password}
        onChangeText={(value) => setState({ ...state, password: value })}
        secureTextEntry={true}
        label="Password"
      />
      <LoadingButton
        style={{ width: "100%" }}
        onPress={() => {
          login(state.email, state.password);
        }}
        loading={loading}
      >
        Login
      </LoadingButton>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <View
          style={{ flex: 1, height: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        />
        <Text category="c1">OR</Text>
        <View
          style={{ flex: 1, height: 2, backgroundColor: "rgba(0, 0, 0, 0.1)" }}
        />
      </View>
      <Button
        style={{ width: "100%" }}
        appearance="outline"
        onPress={() => {
          navigation.navigate("Register");
        }}
      >
        Register
      </Button>
    </Layout>
  );
}
