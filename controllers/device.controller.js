const db = require("../db");
const { sendMessage } = require("../mqtt/connection.mqtt");
const { addTopicAndSubscribe } = require("../mqtt/topics.mqtt");

async function findMany(req, res) {
  console.log("Get devices! ");
  const [result] = await db.query("SELECT * FROM device WHERE userId = ?", [
    req.user.id,
  ]);

  const devices = result.map((device) => ({
    ...device,
    usage: 124.1233,
  }));

  res.json(devices);
}

async function update(req, res) {
  console.log("Update device: ", req.params.id, " -> ", req.body);

  const newDevice = req.body;
  if (newDevice.id) delete newDevice.id;

  const id = req.params.id;

  const valuesArray = [...Object.values(newDevice), id];

  const [result] = await db.query(
    `UPDATE device SET ${Object.keys(newDevice).join(
      "= ? , "
    )} = ? WHERE id = ?`,
    valuesArray
  );

  let [device] = await db.query("SELECT * FROM device WHERE id = ?", [id]);
  device = device[0];
  if (device) {
    sendMessage(device.macAddress, device.status);
  }

  console.log("RESULT: ", device);

  res.json(device);
}

async function create(req, res) {
  console.log("New device: ", req.body);

  const newDevice = req.body;
  delete newDevice.id;

  newDevice.userId = req.user.id;

  const valuesArray = Object.values(newDevice);

  const [result] = await db.query(
    `INSERT INTO device (${Object.keys(newDevice).join(
      ", "
    )}) VALUES (${Object.keys(newDevice)
      .map(() => "?")
      .join(", ")})`,
    valuesArray
  );

  const macAddress = newDevice.macAddress;
  addTopicAndSubscribe(macAddress);

  res.json(result);
}

module.exports = { findMany, update, create };
