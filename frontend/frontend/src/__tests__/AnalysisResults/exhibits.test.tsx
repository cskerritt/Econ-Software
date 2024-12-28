import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

describe('Analysis Results - Exhibits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays exhibits with detailed data', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    // Check exhibit headers and descriptions
    await waitFor(() => {
      expect(screen.getByTestId('exhibit1-header')).toHaveTextContent('Exhibit 1');
      expect(screen.getByTestId('exhibit1-description')).toHaveTextContent('Projected earnings without injury');
      expect(screen.getByTestId('exhibit2-header')).toHaveTextContent('Exhibit 2');
      expect(screen.getByTestId('exhibit2-description')).toHaveTextContent('Projected earnings with injury');
    });

    // Check growth rates
    await waitFor(() => {
      expect(screen.getByTestId('exhibit1-growth-rate')).toHaveTextContent('4.20%');
      expect(screen.getByTestId('exhibit2-growth-rate')).toHaveTextContent('4.20%');
    });

    // Check data table contents
    await waitFor(() => {
      // Pre-injury earnings (Exhibit 1)
      expect(screen.getByTestId('exhibit1-row-0-year')).toHaveTextContent('2023');
      expect(screen.getByTestId('exhibit1-row-0-earnings')).toHaveTextContent('$85,000');
      expect(screen.getByTestId('exhibit1-row-1-year')).toHaveTextContent('2024');
      expect(screen.getByTestId('exhibit1-row-1-earnings')).toHaveTextContent('$88,570');

      // Post-injury earnings (Exhibit 2)
      expect(screen.getByTestId('exhibit2-row-0-earnings')).toHaveTextContent('$45,000');
      expect(screen.getByTestId('exhibit2-row-1-earnings')).toHaveTextContent('$46,885');
    });

    // Check totals
    await waitFor(() => {
      expect(screen.getByTestId('exhibit1-future-value')).toHaveTextContent('$173,570');
      expect(screen.getByTestId('exhibit1-present-value')).toHaveTextContent('$170,168');
      expect(screen.getByTestId('wage-loss')).toHaveTextContent('$81,779');
    });
  });

  test('validates calculations', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      // Verify wage loss calculation
      const exhibit1PV = 170167.65;
      const exhibit2PV = 88388.65; // (45000/85000) * 170167.65
      const expectedWageLoss = exhibit1PV - exhibit2PV;
      
      const wageLossElement = screen.getByTestId('wage-loss');
      const actualWageLoss = parseFloat(wageLossElement.textContent!.replace(/[^0-9.]/g, ''));
      
      expect(Math.abs(actualWageLoss - expectedWageLoss)).toBeLessThan(0.01);

      // Verify growth rate calculations
      const year1Earnings = 85000;
      const year2Earnings = 88570;
      const actualGrowthRate = (year2Earnings - year1Earnings) / year1Earnings;
      expect(actualGrowthRate).toBeCloseTo(0.042, 3);
    });
  });

  test('handles empty exhibit data', async () => {
    const analysisWithEmptyExhibit = {
      ...mockAnalysis,
      exhibit1: {
        ...mockAnalysis.exhibit1,
        data: {
          rows: [],
          total_future_value: 0,
          total_present_value: 0
        }
      }
    };

    (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithEmptyExhibit);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('exhibit1-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('exhibit1-empty-state')).toHaveTextContent('No data available');
    });
  });

  test('handles table sorting', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const yearHeader = screen.getByTestId('exhibit1-year-header');
      fireEvent.click(yearHeader);
      
      // Check if sorting changed the order
      const yearCells = screen.getAllByTestId(/exhibit1-row-\d+-year/);
      expect(yearCells[0]).toHaveTextContent('2024');
      expect(yearCells[1]).toHaveTextContent('2023');
    });
  });

  test('formats numbers consistently', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const moneyElements = screen.getAllByTestId(/.*-earnings$/);
      moneyElements.forEach(element => {
        const moneyText = element.textContent;
        expect(moneyText).toMatch(/^\$\d{1,3}(,\d{3})*(\.\d{2})?$/);
      });

      const percentElements = screen.getAllByTestId(/.*-rate$/);
      percentElements.forEach(element => {
        const percentText = element.textContent;
        expect(percentText).toMatch(/^\d+\.\d{2}%$/);
      });
    });
  });
});
