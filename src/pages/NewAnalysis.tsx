import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { evalueeService } from '../services/evalueeService';
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Box,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Evaluee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

interface FormData {
  evaluee: number | '';
  date_of_injury: Date | null;
  date_of_report: Date | null;
  worklife_expectancy: number;
  years_to_final_separation: number;
  life_expectancy: number;
  pre_injury_base_wage: number;
  post_injury_base_wage: number;
  growth_rate: number;
  adjustment_factor: number;
  apply_discounting: boolean;
  discount_rate: number | null;
  include_health_insurance: boolean;
  health_insurance_base: number;
  health_cost_inflation_rate: number;
  include_pension: boolean;
  pension_type: string;
  pension_base: number;
}

const NewAnalysis: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluees, setEvaluees] = useState<Evaluee[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    evaluee: '',
    date_of_injury: null,
    date_of_report: null,
    worklife_expectancy: 0,
    years_to_final_separation: 0,
    life_expectancy: 0,
    pre_injury_base_wage: 0,
    post_injury_base_wage: 0,
    growth_rate: 0,
    adjustment_factor: 0,
    apply_discounting: false,
    discount_rate: null,
    include_health_insurance: false,
    health_insurance_base: 0,
    health_cost_inflation_rate: 0,
    include_pension: false,
    pension_type: 'defined_benefit',
    pension_base: 0,
  });

  useEffect(() => {
    const fetchEvaluees = async () => {
      try {
        const response = await evalueeService.getAll();
        setEvaluees(response);

        // Check if we're creating a new analysis for a specific evaluee
        const evalueeId = location.pathname.match(/\/evaluees\/(\d+)\/analysis\/new/);
        if (evalueeId) {
          setFormData(prev => ({
            ...prev,
            evaluee: parseInt(evalueeId[1])
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching evaluees:', error);
        setLoading(false);
      }
    };
    fetchEvaluees();
  }, [location.pathname]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      try {
        const response = await analysisService.getAnalysis(parseInt(id));
        setFormData({
          ...response.data,
          evaluee: response.data.evaluee.id,
          date_of_injury: response.data.date_of_injury ? new Date(response.data.date_of_injury) : null,
          date_of_report: response.data.date_of_report ? new Date(response.data.date_of_report) : null,
        });
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    };
    fetchAnalysis();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Evaluee Validation
    if (!formData.evaluee) {
      newErrors.evaluee = 'Evaluee is required';
    }

    // Date Validations
    if (!formData.date_of_injury) {
      newErrors.date_of_injury = 'Date of injury is required';
    } else {
      const injuryDate = new Date(formData.date_of_injury);
      const today = new Date();
      
      // Ensure date of injury is not in the future
      if (injuryDate > today) {
        newErrors.date_of_injury = 'Date of injury cannot be in the future';
      }
    }

    if (!formData.date_of_report) {
      newErrors.date_of_report = 'Date of report is required';
    } else {
      const reportDate = new Date(formData.date_of_report);
      const injuryDate = formData.date_of_injury ? new Date(formData.date_of_injury) : null;
      const today = new Date();
      
      // Ensure date of report is not in the future
      if (reportDate > today) {
        newErrors.date_of_report = 'Date of report cannot be in the future';
      }
      
      // Ensure date of report is after date of injury
      if (injuryDate && reportDate < injuryDate) {
        newErrors.date_of_report = 'Date of report must be after date of injury';
      }
    }

    // Numeric Field Validations
    const numericFields = [
      'worklife_expectancy', 
      'years_to_final_separation', 
      'life_expectancy', 
      'pre_injury_base_wage', 
      'post_injury_base_wage', 
      'growth_rate', 
      'adjustment_factor'
    ];

    numericFields.forEach(field => {
      const value = formData[field as keyof FormData];
      if (typeof value === 'number' && (value <= 0 || isNaN(value))) {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be a positive number`;
      }
    });

    // Optional but conditional field validations
    if (formData.apply_discounting && (formData.discount_rate === null || formData.discount_rate <= 0)) {
      newErrors.discount_rate = 'Discount rate must be a positive number when discounting is applied';
    }

    if (formData.include_health_insurance && formData.health_insurance_base <= 0) {
      newErrors.health_insurance_base = 'Health insurance base must be a positive number';
    }

    if (formData.include_health_insurance && formData.health_cost_inflation_rate <= 0) {
      newErrors.health_cost_inflation_rate = 'Health cost inflation rate must be a positive number';
    }

    if (formData.include_pension && formData.pension_base <= 0) {
      newErrors.pension_base = 'Pension base must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [field]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form and prevent submission if invalid
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        date_of_injury: formData.date_of_injury?.toISOString().split('T')[0],
        date_of_report: formData.date_of_report?.toISOString().split('T')[0],
      };

      const response = id 
        ? await analysisService.updateAnalysis(parseInt(id), payload)
        : await analysisService.createAnalysis(payload);

      navigate(`/analysis/${response.id}`);
    } catch (error) {
      console.error('Error submitting analysis:', error);
      // Add error handling logic here
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Analysis' : 'New Analysis'}
        </Typography>
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please correct the errors before submitting the form.
          </Alert>
        )}
        <Paper>
          <Box p={3}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    data-testid="evaluee-select"
                    select
                    fullWidth
                    label="Evaluee"
                    name="evaluee"
                    value={formData.evaluee}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        evaluee: value === '' ? '' : parseInt(value as string)
                      }));
                    }}
                    required
                    error={!!errors.evaluee}
                    helperText={errors.evaluee}
                    aria-invalid={!!errors.evaluee}
                  >
                    {evaluees.map((evaluee) => (
                      <MenuItem key={evaluee.id} value={evaluee.id}>
                        {`${evaluee.first_name} ${evaluee.last_name}`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Injury"
                      value={formData.date_of_injury}
                      onChange={(date) => setFormData(prev => ({ ...prev, date_of_injury: date }))}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.date_of_injury,
                          helperText: errors.date_of_injury,
                          inputProps: {
                            'aria-invalid': !!errors.date_of_injury
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Report"
                      value={formData.date_of_report}
                      onChange={(date) => setFormData(prev => ({ ...prev, date_of_report: date }))}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.date_of_report,
                          helperText: errors.date_of_report,
                          inputProps: {
                            'aria-invalid': !!errors.date_of_report
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Worklife Expectancy"
                    value={formData.worklife_expectancy}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      worklife_expectancy: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.worklife_expectancy}
                    helperText={errors.worklife_expectancy}
                    aria-invalid={!!errors.worklife_expectancy}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Years to Final Separation"
                    value={formData.years_to_final_separation}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      years_to_final_separation: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.years_to_final_separation}
                    helperText={errors.years_to_final_separation}
                    aria-invalid={!!errors.years_to_final_separation}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Life Expectancy"
                    value={formData.life_expectancy}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      life_expectancy: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.life_expectancy}
                    helperText={errors.life_expectancy}
                    aria-invalid={!!errors.life_expectancy}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pre-Injury Base Wage"
                    value={formData.pre_injury_base_wage}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pre_injury_base_wage: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.pre_injury_base_wage}
                    helperText={errors.pre_injury_base_wage}
                    aria-invalid={!!errors.pre_injury_base_wage}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Post-Injury Base Wage"
                    value={formData.post_injury_base_wage}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      post_injury_base_wage: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.post_injury_base_wage}
                    helperText={errors.post_injury_base_wage}
                    aria-invalid={!!errors.post_injury_base_wage}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Growth Rate"
                    value={formData.growth_rate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      growth_rate: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.growth_rate}
                    helperText={errors.growth_rate}
                    aria-invalid={!!errors.growth_rate}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Adjustment Factor"
                    value={formData.adjustment_factor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      adjustment_factor: parseFloat(e.target.value) 
                    }))}
                    required
                    error={!!errors.adjustment_factor}
                    helperText={errors.adjustment_factor}
                    aria-invalid={!!errors.adjustment_factor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Rate"
                    value={formData.discount_rate || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discount_rate: parseFloat(e.target.value) || null 
                    }))}
                    error={!!errors.discount_rate}
                    helperText={errors.discount_rate}
                    aria-invalid={!!errors.discount_rate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Health Insurance Base"
                    value={formData.health_insurance_base}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      health_insurance_base: parseFloat(e.target.value) 
                    }))}
                    error={!!errors.health_insurance_base}
                    helperText={errors.health_insurance_base}
                    aria-invalid={!!errors.health_insurance_base}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Health Cost Inflation Rate"
                    value={formData.health_cost_inflation_rate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      health_cost_inflation_rate: parseFloat(e.target.value) 
                    }))}
                    error={!!errors.health_cost_inflation_rate}
                    helperText={errors.health_cost_inflation_rate}
                    aria-invalid={!!errors.health_cost_inflation_rate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pension Base"
                    value={formData.pension_base}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pension_base: parseFloat(e.target.value) 
                    }))}
                    error={!!errors.pension_base}
                    helperText={errors.pension_base}
                    aria-invalid={!!errors.pension_base}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Pension Type"
                    name="pension_type"
                    value={formData.pension_type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      pension_type: e.target.value 
                    }))}
                    error={!!errors.pension_type}
                    helperText={errors.pension_type}
                    aria-invalid={!!errors.pension_type}
                  >
                    <MenuItem value="defined_benefit">Defined Benefit</MenuItem>
                    <MenuItem value="defined_contribution">Defined Contribution</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/analyses')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      data-testid="submit-button"
                    >
                      {id ? 'Update Analysis' : 'Create Analysis'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NewAnalysis;
