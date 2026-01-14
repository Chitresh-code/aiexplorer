import { Request, Response } from "express";
import dataService from "../services/data.service";

export const getUseCases = (req: Request, res: Response) => {
  try {
    const {
      status,
      phase,
      businessUnit,
      priority,
      search,
      page = "1",
      limit = "10",
    } = req.query;

    const filters: {
      status?: string;
      phase?: string;
      businessUnit?: string;
      priority?: string;
      search?: string;
      page: number;
      limit: number;
    } = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    if (status && typeof status === "string") {
      filters.status = status;
    }
    if (phase && typeof phase === "string") {
      filters.phase = phase;
    }
    if (businessUnit && typeof businessUnit === "string") {
      filters.businessUnit = businessUnit;
    }
    if (priority && typeof priority === "string") {
      filters.priority = priority;
    }
    if (search && typeof search === "string") {
      filters.search = search;
    }

    const result = dataService.getFilteredUseCases(filters);

    // Return only required fields for gallery/list view
    const simplifiedData = result.data.map((uc) => ({
      ID: uc.ID,
      UseCase: uc.UseCase,
      Headlines: uc.Headlines,
      Phase: uc.Phase,
      Status: uc.Status,
      BusinessUnit: uc.BusinessUnit,
      TargetPersonas: uc.TargetPersonas,
      AITheme: uc.AITheme,
      VendorName: uc.VendorName,
      ModelName: uc.ModelName,
    }));

    res.status(200).json({
      ...result,
      data: simplifiedData,
    });
  } catch (error) {
    console.error("Error fetching use cases:", error);
    res.status(500).json({ error: "Failed to fetch use cases" });
  }
};

export const getUseCaseById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid use case ID" });
    }
    const useCase = dataService.getUseCaseById(id);

    if (!useCase) {
      return res.status(404).json({ error: "Use case not found" });
    }

    res.status(200).json(useCase);
  } catch (error) {
    console.error("Error fetching use case:", error);
    res.status(500).json({ error: "Failed to fetch use case" });
  }
};

export const getUseCaseStats = (req: Request, res: Response) => {
  try {
    const allUseCases = dataService.getAllUseCases();
    const statusDistribution = dataService.getStatusDistribution();
    const phaseDistribution = dataService.getPhaseDistribution();
    const businessUnitDistribution = dataService.getBusinessUnitDistribution();

    const stats = {
      total: allUseCases.length,
      statusDistribution,
      phaseDistribution,
      businessUnitDistribution,
      uniqueBusinessUnits: Object.keys(businessUnitDistribution).length,
      uniquePhases: Object.keys(phaseDistribution).length,
      uniqueStatuses: Object.keys(statusDistribution).length,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching use case stats:", error);
    res.status(500).json({ error: "Failed to fetch use case stats" });
  }
};

export const getMyUseCases = (req: Request, res: Response) => {
  try {
    // Get user's name from the authenticated request
    const userName = req.user?.name;
    
    if (!userName) {
      return res.status(400).json({ error: "User name not found in token" });
    }

    const {
      status,
      phase,
      businessUnit,
      priority,
      search,
      page = "1",
      limit = "10",
    } = req.query;

    const filters: {
      status?: string;
      phase?: string;
      businessUnit?: string;
      priority?: string;
      search?: string;
      page: number;
      limit: number;
    } = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    if (status && typeof status === "string") {
      filters.status = status;
    }
    if (phase && typeof phase === "string") {
      filters.phase = phase;
    }
    if (businessUnit && typeof businessUnit === "string") {
      filters.businessUnit = businessUnit;
    }
    if (priority && typeof priority === "string") {
      filters.priority = priority;
    }
    if (search && typeof search === "string") {
      filters.search = search;
    }

    const result = dataService.getMyUseCases(userName, filters);

    // Return only required fields for gallery/list view
    const simplifiedData = result.data.map((uc) => ({
      ID: uc.ID,
      UseCase: uc.UseCase,
      Headlines: uc.Headlines,
      Phase: uc.Phase,
      Status: uc.Status,
      BusinessUnit: uc.BusinessUnit,
      TargetPersonas: uc.TargetPersonas,
      AITheme: uc.AITheme,
      VendorName: uc.VendorName,
      ModelName: uc.ModelName,
    }));

    res.status(200).json({
      ...result,
      data: simplifiedData,
    });
  } catch (error) {
    console.error("Error fetching my use cases:", error);
    res.status(500).json({ error: "Failed to fetch my use cases" });
  }
};

export const createUseCase = (req: Request, res: Response) => {
  try {
    // Get user's name from the authenticated request
    const createdBy = req.user?.name || req.user?.email || "Unknown";

    // Validate required fields
    if (!req.body.UseCase) {
      return res.status(400).json({ error: "UseCase is required" });
    }

    // Create the use case
    const newUseCase = dataService.createUseCase(req.body, createdBy);

    res.status(201).json(newUseCase);
  } catch (error) {
    console.error("Error creating use case:", error);
    res.status(500).json({ error: "Failed to create use case" });
  }
};

export const updateUseCase = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid use case ID" });
    }

    // Get user's name from the authenticated request
    const modifiedBy = req.user?.name || req.user?.email || "Unknown";

    // Update the use case
    const updatedUseCase = dataService.updateUseCase(id, req.body, modifiedBy);

    if (!updatedUseCase) {
      return res.status(404).json({ error: "Use case not found" });
    }

    res.status(200).json(updatedUseCase);
  } catch (error) {
    console.error("Error updating use case:", error);
    res.status(500).json({ error: "Failed to update use case" });
  }
};

export const deleteUseCase = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid use case ID" });
    }

    // Delete the use case
    const deleted = dataService.deleteUseCase(id);

    if (!deleted) {
      return res.status(404).json({ error: "Use case not found" });
    }

    res.status(200).json({ message: "Use case deleted successfully" });
  } catch (error) {
    console.error("Error deleting use case:", error);
    res.status(500).json({ error: "Failed to delete use case" });
  }
};

