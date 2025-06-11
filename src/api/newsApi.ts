import axios from 'axios';
import { INews } from '../interface/News';

const API_URL = 'http://localhost:5000/api/news';

export const newsApi = {
    getAll: async (): Promise<INews[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    getById: async (id: string): Promise<INews> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    create: async (news: Omit<INews, '_id' | 'createdAt' | 'updatedAt'>): Promise<INews> => {
        const response = await axios.post(API_URL, {
            ...news,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return response.data;
    },

    update: async (id: string, news: Partial<INews>): Promise<INews> => {
        const response = await axios.put(`${API_URL}/${id}`, {
            ...news,
            updatedAt: new Date().toISOString()
        });
        return response.data;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    }
}; 