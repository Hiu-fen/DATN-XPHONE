import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createNotificationForUser } from '../../api/client/nofitationApiClient';

const GoogleLoginButton = ({ mode }: { mode: 'login' | 'register' | 'login-admin' }) => {
  const navigate = useNavigate();

  const handleGoogleResponse = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        console.error('Thiếu credential từ Google');
        return;
      }

      const decoded: any = jwtDecode(credential);
      const { name, email, picture } = decoded;

      if (mode === 'register') {
        // ✅ Đăng ký tài khoản mới bằng Google
        const res = await axios.post('http://localhost:5000/api/users/google-register', {
          name,
          email,
          avatar: picture,
        });
        message.success(res.data.message || 'Đăng ký bằng Google thành công');
        navigate('/login');
      } else {
        // ✅ Đăng nhập bằng Google
        const res = await axios.post('http://localhost:5000/api/users/google-login', {
          email,
        });

        const user = res.data.user;

        if (!user.active) {
          return message.error('Tài khoản đã bị khóa');
        }

        // ✅ Kiểm tra phân quyền
        if (mode === 'login-admin' && user.role !== 'admin') {
          return message.error('Tài khoản không có quyền admin');
        }

        if (mode !== 'login-admin' && user.role === 'admin') {
          return message.error('Admin không đăng nhập được nhé, dùng tài khoản user đi ae!');
        }

        // ✅ Lưu thông tin nếu hợp lệ
        if (mode === 'login-admin') {
          localStorage.setItem('admin', JSON.stringify(user));
        } else {
          localStorage.setItem('user', JSON.stringify(user));
        }

        localStorage.setItem('token', res.data.token);

        // ✅ Gọi API tạo thông báo khi user đăng nhập thành công
        if (mode !== 'login-admin') {
          try {
            await createNotificationForUser({
              userId: user._id,
              message: `Xin chào ${user.name}! Bạn vừa đăng nhập thành công bằng Google. Chúc bạn có trải nghiệm tuyệt vời!`,
              type: 'info',
            });
          } catch (notiErr) {
            console.warn('Không thể tạo thông báo login:', notiErr);
          }
        }

        // ✅ Thông báo thành công
        message.success(
          mode === 'login-admin'
            ? 'Đăng nhập Admin bằng Google thành công'
            : 'Đăng nhập bằng Google thành công'
        );

        navigate(mode === 'login-admin' ? '/admin/category/list' : '/');
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
      message.error(errorMsg);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <GoogleLogin
        onSuccess={handleGoogleResponse}
        onError={() => {
          message.error(
            mode === 'register'
              ? 'Đăng ký bằng Google thất bại'
              : 'Đăng nhập bằng Google thất bại'
          );
        }}
        text={mode === 'register' ? 'signup_with' : 'signin_with'}
        width="300"
      />
    </div>
  );
};

export default GoogleLoginButton;
