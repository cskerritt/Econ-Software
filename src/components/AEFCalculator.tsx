import { useState } from 'react';
import { AEFInputs, AEFSteps, AEFResult } from '../types/aef';

interface AEFCalculatorProps {
  onCalculate?: (result: AEFResult) => void;
  initialValues?: Partial<AEFInputs>;
  isLoading?: boolean;
}

const AEFCalculator: React.FC<AEFCalculatorProps> = ({ onCalculate, initialValues }) => {
  const [inputs, setInputs] = useState<AEFInputs>({
    base: initialValues?.base ?? 100,
    worklifeAdjustment: initialValues?.worklifeAdjustment ?? 85.7,
    unemploymentFactor: initialValues?.unemploymentFactor ?? 4.2,
    incomeTaxRate: initialValues?.incomeTaxRate ?? 22.0,
    personalConsumption: initialValues?.personalConsumption ?? 30.0,
    applyPersonalConsumption: initialValues?.applyPersonalConsumption ?? true,
    fringeBenefits: initialValues?.fringeBenefits ?? 23.5,
  });

  const [result, setResult] = useState<AEFSteps | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setInputs(prev => ({
        ...prev,
        [name]: checked,
      }));
      
      // Clear personal consumption errors when disabled
      if (!checked) {
        setErrors(prev => {
          const { personalConsumption, ...rest } = prev;
          return rest;
        });
      }
    } else {
      const numValue = value === '' ? 0 : parseFloat(value);
      setInputs(prev => ({
        ...prev,
        [name]: numValue
      }));

      // Validate the input immediately
      const fieldErrors: string[] = [];
      if (numValue < 0) {
        fieldErrors.push('Value cannot be negative');
      }
      if (name === 'personalConsumption' && numValue > 100) {
        fieldErrors.push('Personal consumption cannot exceed 100%');
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        if (fieldErrors.length > 0) {
          newErrors[name] = fieldErrors;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all inputs at once
    const newErrors: { [key: string]: string[] } = {};
    
    Object.entries(inputs).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const fieldErrors: string[] = [];
        
        if (value < 0) {
          fieldErrors.push('Value cannot be negative');
        }
        if (key === 'personalConsumption' && value > 100) {
          fieldErrors.push('Personal consumption cannot exceed 100%');
        }
        
        if (fieldErrors.length > 0) {
          newErrors[key] = fieldErrors;
        }
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      calculateAEF();
    }
  };

  const calculateAEF = () => {
    try {
      const base = inputs.base / 100;
      const wle = inputs.worklifeAdjustment / 100;
      const uf = inputs.unemploymentFactor / 100;
      const taxRate = inputs.incomeTaxRate / 100;
      const pc = inputs.applyPersonalConsumption ? inputs.personalConsumption / 100 : 0;
      const fb = 1 + (inputs.fringeBenefits / 100);

      const worklifeAdjusted = base * wle;
      const unemploymentAdjusted = worklifeAdjusted * (1 - uf);
      const taxAdjusted = unemploymentAdjusted * (1 - taxRate);
      const fringeBenefitsAdjusted = taxAdjusted * fb;
      const finalAEF = fringeBenefitsAdjusted * (1 - pc);

      const steps: AEFSteps = {
        worklifeAdjusted: worklifeAdjusted * 100,
        unemploymentAdjusted: unemploymentAdjusted * 100,
        taxAdjusted: taxAdjusted * 100,
        fringeBenefitsAdjusted: fringeBenefitsAdjusted * 100,
        finalAEF: finalAEF * 100
      };

      setResult(steps);
      if (onCalculate) {
        onCalculate({ inputs, steps });
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors(prev => ({
        ...prev,
        base: ['An error occurred during calculation']
      }));
    }
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6" role="form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2" htmlFor="base">
              Gross Earnings Base (%)
              <span className="text-red-500">*</span>
            </label>
            <input
              id="base"
              type="number"
              name="base"
              value={inputs.base}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="0.1"
              aria-invalid={!!errors.base}
              aria-describedby={errors.base ? 'base-error' : undefined}
            />
            {errors.base?.map((error, index) => (
              <p key={`base-error-${index}`} role="alert" id={`base-error-${index}`} className="text-red-500 text-sm mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block mb-2" htmlFor="worklifeAdjustment">
              Worklife Adjustment (%)
              <span className="text-red-500">*</span>
            </label>
            <input
              id="worklifeAdjustment"
              type="number"
              name="worklifeAdjustment"
              value={inputs.worklifeAdjustment}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="0.1"
              aria-invalid={!!errors.worklifeAdjustment}
              aria-describedby={errors.worklifeAdjustment ? 'worklifeAdjustment-error' : undefined}
            />
            {errors.worklifeAdjustment?.map((error, index) => (
              <p key={`worklifeAdjustment-error-${index}`} role="alert" id={`worklifeAdjustment-error-${index}`} className="text-red-500 text-sm mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block mb-2" htmlFor="unemploymentFactor">
              Unemployment Factor (%)
              <span className="text-red-500">*</span>
            </label>
            <input
              id="unemploymentFactor"
              type="number"
              name="unemploymentFactor"
              value={inputs.unemploymentFactor}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="0.1"
              aria-invalid={!!errors.unemploymentFactor}
              aria-describedby={errors.unemploymentFactor ? 'unemploymentFactor-error' : undefined}
            />
            {errors.unemploymentFactor?.map((error, index) => (
              <p key={`unemploymentFactor-error-${index}`} role="alert" id={`unemploymentFactor-error-${index}`} className="text-red-500 text-sm mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block mb-2" htmlFor="incomeTaxRate">
              Income Tax Rate (%)
              <span className="text-red-500">*</span>
            </label>
            <input
              id="incomeTaxRate"
              type="number"
              name="incomeTaxRate"
              value={inputs.incomeTaxRate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="0.1"
              aria-invalid={!!errors.incomeTaxRate}
              aria-describedby={errors.incomeTaxRate ? 'incomeTaxRate-error' : undefined}
            />
            {errors.incomeTaxRate?.map((error, index) => (
              <p key={`incomeTaxRate-error-${index}`} role="alert" id={`incomeTaxRate-error-${index}`} className="text-red-500 text-sm mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block mb-2" htmlFor="fringeBenefits">
              Fringe Benefits (%)
              <span className="text-red-500">*</span>
            </label>
            <input
              id="fringeBenefits"
              type="number"
              name="fringeBenefits"
              value={inputs.fringeBenefits}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="0.1"
              aria-invalid={!!errors.fringeBenefits}
              aria-describedby={errors.fringeBenefits ? 'fringeBenefits-error' : undefined}
            />
            {errors.fringeBenefits?.map((error, index) => (
              <p key={`fringeBenefits-error-${index}`} role="alert" id={`fringeBenefits-error-${index}`} className="text-red-500 text-sm mt-1">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="applyPersonalConsumption"
                checked={inputs.applyPersonalConsumption}
                onChange={handleInputChange}
                className="form-checkbox"
                aria-label="Apply Personal Consumption"
              />
              <span>Apply Personal Consumption</span>
            </label>
          </div>

          {inputs.applyPersonalConsumption && (
            <div>
              <label className="block mb-2" htmlFor="personalConsumption">
                Personal Consumption (%)
                <span className="text-red-500">*</span>
              </label>
              <input
                id="personalConsumption"
                type="number"
                name="personalConsumption"
                value={inputs.personalConsumption}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${!inputs.applyPersonalConsumption ? 'hidden' : ''}`}
                required={inputs.applyPersonalConsumption}
                step="0.1"
                aria-invalid={!!errors.personalConsumption}
                aria-describedby={errors.personalConsumption ? 'personalConsumption-error' : undefined}
              />
              {errors.personalConsumption?.map((error, index) => (
                <p key={`personalConsumption-error-${index}`} role="alert" id={`personalConsumption-error-${index}`} className="text-red-500 text-sm mt-1">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Calculate AEF
        </button>
      </form>

      {result && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg" role="region" aria-label="Calculation Results">
          <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Worklife Adjustment:</p>
              <p className="text-gray-600 ml-4">Base × (Worklife Adjustment)</p>
              <p className="text-gray-600 ml-4">{formatPercent(inputs.base)} × ({formatPercent(inputs.worklifeAdjustment)})</p>
              <p className="text-blue-600 ml-4" data-testid="worklife-result">= {formatPercent(result.worklifeAdjusted)}</p>
            </div>

            <div>
              <p className="font-medium">Unemployment Adjustment:</p>
              <p className="text-gray-600 ml-4">Worklife Adjusted × (1 - Unemployment Factor)</p>
              <p className="text-gray-600 ml-4">{formatPercent(result.worklifeAdjusted)} × (1 - {formatPercent(inputs.unemploymentFactor)})</p>
              <p className="text-blue-600 ml-4" data-testid="unemployment-result">= {formatPercent(result.unemploymentAdjusted)}</p>
            </div>

            <div>
              <p className="font-medium">Tax Adjustment:</p>
              <p className="text-gray-600 ml-4">Unemployment Adjusted × (1 - Tax Rate)</p>
              <p className="text-gray-600 ml-4">{formatPercent(result.unemploymentAdjusted)} × (1 - {formatPercent(inputs.incomeTaxRate)})</p>
              <p className="text-blue-600 ml-4" data-testid="tax-result">= {formatPercent(result.taxAdjusted)}</p>
            </div>

            <div>
              <p className="font-medium">Fringe Benefits Adjustment:</p>
              <p className="text-gray-600 ml-4">Tax Adjusted × (1 + Fringe Benefits)</p>
              <p className="text-gray-600 ml-4">{formatPercent(result.taxAdjusted)} × (1 + {formatPercent(inputs.fringeBenefits)})</p>
              <p className="text-blue-600 ml-4" data-testid="benefits-result">= {formatPercent(result.fringeBenefitsAdjusted)}</p>
            </div>

            {inputs.applyPersonalConsumption && (
              <div>
                <p className="font-medium">Personal Consumption Adjustment:</p>
                <p className="text-gray-600 ml-4">Fringe Benefits Adjusted × (1 - Personal Consumption)</p>
                <p className="text-gray-600 ml-4">{formatPercent(result.fringeBenefitsAdjusted)} × (1 - {formatPercent(inputs.personalConsumption)})</p>
                <p className="text-blue-600 ml-4" data-testid="final-result">= {formatPercent(result.finalAEF)}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-lg font-bold text-blue-600">
                Final AEF: {formatPercent(result.finalAEF)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AEFCalculator;