import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import AnalysisResults from '../src/pages/AnalysisResults';
import { analysisService } from '../src/services/analysisService';

// Mock services and router
vi.mock('../src/services/analysisService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockResults = {
  personal_info: {
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1960-01-01',
    date_of_injury: '2018-06-15',
    date_of_report: '2024-01-01',
    age_at_injury: 58.45,
    current_age: 64.0,
    worklife_expectancy: 12.5,
    years_to_final_separation: 8.2,
    life_expectancy: 82.3,
    retirement_date: '2025-01-01',
    date_of_death: '2042-04-15'
  },
  exhibit1: {
    growth_rate: 0.042,
    adjustment_factor: 0.754,
    data: {
      rows: [
        {
          year: 2018,
          portion_of_year: 0.9123,
          age: 56.09,
          wage_base_years: 84598,
          gross_earnings: 77181,
          adjusted_earnings: 58194.62,
        }
      ],
      total_future_value: 497937.67,
    }
  },
  exhibit2: {
    adjustment_factor: 0.754,
    data: {
      rows: [
        {
          year: 2024,
          portion_of_year: 0.04,
          age: 62.98,
          wage_base_years: 63565,
          gross_earnings: 2605,
          adjusted_earnings: 1964.25,
        }
      ],
      total_future_value: 82272.32,
    }
  }
};

const renderWithRouter = () => {
  (useParams as any).mockReturnValue({ id: '123' });
  return render(
    <BrowserRouter>
      <AnalysisResults />
    </BrowserRouter>
  );
};

describe('Table Formatting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (analysisService.calculateAnalysis as any).mockResolvedValue({ data: mockResults });
  });

  it('formats Exhibit 1 (Pre-Trial) header correctly', async () => {
    renderWithRouter();
    
    const header = await screen.findByTestId('exhibit1-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Exhibit 1');
    
    // Check name format
    const name = screen.getByTestId('exhibit1-name');
    expect(name).toHaveTextContent('#John Doe');
    
    // Check growth rate format
    const growthRate = screen.getByTestId('exhibit1-growth-rate');
    expect(growthRate).toHaveTextContent('4.20%');
    
    // Check title
    expect(screen.getByText('Pre-Trial Earnings')).toBeInTheDocument();
  });

  it('formats Exhibit 1 table headers correctly', async () => {
    renderWithRouter();
    
    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    
    // Check column headers
    expect(headers[0]).toHaveTextContent(/\(1\).*Year/);
    expect(headers[1]).toHaveTextContent(/\(2\).*Portion of.*Year/);
    expect(headers[2]).toHaveTextContent(/\(3\).*Age/);
    expect(headers[3]).toHaveTextContent(/\(4\).*Wage Base Years/);
    expect(headers[4]).toHaveTextContent(/\(5\).*Gross Earnings/);
    expect(headers[5]).toHaveTextContent(/\(6\).*Adjusted Earnings.*\[5\]x75\.40%/);
  });

  it('formats Exhibit 1 table values correctly', async () => {
    renderWithRouter();
    
    const table = await screen.findByRole('table');
    const firstRow = within(table).getAllByRole('row')[1]; // First data row
    const cells = within(firstRow).getAllByRole('cell');
    
    // Check number formatting
    expect(cells[0]).toHaveTextContent('2018'); // Year
    expect(cells[1]).toHaveTextContent('91%'); // Portion of Year (0 decimals)
    expect(cells[2]).toHaveTextContent('56.09'); // Age (2 decimals)
    expect(cells[3]).toHaveTextContent('84,598'); // Wage Base (no $, with commas)
    expect(cells[4]).toHaveTextContent('77,181'); // Gross Earnings (no $, with commas)
    expect(cells[5]).toHaveTextContent('58,194.62'); // Adjusted Earnings (2 decimals)
  });

  it('formats Exhibit 2 (Post-Trial) header correctly', async () => {
    renderWithRouter();
    
    const header = await screen.findByTestId('exhibit2-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Exhibit 2');
    
    // Check name and ref format
    const name = screen.getByTestId('exhibit2-name');
    expect(name).toHaveTextContent('#John Doe');
    const ref = screen.getByTestId('exhibit2-ref');
    expect(ref).toHaveTextContent('#REF!');
    
    // Check title
    expect(screen.getByText('Post-Trial Earnings')).toBeInTheDocument();
  });

  it('formats Exhibit 2 table values correctly', async () => {
    renderWithRouter();
    
    const tables = await screen.findAllByRole('table');
    const firstRow = within(tables[1]).getAllByRole('row')[1]; // First data row
    const cells = within(firstRow).getAllByRole('cell');
    
    // Check number formatting
    expect(cells[0]).toHaveTextContent('2024'); // Year
    expect(cells[1]).toHaveTextContent('4%'); // Portion of Year (0 decimals)
    expect(cells[2]).toHaveTextContent('62.98'); // Age (2 decimals)
    expect(cells[3]).toHaveTextContent('63,565'); // Wage Base (no $, with commas)
    expect(cells[4]).toHaveTextContent('2,605'); // Gross Earnings (no $, with commas)
    expect(cells[5]).toHaveTextContent('1,964.25'); // Adjusted Earnings (2 decimals)
  });

  it('formats totals correctly', async () => {
    renderWithRouter();
    
    const tables = await screen.findAllByRole('table');
    
    // Check Exhibit 1 totals
    const exhibit1Total = within(tables[0]).getByText('497,937.67');
    expect(exhibit1Total).toBeInTheDocument();
    
    // Check Exhibit 2 totals
    const exhibit2Total = within(tables[1]).getByText('82,272.32');
    expect(exhibit2Total).toBeInTheDocument();
  });

  it('shows present value column when applicable', async () => {
    // Add present value to mock data
    const mockResultsWithPV = {
      ...mockResults,
      exhibit1: {
        ...mockResults.exhibit1,
        data: {
          ...mockResults.exhibit1.data,
          total_present_value: 450000.00,
          rows: mockResults.exhibit1.data.rows.map(row => ({
            ...row,
            present_value: row.adjusted_earnings * 0.95
          }))
        }
      }
    };

    (analysisService.calculateAnalysis as any).mockResolvedValue({ data: mockResultsWithPV });
    
    renderWithRouter();
    
    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    
    // Check for present value column
    expect(headers[6]).toHaveTextContent(/\(7\).*Present Value/);
    
    // Check present value formatting in first row
    const firstRow = within(table).getAllByRole('row')[1];
    const cells = within(firstRow).getAllByRole('cell');
    const pvValue = parseFloat(cells[6].textContent!.replace(/,/g, ''));
    expect(pvValue).toBeGreaterThan(0);
    expect(cells[6].textContent).toMatch(/^\d{1,3}(,\d{3})*\.\d{2}$/);
  });
});