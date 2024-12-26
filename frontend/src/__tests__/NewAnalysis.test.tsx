import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewAnalysis from '../pages/NewAnalysis';
import { analysisService } from '../services/analysisService';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock the analysis service
jest.mock('../services/analysisService');

describe('NewAnalysis Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <NewAnalysis />
      </MemoryRouter>
    );
  };

  test('renders all form fields', () => {
    renderComponent();
    
    // Test presence of required fields
    expect(screen.getByLabelText(/evaluee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of injury/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of report/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/worklife expectancy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pre-injury base wage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/post-injury base wage/i)).toBeInTheDocument();
  });

  test('handles form submission correctly', async () => {
    const mockAnalysis = {
      id: 1,
      evaluee_id: 1,
      date_of_injury: '2023-01-01',
      date_of_report: '2023-12-31',
      worklife_expectancy: 20,
      pre_injury_base_wage: 50000,
      post_injury_base_wage: 30000
    };

    (analysisService.createAnalysis as jest.Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    // Fill out the form
    await userEvent.selectOptions(screen.getByLabelText(/evaluee/i), '1');
    await userEvent.type(screen.getByLabelText(/date of injury/i), '2023-01-01');
    await userEvent.type(screen.getByLabelText(/date of report/i), '2023-12-31');
    await userEvent.type(screen.getByLabelText(/worklife expectancy/i), '20');
    await userEvent.type(screen.getByLabelText(/pre-injury base wage/i), '50000');
    await userEvent.type(screen.getByLabelText(/post-injury base wage/i), '30000');

    // Submit the form
    fireEvent.click(screen.getByText(/create analysis/i));

    await waitFor(() => {
      expect(analysisService.createAnalysis).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  test('handles optional fields correctly', async () => {
    renderComponent();

    // Fill only required fields
    await userEvent.selectOptions(screen.getByTestId('evaluee-select'), '1');
    await userEvent.type(screen.getByTestId('date-of-injury'), '2023-01-01');
    await userEvent.type(screen.getByTestId('date-of-report'), '2023-12-31');

    // Submit form
    fireEvent.click(screen.getByText(/create analysis/i));

    await waitFor(() => {
      expect(analysisService.createAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          evaluee_id: '1',
          date_of_injury: '2023-01-01',
          date_of_report: '2023-12-31'
        })
      );
    });
  });

  test('displays validation errors', async () => {
    renderComponent();

    // Submit form without required fields
    fireEvent.click(screen.getByText(/create analysis/i));

    await waitFor(() => {
      expect(screen.getByText(/evaluee is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of injury is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of report is required/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (analysisService.createAnalysis as jest.Mock).mockRejectedValue(new Error('API Error'));
    renderComponent();

    // Fill required fields
    await userEvent.selectOptions(screen.getByTestId('evaluee-select'), '1');
    await userEvent.type(screen.getByTestId('date-of-injury'), '2023-01-01');
    await userEvent.type(screen.getByTestId('date-of-report'), '2023-12-31');

    // Submit form
    fireEvent.click(screen.getByText(/create analysis/i));

    await waitFor(() => {
      expect(screen.getByText(/error creating analysis/i)).toBeInTheDocument();
    });
  });
});
