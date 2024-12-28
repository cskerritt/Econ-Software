import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisService } from '../services/analysisService';
import { format } from 'date-fns';
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
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

interface Analysis {
  id: number;
  evaluee: {
    id: number;
    first_name: string;
    last_name: string;
  };
  date_of_injury: string;
  date_of_report: string;
  created_at: string;
}

const AnalysesList: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await analysisService.getAnalyses();
        setAnalyses(response.data || []);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        setError('Failed to fetch analyses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/analysis/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/analysis/${id}`);
  };

  const handleExcelDownload = async (id: number) => {
    try {
      await analysisService.downloadExcel(id);
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  const handleWordDownload = async (id: number) => {
    try {
      await analysisService.downloadWord(id);
    } catch (error) {
      console.error('Error downloading Word:', error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Economic Analyses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/analysis/new"
        >
          NEW ANALYSIS
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading analyses...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : analyses.length === 0 ? (
        <Typography>No analyses found. Create a new analysis to get started.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Evaluee Name</TableCell>
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
                  <TableCell>
                    {analysis.evaluee?.first_name} {analysis.evaluee?.last_name}
                  </TableCell>
                  <TableCell>
                    {analysis.date_of_injury ? format(new Date(analysis.date_of_injury), 'MM/dd/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {analysis.date_of_report ? format(new Date(analysis.date_of_report), 'MM/dd/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {analysis.created_at ? format(new Date(analysis.created_at), 'MM/dd/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleView(analysis.id)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(analysis.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExcelDownload(analysis.id)}
                      >
                        Excel
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleWordDownload(analysis.id)}
                      >
                        Word
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AnalysesList;
