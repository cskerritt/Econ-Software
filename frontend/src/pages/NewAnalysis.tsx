import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EconomicAnalysis } from '../types/analysis';
import analysisService from '../services/analysisService';

const NewAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<EconomicAnalysis>>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    date_of_injury: '',
    date_of_report: '',
    worklife_expectancy: 0,
    years_to_final_separation: 0,
    life_expectancy: 0,
    pre_growth_rate: 0.042,  // 4.2%
    pre_aif: 0.754,         // 75.4%
    post_growth_rate: 0.042,
    post_aif: 0.754,
    pre_injury_rows: [],
    post_injury_rows: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await analysisService.create(formData as EconomicAnalysis);
      navigate(`/analysis/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">New Economic Analysis</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Date of Injury</label>
              <input
                type="date"
                name="date_of_injury"
                value={formData.date_of_injury}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Date of Report</label>
              <input
                type="date"
                name="date_of_report"
                value={formData.date_of_report}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Life Expectancy and Work Parameters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Life Expectancy & Work Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Worklife Expectancy (Years)</label>
              <input
                type="number"
                name="worklife_expectancy"
                step="0.01"
                value={formData.worklife_expectancy}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Years to Final Separation</label>
              <input
                type="number"
                name="years_to_final_separation"
                step="0.01"
                value={formData.years_to_final_separation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Life Expectancy (Years)</label>
              <input
                type="number"
                name="life_expectancy"
                step="0.01"
                value={formData.life_expectancy}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Growth Rates and Adjustment Factors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Growth Rates & Adjustment Factors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Pre-Injury Growth Rate (%)</label>
              <input
                type="number"
                name="pre_growth_rate"
                step="0.001"
                value={formData.pre_growth_rate ? formData.pre_growth_rate * 100 : ''}
                onChange={e => handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: e.target.name,
                    value: (parseFloat(e.target.value) / 100).toString()
                  }
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Pre-Injury AIF (%)</label>
              <input
                type="number"
                name="pre_aif"
                step="0.001"
                value={formData.pre_aif ? formData.pre_aif * 100 : ''}
                onChange={e => handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: e.target.name,
                    value: (parseFloat(e.target.value) / 100).toString()
                  }
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Post-Injury Growth Rate (%)</label>
              <input
                type="number"
                name="post_growth_rate"
                step="0.001"
                value={formData.post_growth_rate ? formData.post_growth_rate * 100 : ''}
                onChange={e => handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: e.target.name,
                    value: (parseFloat(e.target.value) / 100).toString()
                  }
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Post-Injury AIF (%)</label>
              <input
                type="number"
                name="post_aif"
                step="0.001"
                value={formData.post_aif ? formData.post_aif * 100 : ''}
                onChange={e => handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: e.target.name,
                    value: (parseFloat(e.target.value) / 100).toString()
                  }
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAnalysis;
