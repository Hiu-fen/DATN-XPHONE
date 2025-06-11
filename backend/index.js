require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRouter');
const contactRoutes = require('./routes/contactRouter');
const commentRoutes = require('./routes/commentRouter');
const orderRoutes = require('./routes/orderRouter');
const promotionRoutes = require('./routes/promotionRouter');
const bannerRouter = require('./routes/bannerRouter');
const userRouter = require('./routes/userRouter');
const cartRouter = require('./routes/cartRouter');
// const variantRouter = require('./routes/variant/ramRouter');
const colorRouter = require('./routes/variant/colorRouter');
const ramRouter   = require('./routes/variant/ramRouter');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Cấu hình CORS cho phép frontend truy cập
app.use(cors({
  origin: 'http://localhost:5173', // địa chỉ frontend
  credentials: true,
}));

// ✅ Middleware xử lý dữ liệu
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Kết nối MongoDB thành công'))
.catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// ✅ Gọi các route
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
app.use('/api/rams',   ramRouter);
app.use('/api/news', newsRoutes);
// app.use('/api/variants', variantRoutes); // Uncomment nếu bạn có route này

// ✅ Cron job (nếu có file cron.js)
require('./cron');

// ✅ Lắng nghe server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
