import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Navigation from "../components/navigation.component";
import DashboardView from "../views/dashboard.view";
import DevicesView from "../views/devices.view";
import PredictionsView from "../views/predictions.view";
import SettingsView from "../views/settings.view";
import NewDeviceView from "../views/new-device.view";
import LoginView from "../views/login.view";
import RegisterView from "../views/register.view";
import { useAuthContext } from "../contexts/auth.context";
import { Layout, Text } from "@ui-kitten/components";

const { Navigator, Screen } = createBottomTabNavigator();

const DevicesStack = createNativeStackNavigator();
function DevicesStackScreen() {
  return (
    <DevicesStack.Navigator>
      <DevicesStack.Screen name="Devices" component={DevicesView} />
      <DevicesStack.Screen name="New device" component={NewDeviceView} />
    </DevicesStack.Navigator>
  );
}

export default function DashboardLayout() {
  const { splashScreen, isAuthenticated } = useAuthContext();

  if (splashScreen) {
    return (
      <Layout
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>LOADING...</Text>
      </Layout>
    );
  }

  return (
    <NavigationContainer>
      <Navigator
        tabBar={(props) => {
          if (isAuthenticated) return <Navigation {...props} />;
        }}
        screenOptions={{ headerShown: false }}
      >
        {isAuthenticated ? (
          <>
            <Screen name="Dashboard" component={DashboardView} />
            <Screen name="Predictions" component={PredictionsView} />
            <Screen name="DevicesStack" component={DevicesStackScreen} />
            <Screen name="Settings" component={SettingsView} />
          </>
        ) : (
          <>
            <Screen name="Login" component={LoginView} />
            <Screen name="Register" component={RegisterView} />
          </>
        )}
      </Navigator>
    </NavigationContainer>
  );
}
