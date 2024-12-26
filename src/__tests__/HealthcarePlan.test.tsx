import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HealthcarePlanPage from '../pages/HealthcarePlan';
import { healthcareService } from '../services/healthcareService';
import '@testing-library/jest-dom';

// Mock the healthcare service
jest.mock('../services/healthcareService');

const mockCategories = [
  {
    id: 1,
    name: 'Primary Care',
    description: 'Regular checkups',
    growth_rate: 0.03,
    frequency_years: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

const mockPlans = [
  {
    id: 1,
    analysis_id: 1,
    category: mockCategories[0],
    base_cost: 1000,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

describe('HealthcarePlan Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (healthcareService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
    (healthcareService.getPlans as jest.Mock).mockResolvedValue(mockPlans);
    (healthcareService.createPlan as jest.Mock).mockResolvedValue(mockPlans[0]);
    (healthcareService.togglePlan as jest.Mock).mockImplementation(async (analysisId, planId) => ({
      ...mockPlans[0],
      is_active: !mockPlans[0].is_active
    }));
    (healthcareService.deletePlan as jest.Mock).mockResolvedValue(undefined);
  });

  const renderComponent = () => {
    render(
      <MemoryRouter initialEntries={['/analyses/1/healthcare']}>
        <Routes>
          <Route path="/analyses/:analysisId/healthcare" element={<HealthcarePlanPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders healthcare plan page', async () => {
    renderComponent();
    
    // Check if the page title is rendered
    expect(await screen.findByText('Healthcare Plans')).toBeInTheDocument();
    
    // Check if the "Add New Healthcare Plan" form is rendered
    expect(screen.getByText('Add New Healthcare Plan')).toBeInTheDocument();
    
    // Check if the category dropdown is rendered
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Check if the base cost input is rendered
    expect(screen.getByLabelText(/Base Cost/i)).toBeInTheDocument();
  });

  test('loads and displays existing plans', async () => {
    renderComponent();
    
    // Wait for the plans to be loaded
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('3.0%')).toBeInTheDocument();
    });
    
    // Check if the toggle checkbox is rendered and checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  test('can add a new plan', async () => {
    renderComponent();
    
    // Fill out the form
    const categorySelect = screen.getByRole('combobox');
    const baseCostInput = screen.getByLabelText(/Base Cost/i);
    const addButton = screen.getByText('Add Plan');
    
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(baseCostInput, { target: { value: '2000' } });
    
    // Submit the form
    fireEvent.click(addButton);
    
    // Verify that createPlan was called with correct arguments
    await waitFor(() => {
      expect(healthcareService.createPlan).toHaveBeenCalledWith(1, {
        category_id: 1,
        base_cost: 2000,
        is_active: true
      });
    });
  });

  test('can toggle plan status', async () => {
    renderComponent();
    
    // Wait for the plans to be loaded
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
    
    // Find and click the toggle checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Verify that togglePlan was called
    await waitFor(() => {
      expect(healthcareService.togglePlan).toHaveBeenCalledWith(1, 1);
    });
  });

  test('can delete a plan', async () => {
    renderComponent();
    
    // Wait for the plans to be loaded
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
    
    // Find and click the delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Verify that deletePlan was called
    await waitFor(() => {
      expect(healthcareService.deletePlan).toHaveBeenCalledWith(1, 1);
    });
  });

  test('shows loading state', async () => {
    renderComponent();
    
    // Check if loading indicators are shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Healthcare Plans')).toBeInTheDocument();
    });
  });

  test('validates form inputs', async () => {
    renderComponent();
    
    // Try to submit without selecting category
    const addButton = screen.getByText('Add Plan');
    fireEvent.click(addButton);
    
    // Check for validation messages
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    
    // Try to submit with negative base cost
    const categorySelect = screen.getByRole('combobox');
    const baseCostInput = screen.getByLabelText(/Base Cost/i);
    
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(baseCostInput, { target: { value: '-1000' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('Base cost must be positive')).toBeInTheDocument();
  });

  test('handles API errors with specific messages', async () => {
    // Mock specific API errors
    (healthcareService.createPlan as jest.Mock).mockRejectedValue({
      response: {
        data: {
          base_cost: ['Base cost must be positive'],
          category: ['Invalid category']
        }
      }
    });
    
    renderComponent();
    
    // Fill form with valid data but expect API error
    const categorySelect = screen.getByRole('combobox');
    const baseCostInput = screen.getByLabelText(/Base Cost/i);
    const addButton = screen.getByText('Add Plan');
    
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(baseCostInput, { target: { value: '1000' } });
    fireEvent.click(addButton);
    
    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText('Base cost must be positive')).toBeInTheDocument();
      expect(screen.getByText('Invalid category')).toBeInTheDocument();
    });
  });

  test('calculates healthcare costs', async () => {
    (healthcareService.calculateCosts as jest.Mock).mockResolvedValue({
      costs: [
        { year: 2024, cost: 1000 },
        { year: 2025, cost: 1030 }
      ]
    });
    
    renderComponent();
    
    // Wait for plans to load
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
    
    // Click calculate button
    const calculateButton = screen.getByText('Calculate Costs');
    fireEvent.click(calculateButton);
    
    // Check if costs are displayed
    await waitFor(() => {
      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('2025')).toBeInTheDocument();
      expect(screen.getByText('$1,030')).toBeInTheDocument();
    });
  });

  test('handles plan update edge cases', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
    
    // Mock update with server error
    (healthcareService.togglePlan as jest.Mock).mockRejectedValueOnce(new Error('Server error'));
    
    // Try to toggle plan
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Failed to update plan')).toBeInTheDocument();
    });
    
    // Check checkbox state remains unchanged
    expect(checkbox).toBeChecked();
  });

  test('handles concurrent operations correctly', async () => {
    renderComponent();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
    
    // Setup delayed responses
    (healthcareService.togglePlan as jest.Mock)
      .mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({...mockPlans[0], is_active: false}), 100)
      ));
    
    // Trigger multiple toggles quickly
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    
    // Verify loading state is shown
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for operations to complete
    await waitFor(() => {
      expect(healthcareService.togglePlan).toHaveBeenCalledTimes(1);
    });
  });

  test('resets form after successful submission', async () => {
    renderComponent();
    
    // Fill out the form
    const categorySelect = screen.getByRole('combobox');
    const baseCostInput = screen.getByLabelText(/Base Cost/i);
    
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(baseCostInput, { target: { value: '2000' } });
    
    // Submit form
    const addButton = screen.getByText('Add Plan');
    fireEvent.click(addButton);
    
    // Wait for submission and check form reset
    await waitFor(() => {
      expect(categorySelect).toHaveValue('');
      expect(baseCostInput).toHaveValue('');
    });
  });

  test('validates category-specific rules', async () => {
    const categoryWithRules = {
      ...mockCategories[0],
      min_cost: 500,
      max_cost: 5000,
      requires_note: true
    };
    
    (healthcareService.getCategories as jest.Mock).mockResolvedValue([categoryWithRules]);
    renderComponent();
    
    // Fill form with invalid data
    const categorySelect = screen.getByRole('combobox');
    const baseCostInput = screen.getByLabelText(/Base Cost/i);
    const addButton = screen.getByText('Add Plan');
    
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(baseCostInput, { target: { value: '10000' } });
    fireEvent.click(addButton);
    
    // Check category-specific validation messages
    await waitFor(() => {
      expect(screen.getByText('Cost must be between $500 and $5,000')).toBeInTheDocument();
      expect(screen.getByText('Note is required for this category')).toBeInTheDocument();
    });
  });

  test('calculates costs with different growth rates', async () => {
    const plansWithDifferentRates = [
      {
        ...mockPlans[0],
        category: { ...mockCategories[0], growth_rate: 0.03 }
      },
      {
        ...mockPlans[0],
        id: 2,
        category: { ...mockCategories[0], name: 'Secondary Care', growth_rate: 0.05 }
      }
    ];
    
    (healthcareService.getPlans as jest.Mock).mockResolvedValue(plansWithDifferentRates);
    (healthcareService.calculateCosts as jest.Mock).mockResolvedValue({
      costs: [
        { year: 2024, cost: 2000 },
        { year: 2025, cost: 2110 }  // Combined growth from both plans
      ]
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
      expect(screen.getByText('Secondary Care')).toBeInTheDocument();
    });
    
    const calculateButton = screen.getByText('Calculate Costs');
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('$2,000')).toBeInTheDocument();
      expect(screen.getByText('$2,110')).toBeInTheDocument();
    });
  });

  test('handles network errors gracefully', async () => {
    // Mock network errors for different operations
    (healthcareService.getPlans as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    renderComponent();
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load healthcare data')).toBeInTheDocument();
    });
    
    // Check if retry button is available
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful retry
    (healthcareService.getPlans as jest.Mock).mockResolvedValueOnce(mockPlans);
    
    // Click retry
    fireEvent.click(retryButton);
    
    // Check if data loads successfully
    await waitFor(() => {
      expect(screen.getByText('Primary Care')).toBeInTheDocument();
    });
  });
});
