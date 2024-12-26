import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, beforeEach, test, expect, vi, Mock } from 'vitest';
import AnalysisResults from '../../pages/AnalysisResults';
import { analysisService } from '../../services/analysisService';
import '@testing-library/jest-dom';
import { mockAnalysis } from './mockData';

// Mock the analysis service
vi.mock('../../services/analysisService', () => ({
  analysisService: {
    getAnalysis: vi.fn()
  }
}));

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/analyses/1/results']}>
      <Routes>
        <Route path="/analyses/:id/results" element={<AnalysisResults />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Analysis Results - Healthcare Costs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays healthcare costs correctly', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('healthcare-costs-header')).toHaveTextContent('Healthcare Costs');
      
      // Check healthcare cost table
      expect(screen.getByTestId('healthcare-row-0-year')).toHaveTextContent('2023');
      expect(screen.getByTestId('healthcare-row-0-cost')).toHaveTextContent('$10,000');
      expect(screen.getByTestId('healthcare-row-1-year')).toHaveTextContent('2024');
      expect(screen.getByTestId('healthcare-row-1-cost')).toHaveTextContent('$10,300');
      
      // Check healthcare total
      expect(screen.getByTestId('healthcare-total')).toHaveTextContent('$20,300');
    });
  });

  test('validates healthcare cost calculations', async () => {
    const analysisWithInvalidHealthcare = {
      ...mockAnalysis,
      healthcare_costs: [
        {
          year: 2023,
          age: 43,
          cost: -1000  // Invalid negative cost
        },
        {
          year: 2024,
          age: 44,
          cost: null   // Invalid null cost
        }
      ]
    };

    (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithInvalidHealthcare);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('healthcare-error')).toBeInTheDocument();
      expect(screen.getByTestId('healthcare-error')).toHaveTextContent('Invalid healthcare costs detected');
    });
  });

  test('handles empty healthcare costs', async () => {
    const analysisWithNoHealthcare = {
      ...mockAnalysis,
      healthcare_costs: []
    };

    (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithNoHealthcare);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('healthcare-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('healthcare-empty-state')).toHaveTextContent('No healthcare costs available');
    });
  });

  test('displays healthcare costs with partial year', async () => {
    const analysisWithPartialYear = {
      ...mockAnalysis,
      healthcare_costs: [
        {
          year: 2023,
          age: 43,
          cost: 5000,
          portion_of_year: 0.5
        }
      ]
    };

    (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithPartialYear);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('healthcare-row-0-cost')).toHaveTextContent('$5,000');
      expect(screen.getByTestId('healthcare-row-0-portion')).toHaveTextContent('50%');
    });
  });

  test('validates healthcare cost totals', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const totalElement = screen.getByTestId('healthcare-total');
      const total = parseFloat(totalElement.textContent!.replace(/[^0-9.]/g, ''));
      
      // Sum up individual costs
      const costs = mockAnalysis.healthcare_costs.map(c => c.cost);
      const expectedTotal = costs.reduce((a, b) => a + b, 0);
      
      expect(total).toBe(expectedTotal);
    });
  });

  test('formats healthcare costs consistently', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const costElements = screen.getAllByTestId(/healthcare-row-\d+-cost/);
      costElements.forEach(element => {
        const costText = element.textContent;
        expect(costText).toMatch(/^\$\d{1,3}(,\d{3})*(\.\d{2})?$/);
      });
    });
  });

  test('displays healthcare costs in chronological order', async () => {
    const analysisWithUnorderedCosts = {
      ...mockAnalysis,
      healthcare_costs: [
        {
          year: 2024,
          age: 44,
          cost: 10300
        },
        {
          year: 2023,
          age: 43,
          cost: 10000
        }
      ]
    };

    (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithUnorderedCosts);
    renderComponent();

    await waitFor(() => {
      const yearElements = screen.getAllByTestId(/healthcare-row-\d+-year/);
      expect(yearElements[0]).toHaveTextContent('2023');
      expect(yearElements[1]).toHaveTextContent('2024');
    });
  });
});
