export interface HealthcareCategory {
  id: number;
  name: string;
  description?: string;
  growth_rate: number;
  frequency_years: number;
  created_at: string;
  updated_at: string;
}

export interface HealthcarePlan {
  id: number;
  analysis_id: number;
  category: HealthcareCategory;
  base_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthcareCost {
  id: number;
  plan_id: number;
  year: number;
  age: number;
  cost: number;
  created_at: string;
  updated_at: string;
}

export interface HealthcarePlanFormData {
  category_id: number;
  base_cost: number;
  is_active: boolean;
}
