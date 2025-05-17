export interface User {
    id?: number;
  name: string;
    email: string;
    password: string;
    sdt?:string;
    address?:string;
    avatar?:string;
    active: boolean;
     role: 'admin' | 'user'; 
     notification?: string;
  }
