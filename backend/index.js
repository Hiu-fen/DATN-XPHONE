const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRouter');



const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // cho FE cổng 4000 gọi API
app.use(express.json()); // parse JSON body

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/DATN', {

})
.then(() => console.log('Kết nối MongoDB thành công'))
.catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// Mount router sản phẩm
app.use('/api/category', categoryRoutes);

app.use('/api/products', productRoutes);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
