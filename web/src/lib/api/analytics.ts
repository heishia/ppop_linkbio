import { apiClient } from "./client";

// Types
export interface LinkClickStats {
  link_id: string;
  title: string;
  url: string;
  click_count: number;
  today_clicks: number;
  week_clicks: number;
  month_clicks: number;
}

export interface DailyClickData {
  date: string;
  clicks: number;
}

export interface OverviewStats {
  total_clicks: number;
  total_links: number;
  today_clicks: number;
  week_clicks: number;
  month_clicks: number;
}

export interface AnalyticsSummary {
  overview: OverviewStats;
  link_stats: LinkClickStats[];
  daily_clicks: DailyClickData[];
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsSummary;
}

// API Functions
export const analyticsApi = {
  // Get analytics summary
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get<AnalyticsResponse>("/api/analytics");
    return response.data.data;
  },
};

export default analyticsApi;

