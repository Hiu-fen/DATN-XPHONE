export interface INews {
    _id: string;
    title: string;
    content: string;
    image: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    status: 'published' | 'draft';
    category: string;
} 