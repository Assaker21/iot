const db = require("./db");
const { client, subscribe, unsubscribe } = require("./mqtt/connection.mqtt");
db.init();
const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.route");
const deviceRoutes = require("./routes/device.route");
const mainRoutes = require("./routes/main.route");

const app = express();
app.use(bodyParser());

app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);
app.use("/", mainRoutes);

app.listen(3000, () => {
  console.log(`App listening at http://localhost:${3000}`);
});
