export interface PreInjuryRow {
  year: number;
  portion_of_year: number;
  age: number;
  wage_base_years: number;
  gross_earnings?: number;
  adjusted_earnings?: number;
}

export interface PostInjuryRow {
  year: number;
  portion_of_year: number;
  age: number;
  wage_base_years: number;
  gross_earnings?: number;
  adjusted_earnings?: number;
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
}

export interface EconomicAnalysis {
  id?: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  date_of_injury: string;
  date_of_report: string;
  worklife_expectancy: number;
  years_to_final_separation: number;
  life_expectancy: number;
  pre_growth_rate: number;
  pre_aif: number;
  post_growth_rate: number;
  post_aif: number;
  pre_injury_rows: PreInjuryRow[];
  post_injury_rows: PostInjuryRow[];
  created_at?: string;
  updated_at?: string;
}

export interface TableData {
  rows: (PreInjuryRow | PostInjuryRow)[];
  total_future_value: number;
}

export interface ExhibitData {
  title: string;
  description: string;
  future_growth_rate: number;
  data: TableData;
}

export interface CalculationResults {
  personal_info: PersonalInfo;
  exhibit1: ExhibitData;  // Pre-Injury
  exhibit2: ExhibitData;  // Post-Injury
}