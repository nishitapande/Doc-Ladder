require("./config/nodePolyfill");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const prisma = require("./config/prisma");
const storageService = require("./services/storageService");
const corsMiddleware = require("./middlewares/corsMiddleware");

const departmentRoutes = require("./routes/departmentRoutes");
const digitalSignatureRoutes = require("./routes/digitalSignatureRoutes");
const userRoutes = require("./routes/userRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const fileRoutes = require("./routes/fileRoutes");
const securityRoutes = require("./routes/securityRoute.js");

// Body parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// CORS configuration
app.use(corsMiddleware);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      database: "connected",
      storage: storageService.isR2Active() ? "r2" : "local",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// Download stream route for local disk storage mode
app.get("/v1/api/files/download/*", async (req, res) => {
  try {
    const rawKey = req.params[0] || req.params.key;
    const storageKey = decodeURIComponent(rawKey);
    const filename = req.query.filename || "document.pdf";

    const buffer = await storageService.getFileBuffer(storageKey);
    const mimeType = storageKey.endsWith(".pdf")
      ? "application/pdf"
      : storageKey.endsWith(".png")
      ? "image/png"
      : "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Download stream error:", err.message);
    return res.status(404).json({ error: "File not found or inaccessible" });
  }
});

// Mount API routes
app.use("/v1/api/departments", departmentRoutes);
app.use("/v1/api/digitalsignatures", digitalSignatureRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/vouchers", voucherRoutes);
app.use("/v1/api/files", fileRoutes);
app.use("/v1/api/security", securityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
    message: err.message || "Internal Server Error",
  });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  const isR2 = storageService.isR2Active();
  console.log("==================================================");
  console.log("  🚀 Doc-Ladder API Server Running");
  console.log(`  📍 Port        : ${port}`);
  console.log(`  🌐 Environment : ${(process.env.NODE_ENV || "development").toUpperCase()}`);
  console.log(`  💾 Storage Mode: ${isR2 ? "CLOUDFLARE R2" : "LOCAL DISK (/server/uploads)"}`);
  console.log("  🗄️  Database    : PostgreSQL via Prisma");
  console.log("==================================================");
});
