const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
mongoose.connect('mongodb://localhost:27017/Test', {

})
.then(() => console.log('Kết nối MongoDB thành công'))
.catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// Mount router sản phẩm
app.use('/api/category', categoryRoutes);

app.use('/api/products', productRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/comments', commentRoutes);



// Chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
