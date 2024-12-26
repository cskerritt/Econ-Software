export interface PreInjuryRow {
  year: number;
  portion_of_year: number;
  age: number;
  wage_base_years: number;
  gross_earnings?: number;
  adjusted_earnings?: number;
  present_value?: number;
}

export interface PostInjuryRow {
  year: number;
  portion_of_year: number;
  age: number;
  wage_base_years: number;
  gross_earnings?: number;
  adjusted_earnings?: number;
  present_value?: number;
}

export interface PersonalInfo {
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
}

export interface AEFData {
  base: number;
  worklifeAdjustment: number;
  unemploymentFactor: number;
  incomeTaxRate: number;
  personalConsumption: number;
  applyPersonalConsumption: boolean;
  fringeBenefits: number;
  finalAEF: number;
}

export interface EconomicAnalysis {
  id?: number;
  evaluee: number;
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
  discount_rate: number;
  
  // Health Insurance Benefits
  include_health_insurance: boolean;
  annual_health_contribution: number | null;
  health_cost_inflation_rate: number | null;
  
  // Pension Benefits
  include_pension: boolean;
  pension_type: 'defined_benefit' | 'defined_contribution' | null;
  // Defined Benefit Parameters
  final_average_salary: number | null;
  years_of_service: number | null;
  benefit_multiplier: number | null;
  // Defined Contribution Parameters
  annual_contribution: number | null;
  expected_return_rate: number | null;
  
  pre_injury_rows?: PreInjuryRow[];
  post_injury_rows?: PostInjuryRow[];
  created_at?: string;
  updated_at?: string;
}

export interface AnalysisFormData {
  evaluee: number;
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
  discount_rate: number;
  include_pension: boolean;
  pension_type: string;
  final_average_salary?: number;
  years_of_service?: number;
  benefit_multiplier?: number;
  annual_contribution?: number;
  expected_return_rate?: number;
}

export interface TableData {
  rows: (PreInjuryRow | PostInjuryRow)[];
  total_future_value: number;
  total_present_value?: number;  // Only for post-injury when discounting is applied
}

export interface ExhibitData {
  title: string;
  description: string;
  growth_rate: number;
  adjustment_factor: number;
  data: TableData;
}

export interface CalculationResults {
  personal_info: PersonalInfo;
  exhibit1: ExhibitData;  // Pre-Injury
  exhibit2: ExhibitData;  // Post-Injury
}