import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NewAnalysis from '../src/pages/NewAnalysis';
import { evalueeService } from '../src/services/evalueeService';
import { analysisService } from '../src/services/analysisService';
import type { CreateAnalysisData } from '../src/services/analysisService';

// Mock services
vi.mock('../src/services/evalueeService');
vi.mock('../src/services/analysisService');

const mockEvaluees = [
  { id: 1, first_name: 'John', last_name: 'Doe', date_of_birth: '1990-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', date_of_birth: '1985-06-15' }
];

const mockAnalysisData: CreateAnalysisData = {
  evaluee: 1,
  date_of_injury: '2023-01-01',
  date_of_report: '2024-01-01',
  worklife_expectancy: 20,
  years_to_final_separation: 15,
  life_expectancy: 80,
  pre_injury_base_wage: 50000,
  post_injury_base_wage: 30000,
  growth_rate: 0.03,
  adjustment_factor: 0.75,
  apply_discounting: false,
  discount_rate: null,
  include_health_insurance: false,
  health_insurance_base: 0,
  health_cost_inflation_rate: 0,
  include_pension: false,
  pension_type: 'none',
  pension_base: 0,
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('NewAnalysis Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (evalueeService.getAll as any).mockResolvedValue(mockEvaluees);
  });

  it('renders loading state initially', async () => {
    renderWithProviders(<NewAnalysis />);
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for evaluees to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('loads and displays evaluee options', async () => {
    renderWithProviders(<NewAnalysis />);

    // Wait for evaluee select to be populated
    await waitFor(() => {
      const evalueeSelect = screen.getByLabelText(/evaluee/i);
      expect(evalueeSelect).toBeInTheDocument();
    });

    // Open select dropdown
    const evalueeSelect = screen.getByLabelText(/evaluee/i);
    fireEvent.mouseDown(evalueeSelect);

    // Check options
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(<NewAnalysis />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/evaluee/i)).toBeInTheDocument();
    });

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /create analysis/i });
    await userEvent.click(submitButton);

    // Check validation errors
    await waitFor(() => {
      const evalueeSelect = screen.getByLabelText(/evaluee/i);
      expect(evalueeSelect).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(/evaluee is required/i)).toBeInTheDocument();
    });
  });

  it('handles form submission with valid data', async () => {
    (analysisService.createAnalysis as any).mockResolvedValueOnce({ data: { id: 1 } });
    
    renderWithProviders(<NewAnalysis />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/evaluee/i)).toBeInTheDocument();
    });

    // Fill form
    const evalueeSelect = screen.getByLabelText(/evaluee/i);
    fireEvent.mouseDown(evalueeSelect);
    await waitFor(() => {
      const option = screen.getByText('John Doe');
      fireEvent.click(option);
    });

    const dateOfInjury = screen.getByLabelText(/date of injury/i);
    await userEvent.type(dateOfInjury, '2023-01-01');

    const dateOfReport = screen.getByLabelText(/date of report/i);
    await userEvent.type(dateOfReport, '2024-01-01');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create analysis/i });
    await userEvent.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(analysisService.createAnalysis).toHaveBeenCalledWith(mockAnalysisData);
    });
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to create analysis';
    (analysisService.createAnalysis as any).mockRejectedValueOnce(new Error(errorMessage));
    
    renderWithProviders(<NewAnalysis />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/evaluee/i)).toBeInTheDocument();
    });

    // Fill form
    const evalueeSelect = screen.getByLabelText(/evaluee/i);
    fireEvent.mouseDown(evalueeSelect);
    await waitFor(() => {
      const option = screen.getByText('John Doe');
      fireEvent.click(option);
    });

    const dateOfInjury = screen.getByLabelText(/date of injury/i);
    await userEvent.type(dateOfInjury, '2023-01-01');

    const dateOfReport = screen.getByLabelText(/date of report/i);
    await userEvent.type(dateOfReport, '2024-01-01');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create analysis/i });
    await userEvent.click(submitButton);

    // Check error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles optional fields correctly', async () => {
    (analysisService.createAnalysis as any).mockResolvedValueOnce({ data: { id: 1 } });
    
    renderWithProviders(<NewAnalysis />);

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/evaluee/i)).toBeInTheDocument();
    });

    // Fill only required fields
    const evalueeSelect = screen.getByLabelText(/evaluee/i);
    fireEvent.mouseDown(evalueeSelect);
    await waitFor(() => {
      const option = screen.getByText('John Doe');
      fireEvent.click(option);
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create analysis/i });
    await userEvent.click(submitButton);

    // Verify submission with only required fields
    const expectedData: CreateAnalysisData = {
      ...mockAnalysisData,
      evaluee: 1,
      date_of_injury: undefined,
      date_of_report: undefined,
    };

    await waitFor(() => {
      expect(analysisService.createAnalysis).toHaveBeenCalledWith(expectedData);
    });
  });
});