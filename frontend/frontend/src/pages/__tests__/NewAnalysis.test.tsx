import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewAnalysis from '../NewAnalysis';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: undefined }),
    useLocation: () => ({ pathname: '/analysis/new' })
  };
});

// Mock services
vi.mock('../../services/evalueeService', () => ({
  evalueeService: {
    getAll: vi.fn(() => Promise.resolve([
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]))
  }
}));

vi.mock('../../services/analysisService', () => ({
  analysisService: {
    createAnalysis: vi.fn(() => Promise.resolve({
      id: 1,
      evaluee: 1,
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
      pension_base: 5000
    }))
  }
}));

describe('NewAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <NewAnalysis />
        </BrowserRouter>
      );
    });

    // Check for required fields
    expect(screen.getByTestId('evaluee-select')).toBeInTheDocument();
    expect(screen.getByTestId('worklife-expectancy-input')).toBeInTheDocument();
    expect(screen.getByTestId('years-to-final-separation-input')).toBeInTheDocument();
    expect(screen.getByTestId('life-expectancy-input')).toBeInTheDocument();
    expect(screen.getByTestId('pre-injury-base-wage-input')).toBeInTheDocument();
    expect(screen.getByTestId('post-injury-base-wage-input')).toBeInTheDocument();
    expect(screen.getByTestId('growth-rate-input')).toBeInTheDocument();
    expect(screen.getByTestId('adjustment-factor-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(
      <BrowserRouter>
        <NewAnalysis />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      const evalueeSelect = screen.getByTestId('evaluee-select');
      expect(evalueeSelect).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('successfully submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <NewAnalysis />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Select evaluee
    const evalueeSelect = screen.getByTestId('evaluee-select');
    fireEvent.mouseDown(evalueeSelect);

    // Wait for the select options to be available in the portal
    const option = await waitFor(() =>
      screen.getByRole('option', { name: /john doe/i })
    );
    fireEvent.click(option);

    // Fill in required number fields
    // Fill in required fields
    const requiredInputs = [
      'worklife-expectancy-input',
      'years-to-final-separation-input',
      'life-expectancy-input',
      'pre-injury-base-wage-input',
      'post-injury-base-wage-input',
      'growth-rate-input',
      'adjustment-factor-input'
    ];

    requiredInputs.forEach(testId => {
      const input = screen.getByTestId(testId);
      fireEvent.change(input, { target: { value: '10' } });
    });

    // Submit form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/analyses');
    });
  });
});
