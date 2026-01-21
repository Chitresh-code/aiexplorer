import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

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
        // Call the KPI dashboard endpoint
        const response = await apiClient.get('/api/kpi/dashboard');

        setData({
          totalUseCases: response.data.kpis?.totalUseCases || 0,
          implemented: response.data.kpis?.implemented || 0,
          trending: response.data.kpis?.trending || 0,
          completionRate: response.data.kpis?.completionRate || 0,
          loading: false,
          error: null,
          recentSubmissions: response.data.recent_submissions || [],
          timeline: response.data.timeline || [],
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
