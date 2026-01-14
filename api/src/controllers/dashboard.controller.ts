import { Request, Response } from "express";
import dataService from "../services/data.service";

export const getDashboard = (req: Request, res: Response) => {
  try {
    const allUseCases = dataService.getAllUseCases();

    // Compute KPIs
    const totalUseCases = allUseCases.length;
    const implemented = allUseCases.filter(uc => uc.Status === "Implemented").length;
    const completionRate = totalUseCases > 0 ? Math.round((implemented / totalUseCases) * 100 * 100) / 100 : 0; // Round to 2 decimal places

    // Compute timeline data
    const timelineMap = new Map<string, { idea: number; diagnose: number; design: number; implemented: number }>();

    allUseCases.forEach(uc => {
      if (uc.Created) {
        try {
          const date = new Date(uc.Created);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const phase = uc.Phase?.toLowerCase() || "";

          if (!timelineMap.has(month)) {
            timelineMap.set(month, { idea: 0, diagnose: 0, design: 0, implemented: 0 });
          }

          const monthData = timelineMap.get(month)!;
          if (phase === "idea") monthData.idea++;
          else if (phase === "diagnose") monthData.diagnose++;
          else if (phase === "design") monthData.design++;
          else if (phase === "implemented") monthData.implemented++;
        } catch (error) {
          // Skip invalid dates
        }
      }
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([month, counts]) => ({ month, ...counts }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Compute trending (percentage change in implemented use cases)
    // Calculate based on last two months with data
    let trending = 0;
    if (timeline.length >= 2) {
      const sortedTimeline = [...timeline].sort((a, b) => b.month.localeCompare(a.month));
      const currentMonth = sortedTimeline[0]!;
      const previousMonth = sortedTimeline[1]!;
      const currentImplemented = currentMonth.implemented;
      const previousImplemented = previousMonth.implemented;
      if (previousImplemented > 0) {
        trending = Math.round(((currentImplemented - previousImplemented) / previousImplemented) * 100 * 100) / 100;
      }
    }

    // Get recent submissions (last 10, sorted by Created descending)
    const recentSubmissions = allUseCases
      .filter(uc => uc.Created)
      .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
      .slice(0, 10)
      .map(uc => ({
        ID: uc.ID,
        UseCase: uc.UseCase,
        AITheme: uc.AITheme,
        Status: uc.Status,
        Created: uc.Created
      }));

    const dashboardData = {
      kpis: {
        totalUseCases,
        implemented,
        trending,
        completionRate
      },
      timeline,
      recent_submissions: recentSubmissions
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
