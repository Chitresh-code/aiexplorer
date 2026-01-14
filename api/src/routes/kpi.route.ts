import { Router } from "express";
import { getKPIs } from "../controllers/kpi.controller";
import { getDashboard } from "../controllers/dashboard.controller";

const router = Router();

router.get("/", getKPIs);
router.get("/dashboard", getDashboard);

export default router;
