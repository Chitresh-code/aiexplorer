import { Router } from "express";
import {
  getUseCases,
  getUseCaseById,
  getUseCaseStats,
  getMyUseCases,
  createUseCase,
  updateUseCase,
  deleteUseCase,
} from "../controllers/usecase.controller";

const router = Router();

router.get("/", getUseCases);
router.get("/my", getMyUseCases);
router.get("/stats", getUseCaseStats);
router.post("/", createUseCase);
router.put("/:id", updateUseCase);
router.delete("/:id", deleteUseCase);
router.get("/:id", getUseCaseById);

export default router;

