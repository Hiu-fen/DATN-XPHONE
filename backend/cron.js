const cron = require('node-cron');
const { autoDisableExpiredPromotions } = require('./controllers/promotionControllers');

// ⏰ Cron job: kiểm tra mỗi 10 phút
// cron.schedule('* * * * *', () => {
//   console.log('⏳ Cron job đang chạy mỗi phút...');
//   autoDisableExpiredPromotions();
// });

// Cron job này sẽ tự động vô hiệu hóa các khuyến mãi đã hết hạn mỗi 10 phút.
// cron.schedule('*/10 * * * *', () => {
//   console.log('⏳ Cron job chạy mỗi 10 phút...');
//   autoDisableExpiredPromotions();
// });

// Cron job này sẽ tự động vô hiệu hóa các khuyến mãi đã hết hạn mỗi 2 phút.
cron.schedule('*/2 * * * *', () => {
  console.log('⏳ Cron job đang chạy mỗi 2 phút...');
  autoDisableExpiredPromotions();
});


