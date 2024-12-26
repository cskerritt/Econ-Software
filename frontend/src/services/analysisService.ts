import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface Analysis {
  id: number;
  evaluee: {
    id: number;
    first_name: string;
    last_name: string;
  };
  date_of_injury: string;
  date_of_report: string;
  worklife_expectancy: number;
  years_to_final_separation: number;
  life_expectancy: number;
  pre_injury_base_wage: number;
  post_injury_base_wage: number;
  growth_rate: number;
  adjustment_factor: number;
  apply_discounting: boolean;
  discount_rate: number | null;
  include_health_insurance: boolean;
  health_insurance_base: number;
  health_cost_inflation_rate: number;
  include_pension: boolean;
  pension_type: string;
  pension_base: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisData {
  evaluee: number;
  date_of_injury?: string;
  date_of_report?: string;
  worklife_expectancy: number;
  years_to_final_separation: number;
  life_expectancy: number;
  pre_injury_base_wage: number;
  post_injury_base_wage: number;
  growth_rate: number;
  adjustment_factor: number;
  apply_discounting: boolean;
  discount_rate: number | null;
  include_health_insurance: boolean;
  health_insurance_base: number;
  health_cost_inflation_rate: number;
  include_pension: boolean;
  pension_type: string;
  pension_base: number;
}

export interface AnalysisResult {
  personal_info: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    date_of_injury: string;
    date_of_report: string;
    age_at_injury: number;
    current_age: number;
    worklife_expectancy: number;
    years_to_final_separation: number;
    life_expectancy: number;
    retirement_date: string;
    date_of_death: string;
  };
  exhibit1: {
    title: string;
    description: string;
    growth_rate: number;
    adjustment_factor: number;
    data: {
      rows: Array<{
        year: number;
        portion_of_year: number;
        age: number;
        wage_base_years: number;
        gross_earnings: number;
        adjusted_earnings: number;
      }>;
      total_future_value: number;
    };
  };
  exhibit2: {
    title: string;
    description: string;
    growth_rate: number;
    adjustment_factor: number;
    data: {
      rows: Array<{
        year: number;
        portion_of_year: number;
        age: number;
        wage_base_years: number;
        gross_earnings: number;
        adjusted_earnings: number;
      }>;
      total_future_value: number;
      total_present_value: number | null;
    };
  };
}

export const analysisService = {
  getAnalyses: async () => {
    const response = await axios.get(`${API_BASE_URL}/analyses/`);
    return response.data;
  },

  getAnalysis: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/analyses/${id}/`);
    return response.data;
  },

  createAnalysis: async (data: CreateAnalysisData) => {
    const response = await axios.post(`${API_BASE_URL}/analyses/`, data);
    return response.data;
  },

  updateAnalysis: async (id: number, data: Partial<CreateAnalysisData>) => {
    const response = await axios.put(`${API_BASE_URL}/analyses/${id}/`, data);
    return response.data;
  },

  deleteAnalysis: async (id: number) => {
    await axios.delete(`${API_BASE_URL}/analyses/${id}/`);
  },

  calculateAnalysis: async (id: number) => {
    const response = await axios.post(`${API_BASE_URL}/analyses/${id}/calculate/`);
    return response.data;
  },

  downloadExcel: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses/${id}/excel/`, {
        responseType: 'blob',
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create a link element and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      throw error;
    }
  },

  downloadWord: async (id: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses/${id}/word/`, {
        responseType: 'blob',
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Create a link element and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_${id}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Word file:', error);
      throw error;
    }
  },
};
