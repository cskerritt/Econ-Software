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
    
    if (!formData.evaluee) {
      newErrors.evaluee = 'Evaluee is required';
    }
    if (!formData.worklife_expectancy) {
      newErrors.worklife_expectancy = 'Worklife expectancy is required';
    }
    if (!formData.years_to_final_separation) {
      newErrors.years_to_final_separation = 'Years to final separation is required';
    }
    if (!formData.life_expectancy) {
      newErrors.life_expectancy = 'Life expectancy is required';
    }
    if (!formData.pre_injury_base_wage) {
      newErrors.pre_injury_base_wage = 'Pre-injury base wage is required';
    }
    if (!formData.post_injury_base_wage) {
      newErrors.post_injury_base_wage = 'Post-injury base wage is required';
    }
    if (!formData.growth_rate) {
      newErrors.growth_rate = 'Growth rate is required';
    }
    if (!formData.adjustment_factor) {
      newErrors.adjustment_factor = 'Adjustment factor is required';
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
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData: any = {
        ...formData,
        date_of_injury: formData.date_of_injury?.toISOString().split('T')[0],
        date_of_report: formData.date_of_report?.toISOString().split('T')[0],
      };

      if (id) {
        await analysisService.updateAnalysis(parseInt(id), submitData);
      } else {
        await analysisService.createAnalysis(submitData);
      }
      navigate('/analyses');
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to create analysis' }));
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
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}
        <Paper>
          <Box p={3}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Evaluee"
                    name="evaluee"
                    value={formData.evaluee}
                    onChange={handleInputChange('evaluee')}
                    required
                    error={!!errors.evaluee}
                    helperText={errors.evaluee}
                    inputProps={{
                      'data-testid': 'evaluee-select',
                      'aria-invalid': !!errors.evaluee
                    }}
                  >
                    <MenuItem value="">
                      <em>Select an evaluee</em>
                    </MenuItem>
                    {evaluees?.map((evaluee) => (
                      <MenuItem key={evaluee.id} value={evaluee.id}>
                        {evaluee.first_name} {evaluee.last_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Injury"
                      value={formData.date_of_injury}
                      onChange={handleDateChange('date_of_injury')}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          error: !!errors.date_of_injury,
                          helperText: errors.date_of_injury,
                          inputProps: { 'data-testid': 'date-of-injury-input' }
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
                      onChange={handleDateChange('date_of_report')}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          error: !!errors.date_of_report,
                          helperText: errors.date_of_report,
                          inputProps: { 'data-testid': 'date-of-report-input' }
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Worklife Expectancy (years)"
                    name="worklife_expectancy"
                    type="number"
                    value={formData.worklife_expectancy}
                    onChange={handleInputChange('worklife_expectancy')}
                    required
                    error={!!errors.worklife_expectancy}
                    helperText={errors.worklife_expectancy}
                    data-testid="worklife-expectancy-input"
                    aria-invalid={!!errors.worklife_expectancy}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Years to Final Separation"
                    name="years_to_final_separation"
                    type="number"
                    value={formData.years_to_final_separation}
                    onChange={handleInputChange('years_to_final_separation')}
                    required
                    error={!!errors.years_to_final_separation}
                    helperText={errors.years_to_final_separation}
                    data-testid="years-to-final-separation-input"
                    aria-invalid={!!errors.years_to_final_separation}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Life Expectancy (years)"
                    name="life_expectancy"
                    type="number"
                    value={formData.life_expectancy}
                    onChange={handleInputChange('life_expectancy')}
                    required
                    error={!!errors.life_expectancy}
                    helperText={errors.life_expectancy}
                    data-testid="life-expectancy-input"
                    aria-invalid={!!errors.life_expectancy}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pre-Injury Base Wage"
                    name="pre_injury_base_wage"
                    type="number"
                    value={formData.pre_injury_base_wage}
                    onChange={handleInputChange('pre_injury_base_wage')}
                    required
                    error={!!errors.pre_injury_base_wage}
                    helperText={errors.pre_injury_base_wage}
                    data-testid="pre-injury-base-wage-input"
                    aria-invalid={!!errors.pre_injury_base_wage}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Post-Injury Base Wage"
                    name="post_injury_base_wage"
                    type="number"
                    value={formData.post_injury_base_wage}
                    onChange={handleInputChange('post_injury_base_wage')}
                    required
                    error={!!errors.post_injury_base_wage}
                    helperText={errors.post_injury_base_wage}
                    data-testid="post-injury-base-wage-input"
                    aria-invalid={!!errors.post_injury_base_wage}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Growth Rate (%)"
                    name="growth_rate"
                    type="number"
                    value={formData.growth_rate}
                    onChange={handleInputChange('growth_rate')}
                    required
                    error={!!errors.growth_rate}
                    helperText={errors.growth_rate}
                    data-testid="growth-rate-input"
                    aria-invalid={!!errors.growth_rate}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Adjustment Factor"
                    name="adjustment_factor"
                    type="number"
                    value={formData.adjustment_factor}
                    onChange={handleInputChange('adjustment_factor')}
                    required
                    error={!!errors.adjustment_factor}
                    helperText={errors.adjustment_factor}
                    data-testid="adjustment-factor-input"
                    aria-invalid={!!errors.adjustment_factor}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Discount Rate (%)"
                    name="discount_rate"
                    type="number"
                    value={formData.discount_rate || ''}
                    onChange={handleInputChange('discount_rate')}
                    data-testid="discount-rate-input"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Health Insurance Base"
                    name="health_insurance_base"
                    type="number"
                    value={formData.health_insurance_base}
                    onChange={handleInputChange('health_insurance_base')}
                    data-testid="health-insurance-base-input"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Health Cost Inflation Rate (%)"
                    name="health_cost_inflation_rate"
                    type="number"
                    value={formData.health_cost_inflation_rate}
                    onChange={handleInputChange('health_cost_inflation_rate')}
                    data-testid="health-cost-inflation-rate-input"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pension Base"
                    name="pension_base"
                    type="number"
                    value={formData.pension_base}
                    onChange={handleInputChange('pension_base')}
                    data-testid="pension-base-input"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Pension Type"
                    name="pension_type"
                    value={formData.pension_type}
                    onChange={handleInputChange('pension_type')}
                    data-testid="pension-type-select"
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
