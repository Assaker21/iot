import { Button, Layout, Text } from "@ui-kitten/components";
import { useAuthContext } from "../contexts/auth.context";

export default function SettingsView() {
  const { logout, user } = useAuthContext();
  return (
    <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text category="h1">SETTINGS</Text>
      <Button
        onPress={() => {
          logout();
        }}
      >
        Logout from {user.email}
      </Button>
    </Layout>
  );
}
