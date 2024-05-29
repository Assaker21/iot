const mqtt = require("mqtt");
const db = require("./db");

const topics = [];

db.query("SELECT * FROM device", (error, results, fields) => {
  if (error) {
    console.error("Error executing query:", error.stack);
    return;
  }

  results.forEach((result) => {
    topics.push("iot_system/" + result.name);
  });

  db.end((err) => {
    if (err) {
      console.error("Error ending the connection:", err.stack);
      return;
    }
    console.log("Connection closed.");
  });
});

const client = mqtt.connect("mqtt://test.mosquitto.org");

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error("Failed to subscribe:", err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });
});

client.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log("Data: ", data);
});

client.on("error", (err) => {
  console.error("Connection error:", err);
  client.end();
});
