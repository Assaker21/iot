const mqtt = require("mqtt");
const db = require("../db");
const { getTopics, addTopics } = require("./topics.mqtt");
const client = mqtt.connect("mqtt://test.mosquitto.org");

function subscribe(topic) {
  if (!client.connected) return false;
  client.subscribe("iot_system/" + topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to topic: ${"iot_system/" + topic}`);
    }
  });
  return true;
}

function unsubscribe(topic) {
  if (!client.connected) return false;
  client.unsubscribe("iot_system/" + topic, (err) => {
    if (err) {
      console.error("Failed to unsubscribe:", err);
    } else {
      console.log(`Unsubscribed from topic: ${"iot_system/" + topic}`);
    }
  });
  return true;
}

function sendMessage(topic, message = "on") {
  console.log("Sent message: ", message, " to topic: ", "iot_system/" + topic);
  client.publish("iot_system/" + topic, message);
}

client.on("connect", async () => {
  console.log("Connected to MQTT broker");

  const [results] = await db.query("SELECT * FROM device", []);
  const addresses = results
    .filter((device) => device.macAddress?.length == 17)
    .map((device) => device.macAddress);

  addTopics(addresses);

  getTopics().forEach((topic) => {
    subscribe(topic);
  });
});

client.on("message", async (topic, message) => {
  if (message.toString() == "Offline" || message.toString() == "Online") return;

  const data = JSON.parse(message.toString());
  const macAddress = topic.replace("iot_system/", "");

  console.log("LOG: ", topic, " => ", data);

  let [savedLog] = await db.query("SELECT * FROM device WHERE macAddress = ?", [
    macAddress,
  ]);

  savedLog = savedLog[0];

  console.log("SAVED LOG: ", savedLog);

  const log = {
    deviceId: macAddress,
    temperature: data.t,
    voltage: data.v,
    current: data.c,
    status: data.s ? "Online" : "Offline",
  };

  if (savedLog.status != log.status) {
    sendMessage(macAddress, savedLog.status);
  }

  console.log("Filtered LOG: ", log);

  db.query(
    `INSERT INTO log (${Object.keys(log).join(", ")}) VALUES (${Object.keys(log)
      .map(() => "?")
      .join(", ")})`,
    Object.values(log)
  );
});

client.on("error", (err) => {
  console.error("Connection error:", err);
  client.end();
});

module.exports = { client, subscribe, unsubscribe, sendMessage };
