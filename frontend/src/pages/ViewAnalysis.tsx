import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
} from '@mui/material';
import { analysisService, AnalysisResult } from '../services/analysisService';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

const ViewAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      if (!id) return;

      // Try to get from localStorage first
      const cached = localStorage.getItem(`analysis_${id}_result`);
      if (cached) {
        setResult(JSON.parse(cached));
        return;
      }

      // If not in localStorage, fetch from API
      try {
        const data = await analysisService.calculateAnalysis(Number(id));
        setResult(data.data);
        localStorage.setItem(`analysis_${id}_result`, JSON.stringify(data.data));
      } catch (error) {
        console.error('Failed to load analysis:', error);
      }
    };

    loadResult();
  }, [id]);

  const handleExportExcel = async () => {
    if (!id) return;
    try {
      await analysisService.downloadExcel(Number(id));
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const handleExportWord = async () => {
    if (!id) return;
    try {
      await analysisService.downloadWord(Number(id));
    } catch (error) {
      console.error('Failed to export Word:', error);
    }
  };

  if (!result) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Economic Analysis Report</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            sx={{ mr: 1 }}
          >
            Export to Excel
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportWord}
          >
            Export to Word
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Personal Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography><strong>Name:</strong> {result.personal_info.first_name} {result.personal_info.last_name}</Typography>
            <Typography><strong>Date of Birth:</strong> {formatDate(result.personal_info.date_of_birth)}</Typography>
            <Typography><strong>Date of Injury:</strong> {formatDate(result.personal_info.date_of_injury)}</Typography>
            <Typography><strong>Date of Report:</strong> {formatDate(result.personal_info.date_of_report)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography><strong>Age at Injury:</strong> {result.personal_info.age_at_injury.toFixed(1)} years</Typography>
            <Typography><strong>Current Age:</strong> {result.personal_info.current_age.toFixed(1)} years</Typography>
            <Typography><strong>Worklife Expectancy:</strong> {result.personal_info.worklife_expectancy} years</Typography>
            <Typography><strong>Life Expectancy:</strong> {result.personal_info.life_expectancy} years</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ p: 2 }}>{result.exhibit1.title}</Typography>
        <Typography variant="subtitle1" sx={{ px: 2 }}>{result.exhibit1.description}</Typography>
        <Typography sx={{ px: 2 }}>
          Growth Rate: {formatPercent(result.exhibit1.growth_rate)} | 
          Adjustment Factor: {formatPercent(result.exhibit1.adjustment_factor)}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Year</TableCell>
                <TableCell>Portion of Year</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Wage Base</TableCell>
                <TableCell>Gross Earnings</TableCell>
                <TableCell>Adjusted Earnings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.exhibit1.data.rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.portion_of_year.toFixed(2)}</TableCell>
                  <TableCell>{row.age.toFixed(1)}</TableCell>
                  <TableCell>{formatCurrency(row.wage_base_years)}</TableCell>
                  <TableCell>{formatCurrency(row.gross_earnings)}</TableCell>
                  <TableCell>{formatCurrency(row.adjusted_earnings)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right"><strong>Total Future Value:</strong></TableCell>
                <TableCell><strong>{formatCurrency(result.exhibit1.data.total_future_value)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper>
        <Typography variant="h5" sx={{ p: 2 }}>{result.exhibit2.title}</Typography>
        <Typography variant="subtitle1" sx={{ px: 2 }}>{result.exhibit2.description}</Typography>
        <Typography sx={{ px: 2 }}>
          Growth Rate: {formatPercent(result.exhibit2.growth_rate)} | 
          Adjustment Factor: {formatPercent(result.exhibit2.adjustment_factor)}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Year</TableCell>
                <TableCell>Portion of Year</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Wage Base</TableCell>
                <TableCell>Gross Earnings</TableCell>
                <TableCell>Adjusted Earnings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.exhibit2.data.rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.portion_of_year.toFixed(2)}</TableCell>
                  <TableCell>{row.age.toFixed(1)}</TableCell>
                  <TableCell>{formatCurrency(row.wage_base_years)}</TableCell>
                  <TableCell>{formatCurrency(row.gross_earnings)}</TableCell>
                  <TableCell>{formatCurrency(row.adjusted_earnings)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right"><strong>Total Future Value:</strong></TableCell>
                <TableCell><strong>{formatCurrency(result.exhibit2.data.total_future_value)}</strong></TableCell>
              </TableRow>
              {result.exhibit2.data.total_present_value !== null && (
                <TableRow>
                  <TableCell colSpan={5} align="right"><strong>Total Present Value:</strong></TableCell>
                  <TableCell><strong>{formatCurrency(result.exhibit2.data.total_present_value)}</strong></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ViewAnalysis;
