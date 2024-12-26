import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { Analysis } from '../services/analysisService';
import { formatDate } from '../utils/formatters';

const AnalysisList: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const data = await analysisService.getAnalyses();
        setAnalyses(data.data);
      } catch (error) {
        console.error('Failed to fetch analyses:', error);
      }
    };

    fetchAnalyses();
  }, []);

  const handleView = async (id: number) => {
    try {
      const result = await analysisService.calculateAnalysis(id);
      // Store the result in localStorage for the view page
      localStorage.setItem(`analysis_${id}_result`, JSON.stringify(result));
      navigate(`/analysis/${id}`);
    } catch (error) {
      console.error('Failed to calculate analysis:', error);
    }
  };

  const handleExportExcel = async (id: number) => {
    try {
      await analysisService.downloadExcel(id);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const handleExportWord = async (id: number) => {
    try {
      await analysisService.downloadWord(id);
    } catch (error) {
      console.error('Failed to export Word:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Economic Analyses
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date of Injury</TableCell>
              <TableCell>Date of Report</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell>{analysis.id}</TableCell>
                <TableCell>{formatDate(analysis.date_of_injury)}</TableCell>
                <TableCell>{formatDate(analysis.date_of_report)}</TableCell>
                <TableCell>{formatDate(analysis.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleView(analysis.id)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleExportExcel(analysis.id)}
                    sx={{ mr: 1 }}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleExportWord(analysis.id)}
                  >
                    Word
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AnalysisList;
