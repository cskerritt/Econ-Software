import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, beforeEach, test, expect, vi, Mock } from 'vitest';
import AnalysisResults from '../../pages/AnalysisResults';
import { analysisService } from '../../services/analysisService';
import '@testing-library/jest-dom';
import { mockExhibitData } from './mockData';

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

describe('Analysis Results - Loading States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state initially', () => {
    (analysisService.getAnalysis as Mock).mockResolvedValue(mockExhibitData);
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles loading state transitions', async () => {
    (analysisService.getAnalysis as Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockExhibitData), 100))
    );
    
    renderComponent();
    
    // Initial loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Transition to loaded state
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('analysis-content')).toBeInTheDocument();
    });
  });
});
