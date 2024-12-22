import axios from 'axios';
import { EconomicAnalysis, CalculationResults } from '../types/analysis';

// Configure axios with base URL and CSRF token handling
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export const analysisService = {
  // Create a new analysis
  create: async (analysis: EconomicAnalysis): Promise<EconomicAnalysis> => {
    try {
      const response = await api.post<EconomicAnalysis>('/analyses/', analysis);
      return response.data;
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  },

  // Get a specific analysis by ID
  get: async (id: number): Promise<EconomicAnalysis> => {
    try {
      const response = await api.get<EconomicAnalysis>(`/analyses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  },

  // Get calculations for a specific analysis
  calculate: async (id: number): Promise<CalculationResults> => {
    try {
      const response = await api.get<CalculationResults>(`/analyses/${id}/calculate/`);
      return response.data;
    } catch (error) {
      console.error('Error calculating results:', error);
      throw error;
    }
  },

  // Update an existing analysis
  update: async (id: number, analysis: EconomicAnalysis): Promise<EconomicAnalysis> => {
    try {
      const response = await api.put<EconomicAnalysis>(`/analyses/${id}/`, analysis);
      return response.data;
    } catch (error) {
      console.error('Error updating analysis:', error);
      throw error;
    }
  },

  // Delete an analysis
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/analyses/${id}/`);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  },

  // List all analyses
  list: async (): Promise<EconomicAnalysis[]> => {
    try {
      const response = await api.get<EconomicAnalysis[]>('/analyses/');
      return response.data;
    } catch (error) {
      console.error('Error listing analyses:', error);
      throw error;
    }
  }
};

export default analysisService;