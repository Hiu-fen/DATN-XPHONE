import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { message } from 'antd';

const GoogleLoginButton = ({ mode }: { mode: 'login' | 'register' }) => {
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
        const res = await axios.post('http://localhost:5000/api/users/google-register', {
          name,
          email,
          avatar: picture,
        });
        message.success(res.data.message || 'Đăng ký bằng Google thành công');
      } else if (mode === 'login') {
        const res = await axios.post('http://localhost:5000/api/users/google-login', {
          email,
        });

        const user = res.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', res.data.token);
        message.success('Đăng nhập bằng Google thành công');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Thao tác thất bại';
      message.error(errorMsg);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleResponse}
        onError={() => {
          message.error(
            mode === 'register' ? 'Đăng ký bằng Google thất bại' : 'Đăng nhập bằng Google thất bại'
          );
        }}
        text={mode === 'register' ? 'signup_with' : 'signin_with'} // Hiển thị đúng nội dung nút
        width="300"
      />
    </div>
  );
};

export default GoogleLoginButton;
