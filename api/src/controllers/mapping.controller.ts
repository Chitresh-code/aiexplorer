import { Request, Response } from "express";
import dataService from "../services/data.service";

export const getBusinessUnitMapping = (req: Request, res: Response) => {
  try {
    const mapping = dataService.getBusinessUnitsWithTeams();
    res.status(200).json(mapping);
  } catch (error) {
    console.error("Error fetching business unit mapping:", error);
    res.status(500).json({ error: "Failed to fetch business unit mapping" });
  }
};

export const getPersonaMapping = (req: Request, res: Response) => {
  try {
    const mapping = dataService.getPersonaMapping();
    res.status(200).json(mapping);
  } catch (error) {
    console.error("Error fetching persona mapping:", error);
    res.status(500).json({ error: "Failed to fetch persona mapping" });
  }
};

export const getAIThemeMapping = (req: Request, res: Response) => {
  try {
    const mapping = dataService.getAIThemeMapping();
    res.status(200).json(mapping);
  } catch (error) {
    console.error("Error fetching AI theme mapping:", error);
    res.status(500).json({ error: "Failed to fetch AI theme mapping" });
  }
};

export const getVendors = (req: Request, res: Response) => {
  try {
    const vendors = dataService.getVendorsWithModels();
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

