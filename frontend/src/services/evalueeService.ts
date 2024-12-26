import axios from 'axios';
import { Evaluee, EvalueeFormData } from '../types/evaluee';
import { API_BASE_URL } from '../config';

export const evalueeService = {
    getAll: async (): Promise<Evaluee[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/evaluees/`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching evaluees:', error);
            throw error.response?.data || error;
        }
    },

    getById: async (id: number): Promise<Evaluee> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/evaluees/${id}/`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching evaluee:', error);
            throw error.response?.data || error;
        }
    },

    create: async (evaluee: EvalueeFormData): Promise<Evaluee> => {
        try {
            // Format the date to ensure it's in YYYY-MM-DD format
            const formattedEvaluee = {
                ...evaluee,
                date_of_birth: new Date(evaluee.date_of_birth).toISOString().split('T')[0]
            };
            
            console.log('Creating evaluee with data:', formattedEvaluee);
            const apiUrl = `${API_BASE_URL}/evaluees/`;
            console.log('API URL:', apiUrl);
            
            const response = await axios.post(apiUrl, formattedEvaluee);
            console.log('Server response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating evaluee:', {
                error,
                response: error.response,
                data: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.message,
                url: `${API_BASE_URL}/evaluees/`
            });
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const firstError = Object.entries(errorData)[0];
                    if (firstError) {
                        throw new Error(`${firstError[0]}: ${firstError[1]}`);
                    }
                }
            }
            
            throw error.response?.data || error;
        }
    },

    update: async (id: number, evaluee: EvalueeFormData): Promise<Evaluee> => {
        try {
            const response = await axios.put(`${API_BASE_URL}/evaluees/${id}/`, evaluee);
            return response.data;
        } catch (error: any) {
            console.error('Error updating evaluee:', error);
            throw error.response?.data || error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axios.delete(`${API_BASE_URL}/evaluees/${id}/`);
        } catch (error: any) {
            console.error('Error deleting evaluee:', error);
            throw error.response?.data || error;
        }
    }
};
