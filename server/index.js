require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDatabase } = require("./config/dbConfig");
const corsMiddleware = require("./middlewares/corsMiddleware");
const departmentRoutes = require("./routes/departmentRoutes");
const digitalSignatureRoutes = require("./routes/digitalSignatureRoutes");
const userRoutes = require("./routes/userRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const fileRoutes = require("./routes/fileRoutes");
const securityRoutes = require("./routes/securityRoute.js");

// Connect to the database
connectDatabase();

// console.log("error 1");
app.use(express.json());
// console.log("error 2");

app.use(cookieParser());
// console.log("error 3");

app.use(corsMiddleware);
//console.log("error 4");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);
// console.log("error 5");

app.use("/v1/api/departments", departmentRoutes);
app.use("/v1/api/digitalsignatures", digitalSignatureRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/vouchers", voucherRoutes);
app.use("/v1/api/files", fileRoutes);
app.use("/v1/api/security", securityRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
