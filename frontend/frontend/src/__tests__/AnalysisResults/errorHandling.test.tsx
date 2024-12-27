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
    getAnalysis: vi.fn(),
    downloadExcel: vi.fn(),
    downloadWord: vi.fn()
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

describe('Analysis Results - Error Handling and Downloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Handling', () => {
    test('handles 404 error', async () => {
      (analysisService.getAnalysis as Mock).mockRejectedValue({
        response: {
          status: 404,
          data: { detail: 'Analysis not found' }
        }
      });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Analysis not found');
      });
    });

    test('handles server error', async () => {
      (analysisService.getAnalysis as Mock).mockRejectedValue({
        response: {
          status: 500,
          data: { detail: 'Internal server error' }
        }
      });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Internal server error');
      });
    });

    test('handles network error', async () => {
      (analysisService.getAnalysis as Mock).mockRejectedValue(new Error('Network error'));
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Error loading analysis results');
      });
    });

    test('handles timeout error', async () => {
      // Simulate a timeout scenario
      (analysisService.getAnalysis as Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Request timed out'));
          }, 10000); // Simulate a long-running request
        });
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Request timed out');
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    test('provides retry functionality', async () => {
      // First call fails
      (analysisService.getAnalysis as Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        // Second call succeeds
        .mockResolvedValueOnce(mockAnalysis);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Error loading analysis results');
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      // Click retry button
      fireEvent.click(screen.getByTestId('retry-button'));

      // Check if data loads successfully after retry
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-name')).toHaveTextContent('John Doe');
      });

      // Verify getAnalysis was called twice
      expect(analysisService.getAnalysis).toHaveBeenCalledTimes(2);
    });

    test('handles partial data loading', async () => {
      const incompleteAnalysis = {
        ...mockAnalysis,
        personalInfo: null, // Simulate missing personal info
      };

      (analysisService.getAnalysis as Mock).mockResolvedValue(incompleteAnalysis);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('partial-data-warning')).toBeInTheDocument();
        expect(screen.getByTestId('partial-data-warning')).toHaveTextContent('Some data could not be loaded');
      });
    });

    test('shows error boundary for rendering errors', async () => {
      const analysisWithInvalidData = {
        ...mockAnalysis,
        exhibit1: null // This should cause a rendering error
      };

      (analysisService.getAnalysis as Mock).mockResolvedValue(analysisWithInvalidData);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('error-boundary')).toHaveTextContent('Something went wrong');
      });
    });
  });

  describe('Download Functionality', () => {
    test('handles successful downloads', async () => {
      (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
      (analysisService.downloadExcel as Mock).mockResolvedValue(undefined);
      (analysisService.downloadWord as Mock).mockResolvedValue(undefined);
      
      renderComponent();

      await waitFor(() => {
        const excelButton = screen.getByTestId('download-excel');
        const wordButton = screen.getByTestId('download-word');
        
        expect(excelButton).toBeInTheDocument();
        expect(wordButton).toBeInTheDocument();
        
        fireEvent.click(excelButton);
        expect(analysisService.downloadExcel).toHaveBeenCalledWith(1);
        
        fireEvent.click(wordButton);
        expect(analysisService.downloadWord).toHaveBeenCalledWith(1);
      });
    });

    test('handles download errors', async () => {
      (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
      (analysisService.downloadExcel as Mock).mockRejectedValue(new Error('Download failed'));
      
      renderComponent();

      await waitFor(() => {
        const excelButton = screen.getByTestId('download-excel');
        fireEvent.click(excelButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('download-error')).toHaveTextContent('Failed to download Excel file');
      });
    });

    test('disables download buttons during download', async () => {
      (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
      (analysisService.downloadExcel as Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderComponent();

      await waitFor(() => {
        const excelButton = screen.getByTestId('download-excel');
        fireEvent.click(excelButton);
        expect(excelButton).toBeDisabled();
      });

      // Wait for download to complete
      await waitFor(() => {
        const excelButton = screen.getByTestId('download-excel');
        expect(excelButton).not.toBeDisabled();
      });
    });

    test('shows loading indicator during download', async () => {
      (analysisService.getAnalysis as Mock).mockResolvedValue(mockAnalysis);
      (analysisService.downloadExcel as Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderComponent();

      await waitFor(() => {
        const excelButton = screen.getByTestId('download-excel');
        fireEvent.click(excelButton);
        expect(screen.getByTestId('download-loading')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId('download-loading')).not.toBeInTheDocument();
      });
    });
  });
});
