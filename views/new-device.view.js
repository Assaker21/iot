import { Layout, Button, ProgressBar, Text } from "@ui-kitten/components";
import { Input } from "@ui-kitten/components";
import { useMemo, useState } from "react";
import axios from "axios";
import api from "../api/api";
import LoadingButton from "../components/loading-button.component";

export default function NewDeviceView({ navigation }) {
  const [state, setState] = useState({ description: "", macAddress: "" });
  const [wifiInfo, setWifiInfo] = useState({
    ssid: "",
    password: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState({ submit: false });
  const [error, setError] = useState("");

  const steps = [
    "Prepare device",
    "Connect to device",
    "Send wifi credentials",
    "Connect back to your WiFi",
    "Add name",
    "Finished",
  ];

  const testInternetConnection = async () => {
    try {
      setLoading({ ...loading, submit: true });

      const response = await axios.get("https://google.com");
      if (response.status >= 200 && response.status < 300) {
        setError("");
        setCurrentStep(currentStep + 1);
      }
    } catch {
      setError(
        "No internet connection detected. Make sure you are connected to a network with internet connection."
      );
    }

    setLoading({ ...loading, submit: false });
  };

  const getMacAddress = async () => {
    setLoading({ ...loading, submit: true });
    try {
      let response = await axios.get("http://192.168.4.1", { timeout: 15000 });
      const macAddress =
        response.headers["X-MAC-Address"] || response.headers["x-mac-address"];
      setState({ ...state, macAddress });
      setCurrentStep(currentStep + 1);
      setError("");
    } catch (err) {
      setError(
        "Unable to connect to device. Make sure you are connected to the device's network.\n Go to your WiFi Settings, and connect to an open network with a name starting with 'DEVICE'."
      );
    }
    setLoading({ ...loading, submit: false });
  };

  const sendWiFiInfo = async () => {
    setLoading({ ...loading, submit: true });
    try {
      axios.post("http://192.168.4.1/submit", wifiInfo);
      setCurrentStep(currentStep + 1);
      setError("");
    } catch {}
    setLoading({ ...loading, submit: false });
  };

  const createDevice = async () => {
    setLoading({ ...loading, submit: true });

    try {
      const { ok, data } = await api.post("devices", {}, state);
      if (ok) {
        setCurrentStep(currentStep + 1);
        setError("");
      }
    } catch {
      setError(
        "Couldn't create device. Make sure you have an internet connection established."
      );
    }

    setLoading({ ...loading, submit: false });
  };

  const screen = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Text>If the devices LED is red, proceed.</Text>
            <Text>If not, click on the device's button to switch mode.</Text>
            <LoadingButton
              loading={loading.submit}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              The light is red, proceed
            </LoadingButton>
          </>
        );
      case 1:
        return (
          <>
            <Text>
              Open WiFi settings and find an open network with a name starting
              with DEVICE. Connect to it.
            </Text>
            <Text status="danger">{error}</Text>
            <LoadingButton
              loading={loading.submit}
              onPress={() => getMacAddress()}
            >
              I am connected to that network, proceed
            </LoadingButton>
            <Button
              appearance="ghost"
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              Go back
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Text>
              Add the WiFi credentials of your network. This one is used to
              connect the device to the internet.
            </Text>
            <Text status="danger">{error}</Text>
            <Input
              placeholder="eg. Jake's WiFi"
              value={wifiInfo.ssid}
              onChangeText={(nextValue) =>
                setWifiInfo({ ...wifiInfo, ssid: nextValue })
              }
              label="WiFi name (SSID) *"
            />
            <Input
              placeholder=""
              value={wifiInfo.password}
              onChangeText={(nextValue) =>
                setWifiInfo({ ...wifiInfo, password: nextValue })
              }
              label="WiFi password *"
            />
            <LoadingButton
              loading={loading.submit}
              onPress={() => sendWiFiInfo()}
            >
              Send WiFi credentials
            </LoadingButton>
            <Button
              appearance="ghost"
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              Go back
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Text>
              If the light is green on the device, then it has successfully
              connected. Otherwise, you should go back and make sure you have
              provided the right credentials.
            </Text>
            <Text>
              Open WiFi settings and find your network with internet connection.
              Connect to it.
            </Text>
            <Text variant="danger">{error}</Text>
            <LoadingButton
              loading={loading.submit}
              onPress={() => {
                testInternetConnection();
              }}
            >
              I am connected to my network, proceed
            </LoadingButton>

            <Button
              appearance="ghost"
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              Go back
            </Button>
          </>
        );
      case 4:
        return (
          <>
            <Text>
              Add device name. This will be used to identify the device in the
              app.
            </Text>

            <Input
              placeholder="eg. Refrigerator 1"
              value={state.description}
              onChangeText={(nextValue) =>
                setState({ ...state, description: nextValue })
              }
              label="Device name *"
            />
            <LoadingButton
              loading={loading.submit}
              onPress={() => createDevice()}
            >
              Create device
            </LoadingButton>
            <Button onPress={() => setCurrentStep(currentStep - 1)}>
              Go back
            </Button>
          </>
        );
      case 5:
        return (
          <>
            <Text>Device created successfully.</Text>
            <Button
              onPress={() => {
                navigation.pop();
              }}
            >
              Proceed
            </Button>
          </>
        );
    }
  }, [
    currentStep,
    loading,
    state,
    setState,
    wifiInfo,
    setWifiInfo,
    setCurrentStep,
    setLoading,
    error,
    setError,
  ]);

  return (
    <Layout
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
      }}
    >
      <Text category="h5">{steps[currentStep]}</Text>
      <ProgressBar progress={(currentStep + 1) / steps.length} />
      {screen}
    </Layout>
  );
}
