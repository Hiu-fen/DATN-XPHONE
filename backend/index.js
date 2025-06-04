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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/banners', bannerRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRoutes);

// Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});