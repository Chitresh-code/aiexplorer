import { NextResponse } from "next/server";

const dashboardPayload = {
  kpis: {
    totalUseCases: 124,
    implemented: 18,
    trending: 7,
    completionRate: 72,
  },
  recent_submissions: [
    {
      ID: "101",
      UseCase: "Autotranslation using AWS translation",
      AITheme: "Audio Generation",
      Status: "Submitted",
      Created: "2024-09-01",
    },
    {
      ID: "102",
      UseCase: "Ready Implementation - Check History Chatbot",
      AITheme: "Conversational AI",
      Status: "Draft",
      Created: "2024-09-03",
    },
    {
      ID: "103",
      UseCase: "SharePoint Assistant for IT Helpdesk",
      AITheme: "Intelligent Document Processing",
      Status: "Approved",
      Created: "2024-09-05",
    },
  ],
  timeline: [
    { date: "2024-08-01", idea: 4, diagnose: 2, design: 1, implemented: 0 },
    { date: "2024-08-08", idea: 5, diagnose: 3, design: 2, implemented: 1 },
    { date: "2024-08-15", idea: 6, diagnose: 4, design: 3, implemented: 1 },
    { date: "2024-08-22", idea: 7, diagnose: 4, design: 3, implemented: 2 },
    { date: "2024-08-29", idea: 8, diagnose: 5, design: 4, implemented: 2 },
  ],
};

export const GET = async () => NextResponse.json(dashboardPayload);
