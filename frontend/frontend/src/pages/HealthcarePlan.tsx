import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { healthcareService } from '../services/healthcareService';
import { HealthcareCategory, HealthcarePlan } from '../types/healthcare';

export default function HealthcarePlanPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [categories, setCategories] = useState<HealthcareCategory[]>([]);
  const [plans, setPlans] = useState<HealthcarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({
    category_id: '',
    base_cost: '',
  });

  useEffect(() => {
    loadData();
  }, [analysisId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, plansData] = await Promise.all([
        healthcareService.getCategories(),
        healthcareService.getPlans(Number(analysisId)),
      ]);
      setCategories(categoriesData);
      setPlans(plansData);
      setError(null);
    } catch (err) {
      setError('Failed to load healthcare data');
      console.error('Error loading healthcare data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      if (!newPlan.category_id || !newPlan.base_cost) {
        setError('Please fill in all fields');
        return;
      }

      await healthcareService.createPlan(Number(analysisId), {
        category_id: Number(newPlan.category_id),
        base_cost: Number(newPlan.base_cost),
        is_active: true,
      });

      setNewPlan({ category_id: '', base_cost: '' });
      await loadData();
      setError(null);
    } catch (err) {
      setError('Failed to add healthcare plan');
      console.error('Error adding healthcare plan:', err);
    }
  };

  const handleTogglePlan = async (planId: number) => {
    try {
      await healthcareService.togglePlan(Number(analysisId), planId);
      await loadData();
      setError(null);
    } catch (err) {
      setError('Failed to toggle healthcare plan');
      console.error('Error toggling healthcare plan:', err);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await healthcareService.deletePlan(Number(analysisId), planId);
      await loadData();
      setError(null);
    } catch (err) {
      setError('Failed to delete healthcare plan');
      console.error('Error deleting healthcare plan:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Healthcare Plans
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Add New Plan Form */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Healthcare Plan
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <TextField
                select
                label="Category"
                value={newPlan.category_id}
                onChange={(e) => setNewPlan({ ...newPlan, category_id: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Base Cost"
                type="number"
                value={newPlan.base_cost}
                onChange={(e) => setNewPlan({ ...newPlan, base_cost: e.target.value })}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddPlan}
              fullWidth
            >
              Add Plan
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Healthcare Plans Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Base Cost</TableCell>
              <TableCell>Growth Rate</TableCell>
              <TableCell>Frequency (Years)</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.category.name}</TableCell>
                <TableCell>${plan.base_cost.toLocaleString()}</TableCell>
                <TableCell>{(plan.category.growth_rate * 100).toFixed(1)}%</TableCell>
                <TableCell>{plan.category.frequency_years}</TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={plan.is_active}
                        onChange={() => handleTogglePlan(plan.id)}
                      />
                    }
                    label=""
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No healthcare plans added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
