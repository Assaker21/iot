import {
  Card,
  Divider,
  Icon,
  List,
  ListItem,
  Text,
  Button,
} from "@ui-kitten/components";
import api from "../api/api";
import LoadingLayout from "../components/loading-layout.component";
import { useEffect, useMemo, useState } from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

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

  const chartData = useMemo(() => {
    if (!state) return [{ label: "hi", value: 2 }];
    const logs = state.total.logs;

    const result = {};

    logs.forEach((element) => {
      const key = new Date(element.time).getHours();
      if (result[key]) result[key] = 0;
      result[key] +=
        element.status == "Online"
          ? (element.current * element.voltage) / 1000
          : 0;
    });

    for (let i = 0; i < 24; i++) {
      if (!result[i]) result[i] = 0;
    }

    const data = Object.keys(result).map((key) => {
      return {
        label: key + ":00",
        value: result[key],
      };
    });

    return data;
  }, [state]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <LoadingLayout loading={loading.fetch} style={{ height: "100%" }}>
      {!loading.fetch && (
        <>
          <View
            style={{
              padding: 16,
              paddingTop: 56,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text category="h3">Dashboard</Text>

            <Button
              style={{ padding: 0, margin: 0, width: 0, height: 0 }}
              appearance="ghost"
              onPress={() => {
                fetchDashboardData();
              }}
              accessoryRight={(props) => (
                <Icon
                  {...props}
                  style={{ ...props.style, padding: 0, margin: 0 }}
                  name="refresh-outline"
                />
              )}
            ></Button>
          </View>
          <Card
            style={{
              margin: 16,
              marginTop: 0,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                marginHorizontal: -8,
                gap: 16,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",

                  flex: 1,
                }}
              >
                <View
                  style={{
                    padding: 8,
                    borderRadius: 500,
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Icon
                    name="flash-outline"
                    style={{
                      width: 28,
                      height: 28,
                    }}
                  />
                </View>
                <View>
                  <Text category="h6" style={{ margin: 0 }}>
                    {(
                      (state?.total.current * state?.total.voltage) /
                      1000
                    ).toFixed(0)}{" "}
                    W
                  </Text>
                  <Text
                    category="label"
                    appearance="hint"
                    style={{ margin: 0 }}
                  >
                    used now
                  </Text>
                </View>
              </View>
              <View
                style={{
                  height: "220%",
                  width: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  marginVertical: -16,
                }}
              />
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",

                  flex: 1,
                }}
              >
                <View
                  style={{
                    padding: 8,
                    borderRadius: 500,
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Icon
                    name="activity-outline"
                    style={{
                      width: 28,
                      height: 28,
                    }}
                  />
                </View>

                <View>
                  <Text category="h6" style={{ margin: 0 }}>
                    {(state?.total.energy).toFixed(2).replace(".00", "")} kWh
                  </Text>
                  <Text
                    category="label"
                    appearance="hint"
                    style={{ margin: 0 }}
                  >
                    used this month
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <View
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 16,
            }}
          >
            <LineChart
              width={Dimensions.get("window").width - 90}
              areaChart
              data={chartData}
              startFillColor="rgb(46, 217, 255)"
              startOpacity={0.8}
              endFillColor="rgb(203, 241, 250)"
              endOpacity={0.3}
              parentWidth={Dimensions.get("window").width - 90}
            />
          </View>

          <Text style={{ paddingHorizontal: 16 }}>Connected devices</Text>

          <List
            data={Object.values(state?.devices)}
            renderItem={({ item }) => (
              <ListItem
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                title={
                  <View>
                    <Text category="h6">{item.description}</Text>
                  </View>
                }
                description={
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <Text category="s1">
                        {((item.average.current * item.average.voltage) / 1000)
                          .toFixed(2)
                          .replace(".00", "")}{" "}
                        W&nbsp;
                      </Text>
                      <Text category="s2" appearance="hint">
                        used now
                      </Text>
                    </View>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <Text category="s1">
                        {item.energy.toFixed(2).replace(".00", "")} kWh&nbsp;
                      </Text>
                      <Text category="s2" appearance="hint">
                        used this month
                      </Text>
                    </View>
                  </View>
                }
              />
            )}
            ItemSeparatorComponent={<Divider />}
          />
        </>
      )}
    </LoadingLayout>
  );
}
