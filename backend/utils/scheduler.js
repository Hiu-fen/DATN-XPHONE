const cron = require('node-cron');
const Product = require('../models/productModels');
const Notification = require('../models/notificationModels');

// Hàm xóa tự động sản phẩm quá 30 ngày trong thùng rác
const autoDeleteOldProducts = async () => {
  try {
    console.log('🗑️ Bắt đầu kiểm tra sản phẩm cũ trong thùng rác...');
    
    // Tính ngày 30 ngày trước
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Tìm sản phẩm đã xóa mềm và quá 30 ngày
    const oldProducts = await Product.find({
      status: false, // Sản phẩm đã xóa mềm
      updatedAt: { $lt: thirtyDaysAgo } // updatedAt < 30 ngày trước
    });
    
    if (oldProducts.length === 0) {
      console.log('✅ Không có sản phẩm nào cần xóa tự động');
      return;
    }
    
    console.log(`🔍 Tìm thấy ${oldProducts.length} sản phẩm cần xóa tự động`);
    
    // Xóa từng sản phẩm
    let deletedCount = 0;
    for (const product of oldProducts) {
      try {
        await Product.findByIdAndDelete(product._id);
        
        // Tạo thông báo
        await Notification.create({
          message: `Sản phẩm "${product.name}" đã bị xóa tự động sau 30 ngày trong thùng rác`,
          type: 'auto-delete',
          scope: 'admin',
          role: 'admin',
          relatedId: product._id,
        });
        
        deletedCount++;
        console.log(`✅ Đã xóa tự động: ${product.name}`);
        
        // Gửi socket event nếu có
        if (global._io) {
          global._io.emit("productAutoDeleted", product._id);
        }
        
      } catch (error) {
        console.error(`❌ Lỗi khi xóa sản phẩm ${product.name}:`, error.message);
      }
    }
    
    console.log(`🎉 Hoàn thành! Đã xóa tự động ${deletedCount}/${oldProducts.length} sản phẩm`);
    
    // Tạo thông báo tổng kết
    if (deletedCount > 0) {
      await Notification.create({
        message: `Hệ thống đã tự động xóa ${deletedCount} sản phẩm cũ khỏi thùng rác`,
        type: 'system',
        scope: 'admin',
        role: 'admin',
      });
    }
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình xóa tự động:', error);
  }
};

// Hàm khởi tạo scheduler
const initScheduler = () => {
  // Chạy mỗi ngày lúc 2:00 AM
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ Bắt đầu tác vụ xóa tự động sản phẩm cũ...');
    autoDeleteOldProducts();
  });
  
  // Chạy ngay khi khởi động server (để test)
  // autoDeleteOldProducts();
  
  console.log('📅 Đã khởi tạo scheduler - sẽ chạy mỗi ngày lúc 2:00 AM');
};

module.exports = {
  initScheduler,
  autoDeleteOldProducts // Export để có thể gọi thủ công
};