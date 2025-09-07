import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morganMiddleware from "./logger/morgan.logger.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const httpServer = createServer(app);

// Global Middlewares (for all routes)
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" })); // Body parser limit 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morganMiddleware);

// Routes
app.get("/", (_req, res) => {
  res.send("Hello World");
});

// API Routes
app.use("/api/users", userRoutes);

export { httpServer };
