const { getWindowEnergy } = require("../controllers/main.controller.js");

async function predict(
  startDate,
  endDate,
  userId,
  target = "month",
  getWindowEnergy
) {
  const baseValue = await getWindowEnergy(startDate, endDate, userId);
  let currentValue, progression;
  if (target == "month") {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    progression =
      (today - startOfMonth) /
      (1000 *
        3600 *
        24 *
        new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate());

    currentValue = await getWindowEnergy(startOfMonth, today, userId);
  } else if (target == "year") {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    progression = (today - startOfYear) / (1000 * 3600 * 24 * 365);

    currentValue = await getWindowEnergy(startOfYear, today, userId);
  } else if (target == "day") {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    progression = (today - startOfToday) / (1000 * 3600 * 24);

    currentValue = await getWindowEnergy(startOfToday, new Date(), userId);
  }

  return currentValue + (1 - progression) * baseValue;
}

module.exports = { predict };
