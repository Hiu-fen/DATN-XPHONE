export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  sdt?: string;
  address?: string;
  avatar?: string;
  active: boolean;
  dob?: string;
  role: 'admin' | 'user';
  notification?: string;
  createdAt: string; 
}
