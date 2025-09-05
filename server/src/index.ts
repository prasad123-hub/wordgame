import dotenv from "dotenv";
import { httpServer } from "./app.js";
import connectDB from "./db/index.js";
import logger from "./logger/winston.logger.js";

dotenv.config({
  path: "./.env",
});

const startServer = () => {
  const port = process.env.PORT || 8080;

  httpServer.listen(port, () => {
    logger.info(`⚙️  Server is running on port: ${port}`);
  });

  // Handle server errors gracefully
  httpServer.on("error", (error: Error & { code?: string }) => {
    if (error.code === "EADDRINUSE") {
      logger.error(
        `❌ Port ${port} is already in use. Please try a different port.`,
      );
      logger.info(
        `💡 You can set a different port using: PORT=3000 npm run dev`,
      );
      process.exit(1);
    } else {
      logger.error("❌ Server error:", error);
      process.exit(1);
    }
  });
};

try {
  await connectDB();
  startServer();
} catch (err) {
  logger.error("Mongo db connect error: ", err);
}
