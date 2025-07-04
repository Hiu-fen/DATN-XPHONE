import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Spin, DatePicker, Button, Select } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  RiseOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { getDashboardStats, getStatsByDateRange, getDailyRevenueInMonth, getTopSellingProducts, type DashboardStats as DashboardStatsType, type DateRangeStats, type DailyRevenueInMonth, type TopSellingProduct } from '../../../api/admin/statisticsApi';
import { Line, Bar, Pie } from '@ant-design/plots';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

const { RangePicker, WeekPicker } = DatePicker;
const { Option } = Select;

const now = dayjs();

const DashboardStats: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'range'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.month() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.year());
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(now);
  const [selectedDay, setSelectedDay] = useState<Dayjs>(now);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [topSort, setTopSort] = useState<'asc' | 'desc'>('desc');

  // Query thống kê dashboard
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch mỗi 30 giây
  });

  // Query thống kê theo khoảng thời gian
  const { data: rangeData, isLoading: rangeLoading, refetch: refetchRange } = useQuery({
    queryKey: ['range-stats', dateRange],
    queryFn: () => {
      if (!dateRange) return null;
      return getStatsByDateRange(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
    },
    enabled: !!dateRange && viewMode === 'range',
  });

  // Query doanh thu từng ngày trong tháng
  const { data: dailyRevenueMonth, isLoading: loadingDailyMonth } = useQuery({
    queryKey: ['daily-revenue-in-month', selectedMonth, selectedYear],
    queryFn: () => getDailyRevenueInMonth(selectedMonth, selectedYear),
  });

  const fetchTopProducts = React.useCallback((options: {sort: 'asc' | 'desc', day?: Dayjs}) => {
    setLoadingTop(true);
    getTopSellingProducts(options.sort, options.day ? options.day.startOf('day').format('YYYY-MM-DD') : undefined)
      .then(data => setTopProducts(data))
      .finally(() => setLoadingTop(false));
  }, []);

  React.useEffect(() => {
    fetchTopProducts({ sort: topSort, day: selectedDay });
  }, [fetchTopProducts, topSort, selectedDay]);

  // Format số tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Dữ liệu cho biểu đồ doanh thu theo tháng (đủ 12 tháng)
  const monthlyRevenueData = (dashboardData?.revenue.monthly || []).map(item => ({
    month: `Th${item._id.month}`,
    revenue: item.total,
  }));

  // Dữ liệu cho biểu đồ trạng thái đơn hàng
  const orderStatusData = dashboardData?.orders.byStatus.map(item => ({
    status: item._id,
    count: item.count,
  })) || [];

  // Dữ liệu cho biểu đồ doanh thu theo ngày (khi chọn khoảng thời gian)
  const dailyRevenueData = rangeData?.dailyStats.map(item => ({
    date: `${item._id.day}/${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  const handleViewModeChange = (mode: 'dashboard' | 'range') => {
    setViewMode(mode);
    if (mode === 'dashboard') {
      setDateRange(null);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">📊 Thống Kê Tổng Quan</h1>
        
        <div className="flex gap-4 mb-4">
          <Select 
            value={viewMode} 
            onChange={handleViewModeChange}
            style={{ width: 200 }}
          >
            <Option value="dashboard">Dashboard Tổng Quan</Option>
            <Option value="range">Thống Kê Theo Thời Gian</Option>
          </Select>

          {viewMode === 'range' && (
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          )}
        </div>
      </div>

      {viewMode === 'dashboard' && dashboardData && (
        <>
          {/* Thống kê chính */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Người Dùng"
                  value={dashboardData.users.total}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  +{dashboardData.users.newToday} hôm nay
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Đơn Hàng"
                  value={dashboardData.orders.total}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {dashboardData.orders.completed} đã hoàn thành
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh Thu Hôm Nay"
                  value={formatCurrency(dashboardData.revenue.today)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {formatCurrency(dashboardData.revenue.thisMonth)} tháng này
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Sản Phẩm"
                  value={dashboardData.products.total}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {dashboardData.products.outOfStock} hết hàng
                </div>
              </Card>
            </Col>
          </Row>

          {/* Thống kê chi tiết */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={8}>
              <Card title="Người Dùng Mới" className="h-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Hôm nay:</span>
                    <span className="font-semibold">{dashboardData.users.newToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuần này:</span>
                    <span className="font-semibold">{dashboardData.users.newThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tháng này:</span>
                    <span className="font-semibold">{dashboardData.users.newThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Năm nay:</span>
                    <span className="font-semibold">{dashboardData.users.newThisYear}</span>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card title="Doanh Thu" className="h-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Hôm nay:</span>
                    <span className="font-semibold">{formatCurrency(dashboardData.revenue.today)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tuần này:</span>
                    <span className="font-semibold">{formatCurrency(dashboardData.revenue.thisWeek)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tháng này:</span>
                    <span className="font-semibold">{formatCurrency(dashboardData.revenue.thisMonth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Năm nay:</span>
                    <span className="font-semibold">{formatCurrency(dashboardData.revenue.thisYear)}</span>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card title="Trạng Thái Đơn Hàng" className="h-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tổng cộng:</span>
                    <span className="font-semibold">{dashboardData.orders.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hoàn thành:</span>
                    <span className="font-semibold text-green-600">{dashboardData.orders.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đang xử lý:</span>
                    <span className="font-semibold text-blue-600">{dashboardData.orders.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đã hủy:</span>
                    <span className="font-semibold text-red-600">
                      {dashboardData.orders.byStatus.find(s => s._id === 'Đã huỷ')?.count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Top 4 sản phẩm bán chạy nhất */}
          <div className="my-8">
            <Card title="Top 4 Sản Phẩm Bán Chạy/Nhất Kém Nhất Theo Ngày" style={{ minHeight: 200 }}
              extra={
                <div className="flex gap-2">
                  <Select value={topSort} style={{ width: 150 }} onChange={v => setTopSort(v)}>
                    <Option value="desc">Top 4 Bán Chạy Nhất</Option>
                    <Option value="asc">Top 4 Bán Kém Nhất</Option>
                  </Select>
                  <DatePicker
                    value={selectedDay}
                    onChange={date => setSelectedDay(date || now)}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </div>
              }
            >
              {loadingTop ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : topProducts.length > 0 ? (
                <Row gutter={[16, 16]} justify="center">
                  {topProducts.map((prod, idx) => (
                    <Col xs={24} sm={12} lg={6} key={prod.productId}>
                      <Card hoverable bordered style={{ height: 180 }}>
                        <div className="flex flex-col items-center justify-center h-full">
                          <img src={prod.image} alt={prod.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                          <div className="font-semibold text-sm mb-1 text-center">{idx + 1}. {prod.name}</div>
                          <div className="text-gray-500 mb-1">Đã bán: <span className="font-bold text-blue-600">{prod.totalSold}</span></div>
                          <div className="text-red-500 font-semibold" style={{ fontSize: 14 }}>{formatCurrency(prod.price)}</div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="flex justify-center items-center h-32 text-gray-500">
                  Không có dữ liệu sản phẩm bán chạy
                </div>
              )}
            </Card>
          </div>

          {/* Biểu đồ doanh thu từng ngày trong tháng */}
          <div className="my-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-semibold">Biểu đồ doanh thu từng ngày trong tháng:</span>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 120 }}
              >
                {[...Array(12)].map((_, i) => (
                  <Option key={i + 1} value={i + 1}>Tháng {i + 1}</Option>
                ))}
              </Select>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100 }}
              >
                {[now.year() - 1, now.year(), now.year() + 1].map(y => (
                  <Option key={y} value={y}>{y}</Option>
                ))}
              </Select>
            </div>
            <Card style={{ height: 350 }}>
              {loadingDailyMonth ? (
                <div className="flex justify-center items-center h-full">
                  <Spin size="large" />
                </div>
              ) : dailyRevenueMonth ? (
                <Line
                  data={dailyRevenueMonth.daily.map(item => ({
                    day: item.day.toString(),
                    revenue: item.total,
                  }))}
                  xField="day"
                  yField="revenue"
                  height={280}
                  area={{ style: { fill: 'rgba(0, 123, 255, 0.15)' } }}
                  lineStyle={{ stroke: 'rgba(0, 123, 255, 0.5)', lineWidth: 3 }}
                  point={{ size: 4, shape: 'circle', style: { fill: 'rgba(0, 123, 255, 0.5)', stroke: 'rgba(0, 123, 255, 0.5)' } }}
                  smooth
                  label={false}
                />
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Không có dữ liệu doanh thu
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {viewMode === 'range' && (
        <div>
          {rangeLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : rangeData ? (
            <>
              {/* Thống kê tổng hợp */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Người Dùng Mới"
                      value={rangeData.summary.newUsers}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng Đơn Hàng"
                      value={rangeData.summary.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Đơn Hoàn Thành"
                      value={rangeData.summary.completedOrders}
                      prefix={<RiseOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng Doanh Thu"
                      value={formatCurrency(rangeData.summary.revenue)}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Biểu đồ doanh thu theo ngày */}
              <Card title="Doanh Thu Theo Ngày" style={{ height: 350 }}>
                {dailyRevenueData.length > 0 ? (
                  <Bar
                    data={dailyRevenueData}
                    xField="date"
                    yField="revenue"
                    height={280}
                    seriesField="revenue"
                    label={{
                      position: 'middle',
                      style: {
                        fill: '#FFFFFF',
                        opacity: 0.6,
                      },
                    }}
                    xAxis={{
                      label: {
                        autoRotate: true,
                        autoHide: true,
                        autoEllipsis: true,
                      },
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    Không có dữ liệu trong khoảng thời gian này
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Vui lòng chọn khoảng thời gian để xem thống kê
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardStats; 