export const mockExhibitData = {
  rows: [
    {
      year: 2023,
      portion_of_year: 1,
      age: 43,
      wage_base_years: 1,
      gross_earnings: 85000,
      adjusted_earnings: 85000
    },
    {
      year: 2024,
      portion_of_year: 1,
      age: 44,
      wage_base_years: 2,
      gross_earnings: 88570,
      adjusted_earnings: 88570
    }
  ],
  total_future_value: 173570,
  total_present_value: 170167.65
};

export const mockHealthcareCosts = [
  {
    year: 2023,
    age: 43,
    cost: 10000
  },
  {
    year: 2024,
    age: 44,
    cost: 10300
  }
];

export const mockAnalysis = {
  id: 1,
  evaluee: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1979-12-31'
  },
  date_of_injury: '2023-06-14',
  date_of_report: '2023-12-31',
  worklife_expectancy: 20.5,
  years_to_final_separation: 15.2,
  life_expectancy: 82.3,
  pre_injury_base_wage: 85000,
  post_injury_base_wage: 45000,
  growth_rate: 0.042,
  discount_rate: 0.02,
  exhibit1: {
    title: 'Pre-Injury Earnings',
    description: 'Projected earnings without injury',
    growth_rate: 0.042,
    adjustment_factor: 1,
    data: mockExhibitData
  },
  exhibit2: {
    title: 'Post-Injury Earnings',
    description: 'Projected earnings with injury',
    growth_rate: 0.042,
    adjustment_factor: 1,
    data: {
      ...mockExhibitData,
      rows: mockExhibitData.rows.map(row => ({
        ...row,
        gross_earnings: row.gross_earnings * 0.529411765, // 45000/85000
        adjusted_earnings: row.adjusted_earnings * 0.529411765
      }))
    }
  },
  healthcare_costs: mockHealthcareCosts
};
