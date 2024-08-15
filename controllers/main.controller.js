const db = require("../db");
const { predict } = require("../ml/predictor");

async function getDashboardData(req, res) {
  const [devices] = await db.query("SELECT * FROM device WHERE userId = ?", [
    req.user?.id || 1,
  ]);

  let [logs] = await db.query(
    `
    WITH RankedLogs AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY deviceId ORDER BY time DESC) AS rn
        FROM log
        WHERE deviceId IN (${devices.map((_, index) => "?").join(", ")})
    )
    SELECT * FROM RankedLogs WHERE rn <= 5;
    `,
    devices.map((d) => d.macAddress)
  );

  const dictDevices = {};
  devices.forEach((device) => (dictDevices[device.macAddress] = device));

  const groupedLogs = {};
  logs.map((log) => {
    if (!groupedLogs[log.deviceId]) groupedLogs[log.deviceId] = [];
    if (log.status == "Offline" || log.voltage < 50) {
      log.voltage = 0;
      log.current = 0;
    }
    if (new Date() - new Date(log.time) < 1000 * 60 * 5) {
      groupedLogs[log.deviceId].push(log);
    }
  });

  const averagesTotal = { current: 0, voltage: 0, temperature: 0 };
  Object.keys(groupedLogs).forEach((key) => {
    const average = {
      current: 0,
      voltage: 0,
      temperature: 0,
    };

    groupedLogs[key].forEach((log) => {
      average.current += log.current || 0;
      average.voltage += log.voltage || 0;
      average.temperature += log.temperature || 0;
    });

    average.current /= groupedLogs[key].length || 1;
    average.voltage /= groupedLogs[key].length || 1;
    average.temperature /= groupedLogs[key].length || 1;

    averagesTotal.current += average.current;
    averagesTotal.voltage += average.voltage;
    averagesTotal.temperature += average.temperature;

    dictDevices[key].average = average;
  });

  averagesTotal.voltage /= Object.keys(groupedLogs).length;
  averagesTotal.temperature /= Object.keys(groupedLogs).length;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  await getWindowEnergy(startOfMonth, today, req.user.id);

  const devicesEnergy = await Promise.all(
    Object.values(dictDevices).map((device) => {
      return getWindowEnergy(startOfMonth, today, req.user.id);
    })
  );

  Object.keys(dictDevices).map((key, index) => {
    dictDevices[key].energy = devicesEnergy[index];
  });

  [logs] = await db.query(
    `SELECT * from log WHERE deviceId IN (${devices
      .map(() => "?")
      .join(",")}) AND time > ?`,
    [...devices.map((device) => device.macAddress), today.toISOString()]
  );

  averagesTotal.logs = logs;

  averagesTotal.energy = Object.values(dictDevices).reduce((prev, curr) => {
    return prev + curr.energy;
  }, 0);

  console.log("Dashboard response: ", {
    total: averagesTotal,
    devices: dictDevices,
  });

  res.json({ total: averagesTotal, devices: dictDevices });
}

async function getPrediction(req, res) {
  console.log("REQ>BODY: ", req.body);

  const prediction = await predict(
    new Date(req.body.startDate),
    new Date(req.body.endDate),
    req.user.id,
    req.target,
    getWindowEnergy
  );

  res.json({ prediction });
}

async function getWindowEnergy(startDate, endDate, userId, device) {
  let devices;
  if (!device) {
    [devices] = await db.query("SELECT * FROM device WHERE userId = ?", [
      userId,
    ]);
  } else {
    devices = [device];
  }
  const [rawData] = await db.query(
    `SELECT * FROM log WHERE time BETWEEN ? AND ? AND deviceId IN (${devices.map(
      () => "?"
    )})`,
    [
      startDate.toISOString(),
      endDate.toISOString(),
      ...devices.map((device) => device.macAddress),
    ]
  );

  const logs = {};
  rawData.forEach((element) => {
    if (!logs[element.deviceId]) logs[element.deviceId] = [];
    logs[element.deviceId].push(element);
  });

  const data = {};
  Object.keys(logs).map((deviceId) => {
    const deviceLogs = logs[deviceId];
    deviceLogs.forEach((log, index) => {
      if (index == deviceLogs.length - 1) return;
      const date = new Date(log.time);
      const array = [
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
      ];
      const key = JSON.stringify(array);

      let energy =
        (log.current *
          log.voltage *
          (new Date(deviceLogs[index + 1].time) - date)) /
        (1000 * 3600 * 1000 * 1000);
      if (energy < 0 || log.status == "Offline") energy = 0;

      if (!data[key]) data[JSON.stringify(key)] = 0;
      data[JSON.stringify(key)] += energy;
    });
  });

  let average = { hour: 0, day: 0, month: 0, year: 0 };
  average.hour =
    Object.values(data).reduce((prev, curr) => {
      if (!curr) return prev;
      return prev + curr;
    }, 0) / Object.values(data).length;
  average.day = average.hour * 24;
  average.month = average.hour * 24 * 30.5;
  average.year = average.hour * 24 * 365;

  return (
    ((new Date(endDate) - new Date(startDate)) * average.hour) / (1000 * 3600)
  );
}

module.exports = { getDashboardData, getWindowEnergy, getPrediction };
