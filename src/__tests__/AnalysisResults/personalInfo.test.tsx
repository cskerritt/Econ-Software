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

describe('Analysis Results - Personal Information', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays personal information correctly', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const nameElement = screen.getByTestId('personal-info-name');
      expect(nameElement).toHaveTextContent('John Doe');
    });

    await waitFor(() => {
      expect(screen.getByTestId('personal-info-dob')).toHaveTextContent('December 31, 1979');
      expect(screen.getByTestId('personal-info-injury-date')).toHaveTextContent('June 14, 2023');
      expect(screen.getByTestId('personal-info-report-date')).toHaveTextContent('December 31, 2023');
    });
  });

  test('displays analysis parameters correctly', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('worklife-expectancy')).toHaveTextContent('20.5');
      expect(screen.getByTestId('life-expectancy')).toHaveTextContent('82.3');
      expect(screen.getByTestId('pre-injury-wage')).toHaveTextContent('$85,000');
      expect(screen.getByTestId('post-injury-wage')).toHaveTextContent('$45,000');
      expect(screen.getByTestId('growth-rate')).toHaveTextContent('4.20%');
      expect(screen.getByTestId('discount-rate')).toHaveTextContent('2.00%');
    });
  });

  test('formats dates consistently', async () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
    renderComponent();

    await waitFor(() => {
      const dateElements = screen.getAllByTestId(/.*-date$/);
      dateElements.forEach(element => {
        const dateText = element.textContent;
        expect(dateText).toMatch(/^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/);
      });
    });
  });
});
