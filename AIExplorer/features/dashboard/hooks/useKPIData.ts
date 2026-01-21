import { useEffect, useState } from 'react';

interface KPIData {
  totalUseCases: number;
  implemented: number;
  trending: number;
  completionRate: number;
  loading: boolean;
  error: string | null;
  recentSubmissions: Array<{
    ID: string;
    UseCase: string;
    AITheme: string;
    Status: string;
    Created: string;
  }>;
  timeline: Array<{
    date: string;
    idea: number;
    diagnose: number;
    design: number;
    implemented: number;
  }>;
}

export const useKPIData = () => {
  const [data, setData] = useState<KPIData>({
    totalUseCases: 0,
    implemented: 0,
    trending: 0,
    completionRate: 0,
    loading: true,
    error: null,
    recentSubmissions: [],
    timeline: [],
  });

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const response = await fetch('/api/kpi/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch KPI data');
        }
        const data = await response.json();

        setData({
          totalUseCases: data.kpis?.totalUseCases || 0,
          implemented: data.kpis?.implemented || 0,
          trending: data.kpis?.trending || 0,
          completionRate: data.kpis?.completionRate || 0,
          loading: false,
          error: null,
          recentSubmissions: data.recent_submissions || [],
          timeline: data.timeline || [],
        });
      } catch (err) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch KPI data',
        }));
      }
    };

    fetchKPIData();
  }, []);

  return data;
};
