import { Router } from "express";
import {
  getStatusChart,
  getPhaseChart,
  getBusinessUnitChart,
  getAIThemeChart,
  getVendorChart,
  getTimelineChart,
} from "../controllers/chart.controller";

const router = Router();

router.get("/status", getStatusChart);
router.get("/phase", getPhaseChart);
router.get("/business-unit", getBusinessUnitChart);
router.get("/ai-theme", getAIThemeChart);
router.get("/vendor", getVendorChart);
router.get("/timeline", getTimelineChart);

export default router;

