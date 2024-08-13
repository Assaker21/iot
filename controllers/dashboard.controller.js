const db = require("../db");

async function getDashboardData(req, res) {
  const [devices] = await db.query("SELECT * FROM device WHERE userId = ?", [
    req.user?.id || 1,
  ]);

  const [logs] = await db.query(
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

    groupedLogs[log.deviceId].push(log);
  });

  const averagesTotal = { current: 0, voltage: 0, temperature: 0 };
  Object.keys(groupedLogs).forEach((key) => {
    const average = {
      current: 0,
      voltage: 0,
      temperature: 0,
    };

    groupedLogs[key].forEach((log) => {
      average.current += log.current;
      average.voltage += log.voltage;
      average.temperature += log.temperature;
    });

    average.current /= groupedLogs[key].length;
    average.voltage /= groupedLogs[key].length;
    average.temperature /= groupedLogs[key].length;

    averagesTotal.current += average.current;
    averagesTotal.voltage += average.voltage;
    averagesTotal.temperature += average.temperature;

    dictDevices[key].average = average;
  });

  averagesTotal.voltage /= Object.keys(groupedLogs).length;
  averagesTotal.temperature /= Object.keys(groupedLogs).length;

  res.json({ total: averagesTotal, devices: dictDevices });
}

module.exports = { getDashboardData };
