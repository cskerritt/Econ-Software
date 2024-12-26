import { vi } from 'vitest';
import { HealthcareCategory, HealthcarePlan } from '../types/healthcare';

const mockCategory: HealthcareCategory = {
  id: 1,
  name: 'Medical Insurance',
  description: 'Basic medical insurance coverage',
  growth_rate: 5,
  frequency_years: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockPlan: HealthcarePlan = {
  id: 1,
  analysis_id: 1,
  category: mockCategory,
  base_cost: 10000,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const healthcareService = {
  // Healthcare Categories
  getCategories: vi.fn().mockResolvedValue([mockCategory]),
  getCategory: vi.fn().mockResolvedValue(mockCategory),

  // Healthcare Plans
  getPlans: vi.fn().mockResolvedValue([mockPlan]),
  getPlan: vi.fn().mockResolvedValue(mockPlan),
  createPlan: vi.fn().mockResolvedValue(mockPlan),
  updatePlan: vi.fn().mockResolvedValue(mockPlan),
  deletePlan: vi.fn().mockResolvedValue(undefined),
  togglePlan: vi.fn().mockResolvedValue({
    ...mockPlan,
    is_active: !mockPlan.is_active
  }),

  // Calculations
  calculateCosts: vi.fn().mockResolvedValue(undefined)
};
