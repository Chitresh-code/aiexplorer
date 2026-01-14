import express, { Application } from "express";
import cors from "cors";

import healthRoutes from "./routes/health.route";
import kpiRoutes from "./routes/kpi.route";
import chartRoutes from "./routes/chart.route";
import useCaseRoutes from "./routes/usecase.route";
import mappingRoutes from "./routes/mapping.route";
import { authenticateToken } from "./middleware/auth.middleware";

const app: Application = express();

// CORS configuration to allow credentials and frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check doesn't require authentication
app.use("/health", healthRoutes);

// All API routes require authentication
app.use("/api/kpis", authenticateToken, kpiRoutes);
app.use("/api/charts", authenticateToken, chartRoutes);
app.use("/api/usecases", authenticateToken, useCaseRoutes);
app.use("/api/mappings", authenticateToken, mappingRoutes);

export default app;
