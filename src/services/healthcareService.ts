import axios from 'axios';
import { API_BASE_URL } from '../config';
import { HealthcareCategory, HealthcarePlan, HealthcarePlanFormData } from '../types/healthcare';

export const healthcareService = {
  // Healthcare Categories
  getCategories: async (): Promise<HealthcareCategory[]> => {
    const response = await axios.get(`${API_BASE_URL}/healthcare-categories/`);
    return response.data;
  },

  getCategory: async (id: number): Promise<HealthcareCategory> => {
    const response = await axios.get(`${API_BASE_URL}/healthcare-categories/${id}/`);
    return response.data;
  },

  // Healthcare Plans
  getPlans: async (analysisId: number): Promise<HealthcarePlan[]> => {
    const response = await axios.get(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/`);
    return response.data;
  },

  getPlan: async (analysisId: number, planId: number): Promise<HealthcarePlan> => {
    const response = await axios.get(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`);
    return response.data;
  },

  createPlan: async (analysisId: number, data: HealthcarePlanFormData): Promise<HealthcarePlan> => {
    const response = await axios.post(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/`, data);
    return response.data;
  },

  updatePlan: async (analysisId: number, planId: number, data: Partial<HealthcarePlanFormData>): Promise<HealthcarePlan> => {
    const response = await axios.put(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`, data);
    return response.data;
  },

  deletePlan: async (analysisId: number, planId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`);
  },

  togglePlan: async (analysisId: number, planId: number): Promise<HealthcarePlan> => {
    const response = await axios.post(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/${planId}/toggle/`);
    return response.data;
  },

  // Partial Updates
  patchPlan: async (analysisId: number, planId: number, data: Partial<HealthcarePlanFormData>): Promise<HealthcarePlan> => {
    const response = await axios.patch(`${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`, data);
    return response.data;
  },

  // Batch Operations
  batchUpdatePlans: async (analysisId: number, updates: Array<{ id: number } & Partial<HealthcarePlanFormData>>): Promise<HealthcarePlan[]> => {
    const response = await axios.patch(
      `${API_BASE_URL}/analyses/${analysisId}/healthcare-plans/batch/`,
      { plans: updates }
    );
    return response.data;
  },

  // Calculations
  calculateCosts: async (analysisId: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/analyses/${analysisId}/calculate-healthcare-costs/`);
  },
};
