import { Text } from "@ui-kitten/components";

export default function Status({ children }) {
  return (
    <Text
      appearance="hint"
      category="label"
      status={
        children == "Online"
          ? "success"
          : children == "Offline"
          ? "warning"
          : children == "Disabled"
          ? "basic"
          : ""
      }
    >
      {children}
    </Text>
  );
}
