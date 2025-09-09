import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { config } from "./config/app.config";
import { requestLogger } from "./middleware/security.middleware";
import ussdRoutes from "./routes/ussd.routes";
import paymentRoutes from "./routes/payment.routes";
import { BackgroundJobService } from "./services/backgroundJob.service";
import { logger } from "./utils/logger";

dotenv.config();

export const app = express();


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);


app.use('/api/ussd', ussdRoutes);
app.use('/api/payments', paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VoteMaster API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      graphql: "/graphql",
      ussd: "/api/ussd",
      payments: "/api/payments"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    backgroundJobs: BackgroundJobService.getHealthStatus()
  });
});


BackgroundJobService.start();


process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  BackgroundJobService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  BackgroundJobService.stop();
  process.exit(0);
});

