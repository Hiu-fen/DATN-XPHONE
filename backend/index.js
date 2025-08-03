require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


// ROUTES
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRouter');
const contactRoutes = require('./routes/contactRouter');
const commentRoutes = require('./routes/commentRouter');
const orderRoutes = require('./routes/orderRouter');
const promotionRoutes = require('./routes/promotionRouter');
const bannerRouter = require('./routes/bannerRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');
const colorRouter = require('./routes/variant/colorRouter');
const ramRouter = require('./routes/variant/ramRouter');
const newsRoutes = require('./routes/newsRoutes');
const statisticsRouter = require('./routes/statisticsRouter');
const notificationRoutes = require('./routes/notificationRouters');
const addressRouter = require("./routes/address");
const vnpayRouter = require("./routes/vnpayRoutes");
const ghnRoutes = require('./routes/ghnRoutes');
const rewardRoutes = require("./routes/rewardRoutes");
const variantCategoryRouter = require('./routes/variant/variantCategoryRouter'); // Thêm route cho VariantCategory

const app = express();
const PORT = process.env.PORT || 5000;

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Khởi tạo socket server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Gán io vào biến toàn cục
global._io = io;

// Lắng nghe kết nối
io.on("connection", (socket) => {
  console.log("✅ Client kết nối:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client ngắt kết nối:", socket.id);
  });
});

// MIDDLEWARES
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/uploads", express.static("uploads"));

// DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// ROUTES
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/banners', bannerRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/carts', cartRouter);
app.use('/api/colors', colorRouter);
app.use('/api/rams', ramRouter);
app.use('/api/news', newsRoutes);
app.use('/api/statistics', statisticsRouter);
app.use('/api/notifications', notificationRoutes);
app.use("/api/addresses", addressRouter);
app.use("/api/vnpay", vnpayRouter);
app.use('/api/ghn', ghnRoutes);
app.use("/api/rewards", rewardRoutes);
app.use('/api/variant-category', variantCategoryRouter); // Thêm route mới

// CRON
require('./cron');


// XÓA TỰ ĐỘNG SAU 30 NGÀY (SCHEDULER)
const { initScheduler } = require('./utils/scheduler');
initScheduler();
// KHỞI ĐỘNG SERVER
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket đang chạy tại http://localhost:${PORT}`);
});