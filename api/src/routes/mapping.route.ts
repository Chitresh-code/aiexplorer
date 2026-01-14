import { Router } from "express";
import {
  getBusinessUnitMapping,
  getPersonaMapping,
  getAIThemeMapping,
  getVendors,
} from "../controllers/mapping.controller";

const router = Router();

router.get("/business-unit", getBusinessUnitMapping);
router.get("/persona", getPersonaMapping);
router.get("/ai-theme", getAIThemeMapping);
router.get("/vendors", getVendors);

export default router;

