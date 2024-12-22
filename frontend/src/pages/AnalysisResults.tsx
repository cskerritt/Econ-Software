import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalculationResults } from '../types/analysis';
import analysisService from '../services/analysisService';

const AnalysisResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!id) throw new Error('No analysis ID provided');
        const data = await analysisService.calculate(parseInt(id));
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!results) return <div className="text-center p-8">No results found</div>;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatPercent = (value: number) => 
    `${value.toFixed(2)}%`;

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const renderPersonalInfo = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><span className="font-semibold">Name:</span> {results.personal_info.first_name} {results.personal_info.last_name}</p>
          <p><span className="font-semibold">Date of Birth:</span> {formatDate(results.personal_info.date_of_birth)}</p>
          <p><span className="font-semibold">Date of Injury:</span> {formatDate(results.personal_info.date_of_injury)}</p>
          <p><span className="font-semibold">Date of Report:</span> {formatDate(results.personal_info.date_of_report)}</p>
        </div>
        <div>
          <p><span className="font-semibold">Age at Injury:</span> {results.personal_info.age_at_injury.toFixed(2)} years</p>
          <p><span className="font-semibold">Current Age:</span> {results.personal_info.current_age.toFixed(2)} years</p>
          <p><span className="font-semibold">Worklife Expectancy:</span> {results.personal_info.worklife_expectancy.toFixed(2)} years</p>
          <p><span className="font-semibold">Retirement Date:</span> {formatDate(results.personal_info.retirement_date)}</p>
          <p><span className="font-semibold">Life Expectancy:</span> {results.personal_info.life_expectancy.toFixed(2)} years</p>
          <p><span className="font-semibold">Years to Final Separation:</span> {results.personal_info.years_to_final_separation.toFixed(2)} years</p>
        </div>
      </div>
    </div>
  );

  const renderPreInjuryTable = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-2">{results.exhibit1.title}</h2>
      <p className="mb-1">Future Growth Rate: {formatPercent(results.exhibit1.future_growth_rate)}</p>
      <p className="mb-4">{results.exhibit1.description}</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">(1) Year</th>
              <th className="border p-2">(2) Portion of Year</th>
              <th className="border p-2">(3) Age</th>
              <th className="border p-2">(4) Wage Base Years</th>
              <th className="border p-2">(5) Gross Earnings</th>
              <th className="border p-2">(6) Adjusted Earnings</th>
            </tr>
          </thead>
          <tbody>
            {results.exhibit1.data.rows.map((row, index) => (
              <tr key={index}>
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{formatPercent(row.portion_of_year)}</td>
                <td className="border p-2">{row.age.toFixed(2)}</td>
                <td className="border p-2">{formatCurrency(row.wage_base_years)}</td>
                <td className="border p-2">{formatCurrency(row.gross_earnings || 0)}</td>
                <td className="border p-2">{formatCurrency(row.adjusted_earnings || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={5} className="border p-2 text-right font-bold">Total Future Value:</td>
              <td className="border p-2 font-bold">
                {formatCurrency(results.exhibit1.data.total_future_value)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderPostInjuryTable = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-2">{results.exhibit2.title}</h2>
      <p className="mb-1">Future Growth Rate: {formatPercent(results.exhibit2.future_growth_rate)}</p>
      <p className="mb-4">{results.exhibit2.description}</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">(1) Year</th>
              <th className="border p-2">(2) Portion of Year</th>
              <th className="border p-2">(3) Age</th>
              <th className="border p-2">(4) Wage Base Years</th>
              <th className="border p-2">(5) Gross Earnings</th>
              <th className="border p-2">(6) Adjusted Earnings</th>
            </tr>
          </thead>
          <tbody>
            {results.exhibit2.data.rows.map((row, index) => (
              <tr key={index}>
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{formatPercent(row.portion_of_year)}</td>
                <td className="border p-2">{row.age.toFixed(2)}</td>
                <td className="border p-2">{formatCurrency(row.wage_base_years)}</td>
                <td className="border p-2">{formatCurrency(row.gross_earnings || 0)}</td>
                <td className="border p-2">{formatCurrency(row.adjusted_earnings || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={5} className="border p-2 text-right font-bold">Total Future Value:</td>
              <td className="border p-2 font-bold">
                {formatCurrency(results.exhibit2.data.total_future_value)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold text-center mb-8">Economic Analysis Results</h1>
      {renderPersonalInfo()}
      {renderPreInjuryTable()}
      {renderPostInjuryTable()}
    </div>
  );
};

export default AnalysisResults;
