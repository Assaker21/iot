import {
  Card,
  Datepicker,
  IndexPath,
  Layout,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import LoadingButton from "../components/loading-button.component";
import { useState } from "react";
import { View } from "react-native";
import api from "../api/api";

export default function PredictionsView() {
  const [state, setState] = useState({
    startDate: new Date(),
    endDate: new Date(),
    target: new IndexPath(0),
  });

  const [loading, setLoading] = useState({ fetch: false });

  const [prediction, setPrediction] = useState(null);

  const options = ["Today", "This month", "This year"];

  const makePrediction = async () => {
    setLoading({ ...loading, fetch: true });
    const { ok, data } = await api.post(
      "prediction",
      {},
      {
        ...state,
        target: options[state.target.row].toLowerCase().replace("this ", ""),
      }
    );

    if (ok) {
      setPrediction(data.prediction);
    }

    setLoading({ ...loading, fetch: false });
  };

  return (
    <Layout
      style={{
        height: "100%",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <View
        style={{
          paddingTop: 40,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text category="h3">Predictions</Text>
      </View>
      <Card>
        <View style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text category="s1">
            Choose a time window to base the prediction onto:
          </Text>
          <Datepicker
            date={state.startDate}
            onSelect={(newDate) => {
              setState({ ...state, startDate: newDate });
            }}
            label={"Start date"}
          />
          <Datepicker
            date={state.endDate}
            onSelect={(newDate) => {
              setState({ ...state, endDate: newDate });
            }}
            max={new Date()}
            label={"End date"}
          />
        </View>
      </Card>

      <Card>
        <View style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text category="s1">Choose a time window to predict:</Text>
          <Select
            selectedIndex={state.target}
            value={options[state.target.row]}
            onSelect={(value) => {
              setState({ ...state, target: value });
            }}
            label={"Window"}
          >
            <SelectItem title="Today" />
            <SelectItem title="This month" />
            <SelectItem title="This year" />
          </Select>
        </View>
      </Card>

      <Card>
        <View style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text category="h6">Prediction</Text>
          <Text category="s1">
            {prediction
              ? `${prediction
                  .toFixed(2)
                  .replace(".00", "")} kWh will be used by the end of ${options[
                  state.target.row
                ].toLowerCase()}`
              : "None yet."}
          </Text>
        </View>
      </Card>

      <LoadingButton
        loading={loading.fetch}
        onPress={() => {
          makePrediction();
        }}
      >
        Predict
      </LoadingButton>
    </Layout>
  );
}
