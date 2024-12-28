import sys
from typing import Dict, List, Any
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP


@dataclass
class PrePostRow:
    """Data structure for Pre-Injury and Post-Injury table rows"""

    year: int  # Column (1)
    portion_of_year: float  # Column (2) - displayed as percentage
    age: float  # Column (3)
    wage_base_years: float  # Column (4)
    # Column (5) = portion_of_year * wage_base_years
    # Column (6) = Column (5) * AIF


@dataclass
class HealthInsuranceRow:
    """Data structure for Health Insurance table rows"""

    year: int  # Column (1)
    portion_of_year: float  # Column (2) - displayed as percentage
    premium: float  # Column (3) - grows by growth_rate each year
    year_index: int  # Used for discounting from start year
    # Column (4) = portion_of_year * premium
    # Column (5) = Column (4) / (1 + discount_rate)^year_index


class EconomicAnalysis:
    def __init__(self):
        self.user_data = {}

    def format_currency(self, amount: float) -> str:
        """Format a number as currency with 2 decimal places"""
        decimal_amount = Decimal(str(amount)).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        return f"${decimal_amount:,.2f}"

    def get_user_inputs(self) -> Dict[str, Any]:
        """
        Collect all necessary inputs from the user for three tables:
        1. Pre-Injury Table:
           - Growth rate
           - Adjustment Impact Factor (AIF)
           - Row data (year, portion, age, wage base)

        2. Post-Injury Table:
           - Growth rate
           - Adjustment Impact Factor (AIF)
           - Row data (year, portion, age, wage base)

        3. Health Insurance Table:
           - Start year
           - End year
           - Base premium
           - Growth rate
           - Discount rate

        Returns:
            Dict containing all inputs needed for calculations
        """
        try:
            if not sys.stdin.isatty():
                print("\n=== Economic Analysis Input Parameters ===")
                print("\nPre-Injury Parameters:")
                pre_growth_rate = float(
                    input(
                        "Enter Pre-Injury growth rate (decimal, e.g. 0.04 for 4%): "
                    ).strip()
                    or "0.04"
                )
                pre_aif = float(
                    input(
                        "Enter Pre-Injury Adjustment Impact Factor (decimal, e.g. 0.754 for 75.4%): "
                    ).strip()
                    or "0.754"
                )

                print("\nPost-Injury Parameters:")
                post_growth_rate = float(
                    input("Enter Post-Injury growth rate (decimal): ").strip()
                    or "0.042"
                )
                post_aif = float(
                    input("Enter Post-Injury AIF (decimal): ").strip() or "0.75"
                )

                print("\nHealth Insurance Parameters:")
                hi_start_year = int(
                    input("Enter Start Year (e.g. 2024): ").strip() or "2024"
                )
                hi_end_year = int(
                    input("Enter End Year (e.g. 2044): ").strip() or "2044"
                )
                hi_base_premium = float(
                    input(
                        "Enter Health Insurance base premium in start year (e.g. 7001.05): "
                    ).strip()
                    or "7001.05"
                )
                hi_growth_rate = float(
                    input(
                        "Enter Health Insurance growth rate (decimal, e.g. 0.07 for 7%): "
                    ).strip()
                    or "0.07"
                )
                hi_discount_rate = float(
                    input("Enter discount rate (decimal, e.g. 0.03): ").strip()
                    or "0.03"
                )

                print("\nWorklife Parameters:")
                worklife_expectancy = float(
                    input("Enter Worklife Expectancy in years (e.g. 15.5): ").strip()
                    or "15.5"
                )
                years_to_final_separation = float(
                    input("Enter Years to Final Separation (e.g. 10.0): ").strip()
                    or "10.0"
                )
                life_expectancy = float(
                    input("Enter Life Expectancy in years (e.g. 78.3): ").strip()
                    or "78.3"
                )

                print("\nStatistical Parameters:")
                statistical_death = float(
                    input("Enter Statistical State of Death (e.g. 80.0): ").strip()
                    or "80.0"
                )
                statistical_retirement = float(
                    input("Enter Statistical Retirement Age (e.g. 65.0): ").strip()
                    or "65.0"
                )
                statistical_separation = float(
                    input(
                        "Enter Statistical Year to Final Separation (e.g. 10.0): "
                    ).strip()
                    or "10.0"
                )

                # Get Pre-Injury table data
                print("\nPre-Injury Table Data:")
                pre_table_rows = []
                pre_table_count = int(
                    input("How many rows for Pre-Injury table? ").strip() or "2"
                )
                for i in range(pre_table_count):
                    print(f"\n--- Pre-Injury Row #{i+1} ---")
                    year = int(
                        input("Enter Year (e.g. 2020): ").strip() or str(2020 + i)
                    )
                    portion = float(
                        input("Enter Portion of Year (decimal, e.g. 1.0): ").strip()
                        or "1.0"
                    )
                    age = float(
                        input("Enter Age (e.g. 56.0): ").strip() or str(56.0 + i)
                    )
                    wage_base = float(
                        input("Enter Wage Base for that year (e.g. 85000): ").strip()
                        or str(85000 + (i * 3000))
                    )
                    pre_table_rows.append(PrePostRow(year, portion, age, wage_base))

                # Get Post-Injury table data
                print("\nPost-Injury Table Data:")
                post_table_rows = []
                post_table_count = int(
                    input("How many rows for Post-Injury table? ").strip() or "1"
                )
                for i in range(post_table_count):
                    print(f"\n--- Post-Injury Row #{i+1} ---")
                    year = int(
                        input("Enter Year (e.g. 2025): ").strip() or str(2025 + i)
                    )
                    portion = float(
                        input("Enter Portion of Year (decimal): ").strip() or "0.95"
                    )
                    age = float(input("Enter Age: ").strip() or str(58.0 + i))
                    wage_base = float(
                        input("Enter Wage Base: ").strip() or str(92000 + (i * 3000))
                    )
                    post_table_rows.append(PrePostRow(year, portion, age, wage_base))

                return {
                    # Pre-Injury parameters
                    "pre_growth_rate": pre_growth_rate,
                    "pre_aif": pre_aif,
                    "pre_table_rows": pre_table_rows,
                    # Post-Injury parameters
                    "post_growth_rate": post_growth_rate,
                    "post_aif": post_aif,
                    "post_table_rows": post_table_rows,
                    # Health Insurance parameters
                    "hi_start_year": hi_start_year,
                    "hi_end_year": hi_end_year,
                    "hi_base_premium": hi_base_premium,
                    "hi_growth_rate": hi_growth_rate,
                    "hi_discount_rate": hi_discount_rate,
                    # Worklife parameters
                    "worklife_expectancy": worklife_expectancy,
                    "years_to_final_separation": years_to_final_separation,
                    "life_expectancy": life_expectancy,
                    # Statistical parameters
                    "statistical_death": statistical_death,
                    "statistical_retirement": statistical_retirement,
                    "statistical_separation": statistical_separation,
                }
            else:
                print("\n=== Pre-Injury Table Inputs ===")
                pre_growth_rate = float(
                    input(
                        "Enter Pre-Injury growth rate (decimal, e.g. 0.04 for 4%): "
                    ).strip()
                    or "0.04"
                )
                pre_aif = float(
                    input(
                        "Enter Pre-Injury Adjustment Impact Factor (decimal, e.g. 0.754 for 75.4%): "
                    ).strip()
                    or "0.754"
                )

                print("\n=== Post-Injury Table Inputs ===")
                post_growth_rate = float(
                    input("Enter Post-Injury growth rate (decimal): ").strip()
                    or "0.042"
                )
                post_aif = float(
                    input("Enter Post-Injury AIF (decimal): ").strip() or "0.75"
                )

                print("\n=== Health Insurance Table Inputs ===")
                hi_start_year = int(
                    input("Enter Start Year (e.g. 2024): ").strip() or "2024"
                )
                hi_end_year = int(
                    input("Enter End Year (e.g. 2044): ").strip() or "2044"
                )
                hi_base_premium = float(
                    input(
                        "Enter Health Insurance base premium in start year (e.g. 7001.05): "
                    ).strip()
                    or "7001.05"
                )
                hi_growth_rate = float(
                    input(
                        "Enter Health Insurance growth rate (decimal, e.g. 0.07 for 7%): "
                    ).strip()
                    or "0.07"
                )
                hi_discount_rate = float(
                    input("Enter discount rate (decimal, e.g. 0.03): ").strip()
                    or "0.03"
                )

                # Get Pre-Injury table data
                pre_table_rows = []
                pre_table_count = int(
                    input("\nHow many rows for Pre-Injury table? ").strip() or "2"
                )
                for i in range(pre_table_count):
                    print(f"\n--- Pre-Injury Row #{i+1} ---")
                    year = int(
                        input("Enter Year (e.g. 2020): ").strip() or str(2020 + i)
                    )
                    portion = float(
                        input("Enter Portion of Year (decimal, e.g. 1.0): ").strip()
                        or "1.0"
                    )
                    age = float(
                        input("Enter Age (e.g. 56.0): ").strip() or str(56.0 + i)
                    )
                    wage_base = float(
                        input("Enter Wage Base for that year (e.g. 85000): ").strip()
                        or str(85000 + (i * 3000))
                    )
                    pre_table_rows.append(PrePostRow(year, portion, age, wage_base))

                # Get Post-Injury table data
                post_table_rows = []
                post_table_count = int(
                    input("\nHow many rows for Post-Injury table? ").strip() or "1"
                )
                for i in range(post_table_count):
                    print(f"\n--- Post-Injury Row #{i+1} ---")
                    year = int(
                        input("Enter Year (e.g. 2025): ").strip() or str(2025 + i)
                    )
                    portion = float(
                        input("Enter Portion of Year (decimal): ").strip() or "0.95"
                    )
                    age = float(input("Enter Age: ").strip() or str(58.0 + i))
                    wage_base = float(
                        input("Enter Wage Base: ").strip() or str(92000 + (i * 3000))
                    )
                    post_table_rows.append(PrePostRow(year, portion, age, wage_base))

                return {
                    "pre_growth_rate": pre_growth_rate,
                    "pre_aif": pre_aif,
                    "post_growth_rate": post_growth_rate,
                    "post_aif": post_aif,
                    "hi_start_year": hi_start_year,
                    "hi_end_year": hi_end_year,
                    "hi_base_premium": hi_base_premium,
                    "hi_growth_rate": hi_growth_rate,
                    "hi_discount_rate": hi_discount_rate,
                    "pre_table_rows": pre_table_rows,
                    "post_table_rows": post_table_rows,
                }
        except Exception as e:
            print(f"Error getting inputs: {str(e)}")
            raise

    def print_pre_post_table(
        self,
        exhibit_num: int,
        rows: List[PrePostRow],
        growth_rate: float,
        aif: float,
        table_type: str,
    ):
        """
        Print either Pre-Injury or Post-Injury table with columns:
        (1) Year
        (2) Portion of Year (as percentage)
        (3) Age
        (4) Wage Base Years
        (5) Gross Earnings = (2) × (4)
        (6) Adjusted Earnings = (5) × AIF

        Args:
            exhibit_num: The exhibit number (1 or 2)
            rows: List of PrePostRow objects containing row data
            growth_rate: Annual growth rate (e.g., 0.04 for 4%)
            aif: Adjustment Impact Factor (e.g., 0.754 for 75.4%)
            table_type: "Pre-Injury" or "Post-Injury"
        """
        growth_rate_pct = growth_rate * 100
        aif_pct = aif * 100

        print(f"\nExhibit {exhibit_num}")
        print(f"Future Growth Rate: {growth_rate_pct:.2f}%")
        print(f"{table_type} Earnings\n")

        header = (
            "   (1) Year   (2) Portion of Year   (3) Age   "
            "(4) Wage Base Years   (5) Gross Earnings   "
            f"(6) Adjusted Earnings [(5) x {aif_pct:.2f}%]"
        )
        print(header)
        print("-" * 120)

        total_future_value = 0.0
        for row in rows:
            gross = row.portion_of_year * row.wage_base_years
            adjusted = gross * aif
            total_future_value += adjusted

            print(
                f"{row.year:>10} "
                f" {row.portion_of_year * 100:6.2f}% "
                f"    {row.age:>5.2f} "
                f"        {self.format_currency(row.wage_base_years):>12} "
                f"       {self.format_currency(gross):>12} "
                f"               {self.format_currency(adjusted):>12}"
            )

        print(
            f"\n                           Total Future Value        {self.format_currency(total_future_value)}\n"
        )

    def print_health_insurance_table(
        self,
        hi_data: List[HealthInsuranceRow],
        growth_rate: float,
        discount_rate: float,
    ):
        """
        Print Health Insurance table with columns:
        (1) Year
        (2) Portion of Year (as percentage)
        (3) Health Insurance @ X% (premium grown by growth_rate)
        (4) Yearly Value = (2) × (3)
        (5) Present Value = (4) / (1 + discount_rate)^year_index

        Shows both Total Future Value (sum of Column 4) and
        Total Present Value (sum of Column 5).

        Args:
            hi_data: List of HealthInsuranceRow objects
            growth_rate: Annual growth rate for premiums (e.g., 0.07 for 7%)
            discount_rate: Annual discount rate (e.g., 0.03 for 3%)
        """
        growth_rate_pct = growth_rate * 100
        discount_rate_pct = discount_rate * 100

        print(f"\nExhibit 3")
        print(f"Health Insurance @ {growth_rate_pct:.2f}% Growth")
        print(f"Discount Rate: {discount_rate_pct:.2f}%\n")

        header = (
            "   (1) Year   (2) Portion of Year   "
            f"(3) Health Ins @ {growth_rate_pct:.2f}%   "
            "(4) Yearly Value [(2) x (3)]   "
            f"(5) Present Value [@ {discount_rate_pct:.2f}%]"
        )
        print(header)
        print("-" * 120)

        total_future_value = 0.0
        total_present_value = 0.0

        for row in hi_data:
            yearly_value = row.portion_of_year * row.premium
            discount_factor = 1.0 / ((1 + discount_rate) ** row.year_index)
            present_value = yearly_value * discount_factor

            total_future_value += yearly_value
            total_present_value += present_value

            print(
                f"{row.year:>10} "
                f" {row.portion_of_year * 100:6.2f}% "
                f"      {self.format_currency(row.premium):>12} "
                f"             {self.format_currency(yearly_value):>12} "
                f"                     {self.format_currency(present_value):>12}"
            )

        print(
            f"\n                          Total Future Value       {self.format_currency(total_future_value)}"
        )
        print(
            f"                          Total Present Value      {self.format_currency(total_present_value)}\n"
        )

    def run(self):
        """
        Main program execution that generates three exhibits:
        1. Pre-Injury Earnings (from injury date to report date)
        2. Post-Injury Earnings (from report date to retirement/separation)
        3. Health Insurance (with growth rate and present value calculations)

        Uses worklife expectancy, statistical parameters, and other inputs
        to properly calculate periods and adjustments.
        """
        try:
            # Get all user inputs
            self.user_data = self.get_user_inputs()

            # Print parameters used in calculations
            print("\n=== Analysis Parameters ===")
            print(
                f"Worklife Expectancy: {self.user_data['worklife_expectancy']:.1f} years"
            )
            print(
                f"Years to Final Separation: {self.user_data['years_to_final_separation']:.1f}"
            )
            print(f"Life Expectancy: {self.user_data['life_expectancy']:.1f}")
            print(f"Statistical Death Age: {self.user_data['statistical_death']:.1f}")
            print(
                f"Statistical Retirement Age: {self.user_data['statistical_retirement']:.1f}"
            )
            print(
                f"Statistical Year to Final Separation: {self.user_data['statistical_separation']:.1f}\n"
            )

            # Print Pre-Injury table (Exhibit 1)
            print("\n=== Pre-Injury Analysis ===")
            self.print_pre_post_table(
                1,
                self.user_data["pre_table_rows"],
                self.user_data["pre_growth_rate"],
                self.user_data["pre_aif"],
                "Pre-Injury",
            )

            # Print Post-Injury table (Exhibit 2)
            print("\n=== Post-Injury Analysis ===")
            self.print_pre_post_table(
                2,
                self.user_data["post_table_rows"],
                self.user_data["post_growth_rate"],
                self.user_data["post_aif"],
                "Post-Injury",
            )

            # Generate Health Insurance rows
            # Use statistical parameters to adjust end dates if needed
            adjusted_end_year = min(
                self.user_data["hi_end_year"],
                self.user_data["hi_start_year"]
                + int(self.user_data["worklife_expectancy"]),
                self.user_data["hi_start_year"]
                + int(self.user_data["years_to_final_separation"]),
            )

            health_rows = []
            for y in range(self.user_data["hi_start_year"], adjusted_end_year + 1):
                year_index = y - self.user_data["hi_start_year"]

                # Calculate grown premium with compound growth
                grown_premium = self.user_data["hi_base_premium"] * (
                    (1 + self.user_data["hi_growth_rate"]) ** year_index
                )

                # Determine portion of year
                # Last year might be partial based on retirement/separation
                if y == adjusted_end_year:
                    # Use the fractional part of the final year if it exists
                    final_year_fraction = (
                        self.user_data["worklife_expectancy"] % 1
                        or self.user_data["years_to_final_separation"] % 1
                        or 0.47  # default if no fractional part exists
                    )
                    portion = final_year_fraction
                else:
                    portion = 1.0

                health_rows.append(
                    HealthInsuranceRow(y, portion, grown_premium, year_index)
                )

            # Print Health Insurance table (Exhibit 3)
            print("\n=== Health Insurance Analysis ===")
            self.print_health_insurance_table(
                health_rows,
                self.user_data["hi_growth_rate"],
                self.user_data["hi_discount_rate"],
            )

        except KeyboardInterrupt:
            print("\nProgram terminated by user.")
            sys.exit(0)
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            sys.exit(1)


if __name__ == "__main__":
    analysis = EconomicAnalysis()
    analysis.run()
