import "dotenv/config";
import express from "express";
import type { Application } from "express";
import cors from "cors";
import storageRouter from "./controllers/storageController.js";
import { connectRedis } from "./redis/redisClient.js";

const app: Application = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use("/api", storageRouter);

const port = Number(process.env.PORT ?? 8080);

const startServer = async (): Promise<void> => {
  try {
    await connectRedis();
    app.listen(port, () => {
      console.log(`App started on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

void startServer();
