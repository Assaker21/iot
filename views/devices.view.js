import {
  Text,
  ListItem,
  List,
  Button,
  Icon,
  Divider,
  Toggle,
  Spinner,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { View } from "react-native";
import api from "../api/api";
import LoadingLayout from "../components/loading-layout.component";

export default function DevicesView({ navigation }) {
  const [state, setState] = useState([]);

  const [loading, setLoading] = useState({ findMany: true, update: false });

  const findMany = async () => {
    setLoading({ ...loading, findMany: true });
    console.log("Finding many devices");
    const { ok, data } = await api.get("devices");
    console.log("Finding many devices: ", ok);

    if (ok) {
      setState(data);
    }

    setLoading({ ...loading, findMany: false });
  };

  const update = async (id, updated) => {
    const { ok, data } = await api.put("devices/" + id, {}, updated);
    return ok;
  };

  const updateStatus = async (index) => {
    setLoading({ ...loading, update: index + 1 });
    const ok = await update(state[index].id, {
      status: state[index].status == "Online" ? "Offline" : "Online",
    });

    if (ok) {
      setState((curr) => {
        curr[index].status =
          curr[index].status == "Online" ? "Offline" : "Online";
        return curr;
      });
    }

    setLoading({ ...loading, update: false });
  };

  useEffect(() => {
    findMany();
  }, []);

  const renderListItem = ({ item, index }) => (
    <ListItem
      disabled={loading.update == index + 1}
      onPress={() => {
        if (loading.update == index + 1) return;
        updateStatus(index);
      }}
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
      accessoryRight={() => {
        return (
          <>
            {loading.update == index + 1 ? (
              <Spinner />
            ) : (
              <Toggle
                style={{ pointerEvents: "none" }}
                checked={item.status == "Online"}
              ></Toggle>
            )}
          </>
        );
      }}
    />
  );

  return (
    <LoadingLayout loading={loading.findMany}>
      <Button
        onPress={() => {
          navigation.navigate("New device");
        }}
        style={{ margin: 16 }}
        size="small"
        accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
      >
        Add new device
      </Button>

      <View
        style={{
          paddingHorizontal: 16,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text>All devices</Text>
        <Button
          style={{ padding: 0, margin: 0, width: 0, height: 0 }}
          appearance="ghost"
          onPress={() => {
            findMany();
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
      <List
        data={state}
        renderItem={renderListItem}
        ItemSeparatorComponent={Divider}
      />
    </LoadingLayout>
  );
}
