export interface IMessage {
  sender: string; // 'client' or 'admin'
  content: string;
  image?: string;
  timestamp: string;
}

export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  conversation: IMessage[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}