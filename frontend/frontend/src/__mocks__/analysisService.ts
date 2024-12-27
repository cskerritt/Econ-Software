import { vi } from 'vitest';

const mockAnalysis = {
  id: 1,
  evaluee: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe'
  },
  date_of_injury: '2024-01-01',
  date_of_report: '2024-01-01',
  worklife_expectancy: 30,
  years_to_final_separation: 25,
  life_expectancy: 80,
  pre_injury_base_wage: 50000,
  post_injury_base_wage: 30000,
  growth_rate: 2.5,
  adjustment_factor: 1,
  apply_discounting: true,
  discount_rate: 3,
  include_health_insurance: true,
  health_insurance_base: 10000,
  health_cost_inflation_rate: 5,
  include_pension: true,
  pension_type: 'defined_benefit',
  pension_base: 5000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const analysisService = {
  getAnalyses: vi.fn().mockResolvedValue([mockAnalysis]),
  getAnalysis: vi.fn().mockResolvedValue(mockAnalysis),
  createAnalysis: vi.fn().mockResolvedValue(mockAnalysis),
  updateAnalysis: vi.fn().mockResolvedValue(mockAnalysis),
  deleteAnalysis: vi.fn().mockResolvedValue(undefined),
  calculateAnalysis: vi.fn().mockResolvedValue({
    personal_info: {
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      date_of_injury: '2024-01-01',
      date_of_report: '2024-01-01',
      age_at_injury: 34,
      current_age: 34,
      worklife_expectancy: 30,
      years_to_final_separation: 25,
      life_expectancy: 80,
      retirement_date: '2054-01-01',
      date_of_death: '2070-01-01'
    },
    exhibit1: {
      title: 'Pre-Injury Earnings',
      description: 'Projected earnings without injury',
      growth_rate: 2.5,
      adjustment_factor: 1,
      data: {
        rows: [{
          year: 2024,
          portion_of_year: 1,
          age: 34,
          wage_base_years: 1,
          gross_earnings: 50000,
          adjusted_earnings: 50000
        }],
        total_future_value: 50000
      }
    },
    exhibit2: {
      title: 'Post-Injury Earnings',
      description: 'Projected earnings with injury',
      growth_rate: 2.5,
      adjustment_factor: 1,
      data: {
        rows: [{
          year: 2024,
          portion_of_year: 1,
          age: 34,
          wage_base_years: 1,
          gross_earnings: 30000,
          adjusted_earnings: 30000
        }],
        total_future_value: 30000,
        total_present_value: 29126.21
      }
    }
  }),
  downloadExcel: vi.fn().mockResolvedValue(undefined),
  downloadWord: vi.fn().mockResolvedValue(undefined)
};
