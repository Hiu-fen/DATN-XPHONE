import axios from 'axios';

const API_URL = 'http://localhost:5000/api/statistics';

export interface DashboardStats {
  users: {
    total: number;
    totalAdmins: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    newThisYear: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    byStatus: Array<{ _id: string; count: number }>;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    monthly: Array<{ _id: { year: number; month: number }; total: number }>;
  };
  products: {
    total: number;
    outOfStock: number;
  };
}

export interface DailyStats {
  date: string;
  newUsers: number;
  orders: number;
  revenue: number;
}

export interface DateRangeStats {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    newUsers: number;
    totalOrders: number;
    completedOrders: number;
    revenue: number;
  };
  dailyStats: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    revenue: number;
    orders: number;
  }>;
}

export interface DailyRevenueInMonth {
  month: number;
  year: number;
  daily: Array<{ day: number; total: number }>;
}

export interface TopSellingProduct {
  productId: string;
  totalSold: number;
  name: string;
  image: string;
  price: number;
}

// Lấy thống kê tổng quan dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};

// Lấy thống kê theo ngày
export const getDailyStats = async (date?: string): Promise<DailyStats> => {
  const params = date ? { date } : {};
  const response = await axios.get(`${API_URL}/daily`, { params });
  return response.data;
};

// Lấy thống kê theo khoảng thời gian
export const getStatsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<DateRangeStats> => {
  const response = await axios.get(`${API_URL}/range`, {
    params: { startDate, endDate }
  });
  return response.data;
};

export const getDailyRevenueInMonth = async (month: number, year: number): Promise<DailyRevenueInMonth> => {
  const response = await axios.get(`${API_URL}/daily-in-month`, {
    params: { month, year }
  });
  return response.data;
};

export const getTopSellingProducts = async (sort: 'asc' | 'desc' = 'desc', weekStart?: string): Promise<TopSellingProduct[]> => {
  const params: any = { sort };
  if (weekStart) params.weekStart = weekStart;
  const response = await axios.get(`${API_URL}/top-selling-products`, { params });
  return response.data;
}; 