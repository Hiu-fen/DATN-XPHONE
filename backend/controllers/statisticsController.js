const User = require('../models/userModels');
const Order = require('../models/orderModel');
const Product = require('../models/productModels');

// Thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Đếm tổng số người dùng
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Đếm người dùng mới đăng ký
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfDay }
    });
    
    const newUsersThisWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfWeek }
    });
    
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth }
    });
    
    const newUsersThisYear = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfYear }
    });

    // Thống kê đơn hàng và doanh thu
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'Giao thành công' });
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao'] } 
    });

    // Doanh thu theo thời gian
    const revenueToday = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const revenueThisWeek = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    const revenueThisYear = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Thống kê sản phẩm
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ soluong: 0 });

    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Doanh thu theo tháng (12 tháng trong năm hiện tại)
    const currentYear = now.getFullYear();
    const monthlyRevenueRaw = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Tạo mảng 12 tháng, nếu thiếu thì doanh thu = 0
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyRevenueRaw.find(item => item._id.month === i + 1);
      return {
        _id: { month: i + 1, year: currentYear },
        total: found ? found.total : 0
      };
    });

    res.json({
      users: {
        total: totalUsers,
        totalAdmins,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        newThisYear: newUsersThisYear
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        byStatus: ordersByStatus
      },
      revenue: {
        today: revenueToday[0]?.total || 0,
        thisWeek: revenueThisWeek[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
        thisYear: revenueThisYear[0]?.total || 0,
        monthly: monthlyRevenue
      },
      products: {
        total: totalProducts,
        outOfStock: outOfStockProducts
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê' });
  }
};

// Thống kê chi tiết theo ngày
exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const orders = await Order.countDocuments({
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      newUsers,
      orders,
      revenue: revenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Lỗi thống kê ngày:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê ngày' });
  }
};

// Thống kê theo khoảng thời gian
exports.getStatsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Thiếu ngày bắt đầu hoặc kết thúc' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: start, $lte: end }
    });

    const orders = await Order.countDocuments({
      date: { $gte: start, $lte: end }
    });

    const completedOrders = await Order.countDocuments({
      status: 'Giao thành công',
      date: { $gte: start, $lte: end }
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Thống kê theo ngày trong khoảng thời gian
    const dailyStats = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      summary: {
        newUsers,
        totalOrders: orders,
        completedOrders,
        revenue: revenue[0]?.total || 0
      },
      dailyStats
    });
  } catch (error) {
    console.error('Lỗi thống kê khoảng thời gian:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê khoảng thời gian' });
  }
};

// Thống kê doanh thu từng ngày trong tháng
exports.getDailyRevenueInMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month, 10) - 1; // JS month: 0-11
    const y = parseInt(year, 10);
    if (!month || !year) {
      return res.status(400).json({ message: 'Thiếu tháng hoặc năm' });
    }
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);
    // Lấy số ngày trong tháng
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Lấy doanh thu từng ngày
    const dailyRaw = await Order.aggregate([
      {
        $match: {
          status: 'Giao thành công',
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' }, month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);
    // Map ra đủ các ngày
    const daily = Array.from({ length: daysInMonth }, (_, i) => {
      const found = dailyRaw.find(item => item._id.day === i + 1);
      return {
        day: i + 1,
        total: found ? found.total : 0
      };
    });
    res.json({ month: m + 1, year: y, daily });
  } catch (error) {
    console.error('Lỗi thống kê doanh thu từng ngày:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê doanh thu từng ngày' });
  }
};

// Thống kê top 3 sản phẩm bán chạy nhất
exports.getTopSellingProducts = async (req, res) => {
  try {
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    // Xử lý lọc theo tuần nếu có
    let matchOrder = {};
    if (req.query.weekStart) {
      const start = new Date(req.query.weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      matchOrder.date = { $gte: start, $lt: end };
    }
    // Lấy tổng số lượng bán ra của từng sản phẩm từ các đơn hàng trong tuần (nếu có)
    const soldAgg = await Order.aggregate([
      ...(Object.keys(matchOrder).length ? [{ $match: matchOrder }] : []),
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.soluong' }
        }
      }
    ]);
    // Lấy toàn bộ sản phẩm
    const products = await Product.find();
    // Gộp số lượng bán vào từng sản phẩm
    const productsWithSold = products.map(prod => {
      const sold = soldAgg.find(s => s._id.toString() === prod._id.toString());
      return {
        productId: prod._id,
        totalSold: sold ? sold.totalSold : 0,
        name: prod.name,
        image: prod.image,
        price: prod.price
      };
    });
    // Sắp xếp, lọc và lấy 4 sản phẩm có bán ra
    const result = productsWithSold
      .filter(p => p.totalSold > 0)
      .sort((a, b) => sortOrder * (a.totalSold - b.totalSold))
      .slice(0, 4);
    res.json(result);
  } catch (error) {
    console.error('Lỗi thống kê top sản phẩm bán chạy:', error);
    res.status(500).json({ message: 'Lỗi khi lấy top sản phẩm bán chạy' });
  }
}; 