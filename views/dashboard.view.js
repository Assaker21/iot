import { Card, Icon, Layout, Text } from "@ui-kitten/components";
import api from "../api/api";
import LoadingLayout from "../components/loading-layout.component";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function DashboardView() {
  const [state, setState] = useState();
  const [loading, setLoading] = useState({ fetch: true });

  const fetchDashboardData = async () => {
    setLoading({ ...loading, fetch: true });
    const { ok, data } = await api.get("dashboard");
    if (ok) {
      setState(data);
    }
    setLoading({ ...loading, fetch: false });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <LoadingLayout
      loading={loading.fetch}
      style={{ padding: 16, paddingVertical: 32, height: "100%" }}
    >
      {!loading.fetch && (
        <>
          <Text style={{ paddingVertical: 24 }} category="h3">
            Dashboard
          </Text>
          <Card>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 16,
                  borderRadius: 500,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                }}
              >
                <Icon
                  name="flash-outline"
                  style={{
                    width: 40,
                    height: 40,
                  }}
                />
              </View>
              <View>
                <Text category="h5">
                  {(
                    (state?.total.current * state?.total.voltage) /
                    1000
                  ).toFixed(0)}{" "}
                  W
                </Text>
                <Text appearance="hint">used right now</Text>
              </View>
            </View>
          </Card>

          {Object.values(state?.devices)?.map((device) => {
            return (
              <Text key={device.id}>
                {device.description}:&nbsp;
                {(
                  (device.average.current * device.average.voltage) /
                  1000
                ).toFixed(2)}
                &nbsp;W
              </Text>
            );
          })}
        </>
      )}
    </LoadingLayout>
  );
}
