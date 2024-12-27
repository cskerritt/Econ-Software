import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { evalueeService } from '../services/evalueeService';
import { EvalueeFormData } from '../types/evaluee';

const sampleEvaluees: EvalueeFormData[] = [
  {
    first_name: "John",
    last_name: "Smith",
    date_of_birth: "1975-06-15",
    notes: "Construction worker, Union member with pension and health benefits"
  },
  {
    first_name: "Sarah",
    last_name: "Johnson",
    date_of_birth: "1982-03-22",
    notes: "Software Engineer at tech company, comprehensive benefits package"
  },
  {
    first_name: "Michael",
    last_name: "Davis",
    date_of_birth: "1968-11-30",
    notes: "Teacher with state pension and health plan"
  },
  {
    first_name: "Robert",
    last_name: "Martinez",
    date_of_birth: "1980-08-12",
    notes: "Electrician, IBEW member with union benefits"
  },
  {
    first_name: "Emily",
    last_name: "Chen",
    date_of_birth: "1990-04-25",
    notes: "Registered Nurse with hospital pension and benefits"
  },
  {
    first_name: "James",
    last_name: "Wilson",
    date_of_birth: "1972-09-18",
    notes: "Truck Driver with Teamsters pension and health plan"
  }
];

const EvalueeForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EvalueeFormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // First Name Validation
    if (!formData.first_name || !formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last Name Validation
    if (!formData.last_name || !formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    // Date of Birth Validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const minAge = 18; // Minimum age requirement
      const maxAge = 100; // Maximum age limit

      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < minAge) {
        newErrors.date_of_birth = `Must be at least ${minAge} years old`;
      } else if (age > maxAge) {
        newErrors.date_of_birth = `Age cannot exceed ${maxAge} years`;
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form fields
    const newErrors = validateForm();

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await evalueeService.create(formData);
      console.log('Created evaluee:', response);
      navigate('/');
    } catch (error) {
      console.error('Error creating evaluee:', error);
      setErrors({ submit: 'Failed to create evaluee' });
    }
  };

  const handleLoadSample = (sample: EvalueeFormData) => {
    setFormData(sample);
    setErrors({});
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Evaluee
        </Typography>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Load Sample Data
          </Typography>
          <Grid container spacing={2}>
            {sampleEvaluees.map((sample, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleLoadSample(sample)}
                  sx={{ textAlign: 'left', height: '100%' }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {sample.first_name} {sample.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {sample.notes}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                name="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                inputProps={{
                  'data-testid': 'first-name-input',
                  'aria-invalid': !!errors.first_name,
                  'aria-required': 'true'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                name="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                inputProps={{
                  'data-testid': 'last-name-input',
                  'aria-invalid': !!errors.last_name,
                  'aria-required': 'true'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="dateOfBirth"
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  'data-testid': 'date-of-birth-input',
                  'aria-invalid': !!errors.date_of_birth,
                  'aria-required': 'true',
                  max: new Date().toISOString().split('T')[0], // Prevent future dates
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
                error={!!errors.notes}
                helperText={errors.notes}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                aria-label="create evaluee"
              >
                CREATE EVALUEE
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EvalueeForm;
