import { Request, Response } from "express";
import dataService from "../services/data.service";

export const getKPIs = (req: Request, res: Response) => {
  try {
    const allUseCases = dataService.getAllUseCases();
    const statusDistribution = dataService.getStatusDistribution();
    const phaseDistribution = dataService.getPhaseDistribution();
    const businessUnitDistribution = dataService.getBusinessUnitDistribution();
    const priorityDistribution = dataService.getPriorityDistribution();
    const statusMapping = dataService.getStatusMapping();
    const phaseMapping = dataService.getPhaseMapping();

    // Build byStatus from StatusMapping (all statuses from mapping file)
    // If mapping is empty, use all statuses from distribution
    const byStatus: Record<string, number> = {};
    if (statusMapping.length > 0) {
      statusMapping.forEach((status) => {
        const statusName = status["Status Name"]?.trim() || "";
        if (statusName) {
          byStatus[statusName] = statusDistribution[statusName] || 0;
        }
      });
    } else {
      // Fallback: use all statuses from distribution
      Object.assign(byStatus, statusDistribution);
    }

    // Build byPhase from PhaseMapping (all phases from mapping file)
    // If mapping is empty, use all phases from distribution
    const byPhase: Record<string, number> = {};
    if (phaseMapping.length > 0) {
      phaseMapping.forEach((phase) => {
        const phaseName = phase.Phase?.trim() || "";
        if (phaseName) {
          byPhase[phaseName] = phaseDistribution[phaseName] || 0;
        }
      });
    } else {
      // Fallback: use all phases from distribution
      Object.assign(byPhase, phaseDistribution);
    }

    // Build byPriority - "Not a Priority" and all FY/Quarter values
    const byPriority: Record<string, number> = {};
    const fyQuarterPattern = /^FY\d{2}Q[1-4]$/i;
    
    // Add "Not a Priority" first
    byPriority["Not a Priority"] = priorityDistribution["Not a Priority"] || 0;
    
    // Add all FY/Quarter priorities sorted
    Object.entries(priorityDistribution)
      .filter(([key]) => key !== "Not a Priority" && fyQuarterPattern.test(key))
      .sort(([a], [b]) => {
        // Sort FY/Quarter: extract year and quarter for comparison
        const matchA = a.match(/^FY(\d{2})Q([1-4])$/i);
        const matchB = b.match(/^FY(\d{2})Q([1-4])$/i);
        if (matchA && matchB && matchA[1] && matchA[2] && matchB[1] && matchB[2]) {
          const yearA = parseInt(matchA[1], 10);
          const quarterA = parseInt(matchA[2], 10);
          const yearB = parseInt(matchB[1], 10);
          const quarterB = parseInt(matchB[2], 10);
          if (yearA !== yearB) return yearA - yearB;
          return quarterA - quarterB;
        }
        return a.localeCompare(b);
      })
      .forEach(([key, value]) => {
        byPriority[key] = value;
      });

    const kpis = {
      totalUseCases: allUseCases.length,
      byStatus,
      byPhase,
      byBusinessUnit: Object.entries(businessUnitDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, number>),
      byPriority,
      activeUseCases:
        (statusDistribution["On-Track"] || 0) +
        (statusDistribution["At Risk"] || 0),
    };

    res.status(200).json(kpis);
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ error: "Failed to fetch KPIs" });
  }
};

