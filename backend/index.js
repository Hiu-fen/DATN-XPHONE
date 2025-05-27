const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRouter');
const contactRoutes = require('./routes/contactRouter')
const commentRoutes = require('./routes/commentRouter')


const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => console.log('✅ Kết nối MongoDB thành công'))
.catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// Mount router
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);

app.use('/api/comments', commentRoutes);

// Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});