import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalculationResults, PreInjuryRow, PostInjuryRow } from '../types/analysis';
import { analysisService } from '../services/analysisService';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

interface DownloadState {
  excel: boolean;
  word: boolean;
}

const AnalysisResults: React.FC = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [isDownloading, setIsDownloading] = useState<DownloadState>({ excel: false, word: false });
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fetchResults = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      if (!id) throw new Error('No analysis ID provided');
      const analysisResult = await analysisService.getAnalysis(parseInt(id));
      
      // Only validate basic structure, let rendering errors propagate to error boundary
      if (!analysisResult || !analysisResult.personal_info) {
        throw new Error('Invalid analysis data structure');
      }
      
      setResults(analysisResult);
    } catch (err: any) {
      if (err.response) {
        setError({ 
          message: err.response.data.detail || 'An error occurred',
          status: err.response.status
        });
      } else if (err instanceof Error) {
        setError({ message: err.message || 'Error loading analysis results' });
      } else {
        setError({ message: 'An unexpected error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchResults();
  }, [id]);

  const handleDownload = async (type: keyof DownloadState): Promise<void> => {
    const downloadMethod = type === 'excel' ? analysisService.downloadExcel : analysisService.downloadWord;
    setDownloadError(null);
    setIsDownloading(prev => ({ ...prev, [type]: true }));
    
    try {
      if (!id) throw new Error('No analysis ID provided');
      await downloadMethod(parseInt(id));
    } catch (err) {
      setDownloadError(`Failed to download ${type === 'excel' ? 'Excel' : 'Word'} file`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [type]: false }));
    }
  };

  const formatCurrency = (value: number, decimals: number = 2): string => {
    const parts = value.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const formatPercent = (value: number, decimals: number = 2): string => 
    `${(value * 100).toFixed(decimals)}%`;

  const formatPortionOfYear = (value: number): string =>
    formatPercent(value, 0);

  const formatDate = (dateString: string): string => 
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const renderPersonalInfo = (results: CalculationResults): JSX.Element => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p data-testid="personal-info-name"><span className="font-semibold">Name:</span> {results.personal_info.first_name} {results.personal_info.last_name}</p>
          <p><span className="font-semibold">Date of Birth:</span> {formatDate(results.personal_info.date_of_birth)}</p>
          <p><span className="font-semibold">Date of Injury:</span> {formatDate(results.personal_info.date_of_injury)}</p>
          <p><span className="font-semibold">Date of Report:</span> {formatDate(results.personal_info.date_of_report)}</p>
        </div>
        <div>
          <p><span className="font-semibold">Age at Injury:</span> {results.personal_info.age_at_injury.toFixed(2)} years</p>
          <p><span className="font-semibold">Current Age:</span> {results.personal_info.current_age.toFixed(2)} years</p>
          <p><span className="font-semibold">Worklife Expectancy:</span> {results.personal_info.worklife_expectancy.toFixed(2)} years</p>
          <p><span className="font-semibold">Years to Final Separation:</span> {results.personal_info.years_to_final_separation.toFixed(2)} years</p>
          <p><span className="font-semibold">Life Expectancy:</span> {results.personal_info.life_expectancy.toFixed(2)} years</p>
          <p><span className="font-semibold">Retirement Date:</span> {formatDate(results.personal_info.retirement_date)}</p>
          <p><span className="font-semibold">Date of Death:</span> {formatDate(results.personal_info.date_of_death)}</p>
        </div>
      </div>
    </div>
  );

  const renderPreInjuryTable = (results: CalculationResults): JSX.Element => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-2" data-testid="exhibit1-header">Exhibit 1</h2>
      <p className="mb-1" data-testid="exhibit1-name">#{results.personal_info.first_name} {results.personal_info.last_name}</p>
      <p className="mb-1" data-testid="exhibit1-ref">#REF!</p>
      <p className="mb-1" data-testid="exhibit1-growth-rate">Future Growth Rate: {formatPercent(results.exhibit1.growth_rate)}</p>
      <p className="mb-4" data-testid="exhibit1-title">Pre-Trial Earnings</p>
      
      <div className="overflow-x-auto">
        <table role="table" className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr role="row">
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-year">(1)<br/>Year</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-portion">(2)<br/>Portion of<br/>Year</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-age">(3)<br/>Age</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-base">(4)<br/>Wage Base Years</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-gross">(5)<br/>Gross Earnings</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit1-col-adjusted">(6)<br/>Adjusted Earnings<br/>([5]x75.40%)</th>
              {results.exhibit1.data.total_present_value !== undefined && (
                <th role="columnheader" className="border p-2 text-left">(7)<br/>Present Value</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.exhibit1.data.rows.map((row: PreInjuryRow, index: number) => (
              <tr role="row" key={index}>
                <td role="cell" className="border p-2">{row.year}</td>
                <td role="cell" className="border p-2">{formatPortionOfYear(row.portion_of_year)}</td>
                <td role="cell" className="border p-2">{row.age.toFixed(2)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.wage_base_years, 0)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.gross_earnings || 0, 0)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.adjusted_earnings || 0, 2)}</td>
                {results.exhibit1.data.total_present_value !== undefined && (
                  <td role="cell" className="border p-2">{formatCurrency(row.present_value || 0, 2)}</td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr role="row" className="bg-gray-50 font-bold">
              <td role="cell" colSpan={6} className="border p-2 text-right" data-testid="exhibit1-total-future">Total Future Value</td>
              <td role="cell" className="border p-2">{formatCurrency(results.exhibit1.data.total_future_value, 2)}</td>
            </tr>
            {results.exhibit1.data.total_present_value !== undefined && (
              <tr role="row" className="bg-gray-50 font-bold">
                <td role="cell" colSpan={6} className="border p-2 text-right">Total Present Value</td>
                <td role="cell" className="border p-2">{formatCurrency(results.exhibit1.data.total_present_value, 2)}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderPostInjuryTable = (results: CalculationResults): JSX.Element => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-2" data-testid="exhibit2-header">Exhibit 2</h2>
      <p className="mb-1" data-testid="exhibit2-name">#{results.personal_info.first_name} {results.personal_info.last_name}</p>
      <p className="mb-1" data-testid="exhibit2-ref">#REF!</p>
      <p className="mb-4" data-testid="exhibit2-title">Post-Trial Earnings</p>
      
      <div className="overflow-x-auto">
        <table role="table" className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr role="row">
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-year">(1)<br/>Year</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-portion">(2)<br/>Portion of<br/>Year</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-age">(3)<br/>Age</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-base">(4)<br/>Wage Base Years</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-gross">(5)<br/>Gross Earnings</th>
              <th role="columnheader" className="border p-2 text-left" data-testid="exhibit2-col-adjusted">(6)<br/>Adjusted Earnings<br/>([5]x75.40%)</th>
              {results.exhibit2.data.total_present_value !== undefined && (
                <th role="columnheader" className="border p-2 text-left">(7)<br/>Present Value</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.exhibit2.data.rows.map((row: PostInjuryRow, index: number) => (
              <tr role="row" key={index}>
                <td role="cell" className="border p-2">{row.year}</td>
                <td role="cell" className="border p-2">{formatPortionOfYear(row.portion_of_year)}</td>
                <td role="cell" className="border p-2">{row.age.toFixed(2)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.wage_base_years, 0)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.gross_earnings || 0, 0)}</td>
                <td role="cell" className="border p-2">{formatCurrency(row.adjusted_earnings || 0, 2)}</td>
                {results.exhibit2.data.total_present_value !== undefined && (
                  <td role="cell" className="border p-2">{formatCurrency(row.present_value || 0, 2)}</td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr role="row" className="bg-gray-50 font-bold">
              <td role="cell" colSpan={6} className="border p-2 text-right" data-testid="exhibit2-total-future">Total Future Value</td>
              <td role="cell" className="border p-2">{formatCurrency(results.exhibit2.data.total_future_value, 2)}</td>
            </tr>
            {results.exhibit2.data.total_present_value !== undefined && (
              <tr role="row" className="bg-gray-50 font-bold">
                <td role="cell" colSpan={6} className="border p-2 text-right">Total Present Value</td>
                <td role="cell" className="border p-2">{formatCurrency(results.exhibit2.data.total_present_value, 2)}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );

  const ErrorFallback = ({ error }: FallbackProps): JSX.Element => (
    <div data-testid="error-boundary" className="text-center p-8 text-red-600">
      Something went wrong
    </div>
  );

  const renderContent = (): JSX.Element => {
    if (loading) {
      return <div className="text-center p-8">Loading...</div>;
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <div data-testid="error-message" className="text-red-600 mb-4">
            {error.message}
          </div>
          <button
            data-testid="retry-button"
            onClick={() => void fetchResults()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!results) {
      return <div className="text-center p-8">No results found</div>;
    }

    try {
      // Validate exhibit data before rendering
      if (!results.exhibit1?.data?.rows || !results.exhibit2?.data?.rows) {
        throw new Error('Failed to render analysis results');
      }
      
      return (
        <>
          <div className="flex justify-end mb-4 space-x-4">
            <button
              data-testid="download-excel"
              onClick={() => void handleDownload('excel')}
              disabled={isDownloading.excel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isDownloading.excel ? (
                <span data-testid="download-loading">Downloading...</span>
              ) : (
                'Download Excel'
              )}
            </button>
            <button
              data-testid="download-word"
              onClick={() => void handleDownload('word')}
              disabled={isDownloading.word}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isDownloading.word ? (
                <span data-testid="download-loading">Downloading...</span>
              ) : (
                'Download Word'
              )}
            </button>
          </div>
          {downloadError && (
            <div data-testid="download-error" className="text-red-600 mb-4">
              {downloadError}
            </div>
          )}
          <h1 className="text-2xl font-bold text-center mb-8">Economic Analysis Results</h1>
          {renderPersonalInfo(results)}
          {renderPreInjuryTable(results)}
          {renderPostInjuryTable(results)}
        </>
      );
    } catch (err) {
      throw new Error('Failed to render analysis results');
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="container mx-auto p-4 max-w-7xl">
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
};

export default AnalysisResults;
