import { Request, Response } from "express";
import dataService from "../services/data.service";

export const getStatusChart = (req: Request, res: Response) => {
  try {
    const distribution = dataService.getStatusDistribution();
    const chartData = Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching status chart:", error);
    res.status(500).json({ error: "Failed to fetch status chart data" });
  }
};

export const getPhaseChart = (req: Request, res: Response) => {
  try {
    const distribution = dataService.getPhaseDistribution();
    const chartData = Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching phase chart:", error);
    res.status(500).json({ error: "Failed to fetch phase chart data" });
  }
};

export const getBusinessUnitChart = (req: Request, res: Response) => {
  try {
    const distribution = dataService.getBusinessUnitDistribution();
    const chartData = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value,
      }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching business unit chart:", error);
    res.status(500).json({ error: "Failed to fetch business unit chart data" });
  }
};

export const getAIThemeChart = (req: Request, res: Response) => {
  try {
    const distribution = dataService.getAIThemeDistribution();
    const chartData = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value,
      }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching AI theme chart:", error);
    res.status(500).json({ error: "Failed to fetch AI theme chart data" });
  }
};

export const getVendorChart = (req: Request, res: Response) => {
  try {
    const distribution = dataService.getVendorDistribution();
    const chartData = Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value,
      }));

    res.status(200).json(chartData);
  } catch (error) {
    console.error("Error fetching vendor chart:", error);
    res.status(500).json({ error: "Failed to fetch vendor chart data" });
  }
};

export const getTimelineChart = (req: Request, res: Response) => {
  try {
    const timelineData = dataService.getTimelineData();
    res.status(200).json(timelineData);
  } catch (error) {
    console.error("Error fetching timeline chart:", error);
    res.status(500).json({ error: "Failed to fetch timeline chart data" });
  }
};

