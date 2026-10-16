import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";

dotenv.config();

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters long.");
  process.exit(1);
}

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""));

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools such as curl/Postman; browser requests are restricted.
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => {
  res.json({ message: "CloudLogin API is running." });
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed." });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error." });
});

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CloudLogin API listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
