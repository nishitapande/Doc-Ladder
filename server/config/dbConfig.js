const sql = require("mssql");

const sqlConfig = {
  user: process.env.Uid,
  password: process.env.pwd,
  server: process.env.Server,
  port: 1433,
  database: process.env.Database,
  authentication: {
    type: "default",
  },
  options: {
    encrypt: true,
  },
};

const connectDatabase = async () => {
  try {
    // Establish a new connection
    await sql.connect(sqlConfig);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
};

module.exports = { sql, connectDatabase };
