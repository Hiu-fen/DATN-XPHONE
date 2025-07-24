import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Đổi port nếu backend chạy port khác

export default socket;
