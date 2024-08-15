import { Button, Layout, Text } from "@ui-kitten/components";
import { useAuthContext } from "../contexts/auth.context";
import { View } from "react-native";

export default function SettingsView() {
  const { logout, user } = useAuthContext();
  return (
    <Layout style={{ height: "100%", padding: 16 }}>
      <View
        style={{
          paddingTop: 40,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text category="h3">Settings</Text>
      </View>
      <Text style={{ paddingVertical: 16 }} category="h6">
        Email logged in: {user.email}
      </Text>
      <Button
        onPress={() => {
          logout();
        }}
      >
        Logout
      </Button>
    </Layout>
  );
}
