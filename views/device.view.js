import { Card, Layout, Text, Toggle } from "@ui-kitten/components";
import Status from "../components/status.component";
import { View } from "react-native";

export default function DeviceView({ route, navigation }) {
  const device = route.params;
  return (
    <Layout style={{ padding: 16, height: "100%" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text category="h5">{device.description}</Text>

        <Toggle checked={device.status == "Online"}></Toggle>
      </View>
      <Card>
        <Text>Current consumption: 1.453 kW</Text>
        <Text>Usage today: 242 kWh</Text>
      </Card>
    </Layout>
  );
}
