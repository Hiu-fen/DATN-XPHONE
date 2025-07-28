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

  const fetchTopProducts = React.useCallback((options: {sort: 'asc' | 'desc', startDate?: string, endDate?: string}) => {
    setLoadingTop(true);
    // Sử dụng ngày bắt đầu của khoảng thời gian để lấy top products
    getTopSellingProducts(options.sort, options.startDate)
      .then(data => setTopProducts(data))
      .finally(() => setLoadingTop(false));
  }, []);

  React.useEffect(() => {
    if (dateRange && viewMode === 'range') {
      fetchTopProducts({ 
        sort: topSort, 
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
    } else {
      // Nếu ở chế độ dashboard, sử dụng ngày được chọn
      fetchTopProducts({ 
        sort: topSort, 
        startDate: selectedDay.format('YYYY-MM-DD')
      });
    }
  }, [fetchTopProducts, topSort, selectedDay, dateRange, viewMode]);

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
  let dailyRevenueData: { date: string, revenue: number, orders: number }[] = [];
  if (dateRange && rangeData?.dailyStats) {
    // Map đủ các ngày trong khoảng
    const start = dateRange[0].startOf('day');
    const end = dateRange[1].startOf('day');
    const days: string[] = [];
    let d = start.clone();
    while (d.isBefore(end.add(1, 'day'))) {
      days.push(d.format('D/M/YYYY'));
      d = d.add(1, 'day');
    }
    const statsMap = new Map(
      rangeData.dailyStats.map(item => [
        `${item._id.day}/${item._id.month}/${item._id.year}`,
        { revenue: item.revenue, orders: item.orders }
      ])
    );
    dailyRevenueData = days.map(dateStr => {
      const stat = statsMap.get(dateStr);
      return {
        date: dateStr,
        revenue: stat ? stat.revenue : 0,
        orders: stat ? stat.orders : 0
      };
    });
  } else if (rangeData?.dailyStats) {
    dailyRevenueData = rangeData.dailyStats.map(item => ({
      date: `${item._id.day}/${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }

  // Trước khi render Line chart doanh thu theo ngày (range)
  console.log('dailyRevenueData', dailyRevenueData);
  const chartData = dailyRevenueData.map(item => ({
    day: item.date,
    revenue: Number(item.revenue) || 0,
  }));
  const hasRevenue = chartData.some(item => item.revenue > 0);

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
                <div className="flex justify-center items-center h-32 text-gray-500 font-bold text-xl">
                  Hôm nay ế 😢
                </div>
              )}
            </Card>
          </div>
{/* Biểu đồ doanh thu từng ngày trong tháng */}
<div className="my-8">
  <div className="flex items-center gap-4 mb-2">
    <span className="font-semibold">Biểu đồ doanh thu từng ngày trong tháng:</span>

    <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 120 }}>
      {[...Array(12)].map((_, i) => (
        <Option key={i + 1} value={i + 1}>
          Tháng {i + 1}
        </Option>
      ))}
    </Select>

    <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }}>
      {[now.year() - 1, now.year(), now.year() + 1].map((y) => (
        <Option key={y} value={y}>
          {y}
        </Option>
      ))}
    </Select>
  </div>

  <Card style={{ height: 350 }}>
    {loadingDailyMonth ? (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    ) : Array.isArray(dailyRevenueMonth?.daily) && dailyRevenueMonth.daily.length > 0 ? (
      <Line
        data={dailyRevenueMonth.daily.map((item) => ({
          day: String(item?.day ?? ""),
          revenue: item?.total ?? 0,
        }))}
        xField="day"
        yField="revenue"
        height={280}
        smooth
        area={{ style: { fill: "rgba(0, 123, 255, 0.15)" } }}
        lineStyle={{ stroke: "rgba(0, 123, 255, 0.5)", lineWidth: 3 }}
        point={{
          size: 4,
          shape: "circle",
          style: {
            fill: "rgba(0, 123, 255, 0.5)",
            stroke: "rgba(0, 123, 255, 0.5)",
          },
        }}
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
              {/* Thống kê chính */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Người Dùng Mới"
                      value={rangeData.summary.newUsers}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      Từ {dateRange?.[0].format('DD/MM/YYYY')} - {dateRange?.[1].format('DD/MM/YYYY')}
                    </div>
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
                    <div className="text-sm text-gray-500 mt-2">
                      {rangeData.summary.completedOrders} đã hoàn thành
                    </div>
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
                    <div className="text-sm text-gray-500 mt-2">
                      Trung bình: {rangeData.dailyStats.length > 0 
                        ? formatCurrency(rangeData.summary.revenue / rangeData.dailyStats.length)
                        : formatCurrency(0)
                      }
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tỷ Lệ Hoàn Thành"
                      value={rangeData.summary.totalOrders > 0 
                        ? ((rangeData.summary.completedOrders / rangeData.summary.totalOrders) * 100).toFixed(1)
                        : '0.0'
                      }
                      prefix={<RiseOutlined />}
                      suffix="%"
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      {rangeData.summary.completedOrders}/{rangeData.summary.totalOrders} đơn hàng
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Thống kê chi tiết */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={8}>
                  <Card title="Thống Kê Đơn Hàng" className="h-64">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tổng đơn hàng:</span>
                        <span className="font-semibold">{rangeData.summary.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hoàn thành:</span>
                        <span className="font-semibold text-green-600">{rangeData.summary.completedOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đang xử lý:</span>
                        <span className="font-semibold text-blue-600">{rangeData.summary.totalOrders - rangeData.summary.completedOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tỷ lệ hoàn thành:</span>
                        <span className="font-semibold text-green-600">
                          {rangeData.summary.totalOrders > 0 
                            ? ((rangeData.summary.completedOrders / rangeData.summary.totalOrders) * 100).toFixed(1)
                            : '0.0'
                          }%
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Card title="Thống Kê Doanh Thu" className="h-64">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tổng doanh thu:</span>
                        <span className="font-semibold">{formatCurrency(rangeData.summary.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trung bình/ngày:</span>
                        <span className="font-semibold">
                          {rangeData.dailyStats.length > 0 
                            ? formatCurrency(rangeData.summary.revenue / rangeData.dailyStats.length)
                            : formatCurrency(0)
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số ngày có dữ liệu:</span>
                        <span className="font-semibold">{rangeData.dailyStats.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Doanh thu cao nhất:</span>
                        <span className="font-semibold text-green-600">
                          {rangeData.dailyStats.length > 0 
                            ? formatCurrency(Math.max(...rangeData.dailyStats.map(d => d.revenue)))
                            : formatCurrency(0)
                          }
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Card title="Thống Kê Người Dùng" className="h-64">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Người dùng mới:</span>
                        <span className="font-semibold">{rangeData.summary.newUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trung bình/ngày:</span>
                        <span className="font-semibold">
                          {rangeData.dailyStats.length > 0 
                            ? (rangeData.summary.newUsers / rangeData.dailyStats.length).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Khoảng thời gian:</span>
                        <span className="font-semibold text-blue-600">
                          {dateRange?.[0].format('DD/MM')} - {dateRange?.[1].format('DD/MM')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tổng số ngày:</span>
                        <span className="font-semibold">{rangeData.dailyStats.length}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Top 4 sản phẩm bán chạy nhất theo khoảng thời gian */}
              <div className="my-8">
                <Card 
                  title={`Top 4 Sản Phẩm Bán Chạy/Nhất Kém Nhất (${dateRange?.[0].format('DD/MM/YYYY')} - ${dateRange?.[1].format('DD/MM/YYYY')})`} 
                  style={{ minHeight: 200 }}
                  extra={
                    <Select value={topSort} style={{ width: 200 }} onChange={v => setTopSort(v)}>
                      <Option value="desc">Top 4 Bán Chạy Nhất</Option>
                      <Option value="asc">Top 4 Bán Kém Nhất</Option>
                    </Select>
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
                    <div className="flex justify-center items-center h-32 text-gray-500 font-bold text-xl">
                      Không có dữ liệu bán hàng trong khoảng thời gian này 😢
                    </div>
                  )}
                </Card>
              </div>

              {/* Biểu đồ doanh thu theo ngày trong khoảng thời gian */}
              <div className="my-8">
                <Card title={`Doanh Thu Theo Ngày (${dateRange?.[0].format('DD/MM/YYYY')} - ${dateRange?.[1].format('DD/MM/YYYY')})`} style={{ height: 350 }}>
                  {dailyRevenueData.length > 0 && hasRevenue ? (
                    <Line
                      data={chartData}
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
                      Không có dữ liệu doanh thu trong khoảng thời gian này
                    </div>
                  )}
                </Card>
              </div>
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