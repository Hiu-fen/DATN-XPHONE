export interface IContact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    replyImage?: string; // Thêm trường replyImage, có thể null
    replyDate?: string; // Thêm trường replyDate, có thể null
}