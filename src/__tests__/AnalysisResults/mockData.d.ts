declare global {
  namespace NodeJS {
    interface Global {
      mockExhibitData: {
        rows: {
          year: number;
          portion_of_year: number;
          age: number;
          wage_base_years: number;
          gross_earnings: number;
          adjusted_earnings: number;
        }[];
        total_future_value: number;
        total_present_value: number;
      };
    }
  }
}

export {};
