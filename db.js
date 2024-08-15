const mysql = require("mysql2/promise");

let connection;

async function init() {
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "admin",
      database: "iot",
      port: 3306,
    });

    const response = await connection.connect();
    console.log("Connected to the database as ID: ", response.threadId);
  } catch (err) {
    console.log("Error on db connection: ", err);
  }
}

const query = async (query, data) => {
  return await connection.execute(query, data);
};

module.exports = { init, query };
