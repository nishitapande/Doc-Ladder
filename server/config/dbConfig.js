const prisma = require("./prisma");

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL database connected successfully via Prisma");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};

module.exports = { prisma, connectDatabase };
