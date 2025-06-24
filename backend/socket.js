const { Server } = require('socket.io');
let io;

// Hàm khởi tạo socket server
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Khi client kết nối
  io.on('connection', (socket) => {

    console.log('✅ Đã kết nối socket mới, ID là:', socket.id);

    // Khi người dùng muốn vào phòng theo userId (để nhận thông báo cá nhân)
    socket.on('join-user', (userId) => {
      if (!userId) return;
      socket.join(userId);
    });

    // Khi người dùng muốn vào phòng theo role (vd: admin, staff)
    socket.on('join-role', (role) => {
      if (!role) return;
      socket.join(role);
      // console.log('✅ Đã join vào role:', role);
    });

    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
      // console.log('❌ Client đã ngắt kết nối:', socket.id);
    });
  });
};

// Trả về socket instance để dùng ở nơi khác
const getIO = () => io;

module.exports = {
  initSocket,
  getIO
};
