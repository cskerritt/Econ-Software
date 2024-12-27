import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Add as AddIcon } from '@mui/icons-material';
import { Evaluee } from '../types/evaluee';
import { evalueeService } from '../services/evalueeService';

const EvalueeList: React.FC = () => {
  const [evaluees, setEvaluees] = useState<Evaluee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluees();
  }, []);

  const fetchEvaluees = async () => {
    try {
      const data = await evalueeService.getAll();
      setEvaluees(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch evaluees');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Evaluees
        </Typography>
        <Button
          component={Link}
          to="/evaluees/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          New Evaluees
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluees.map((evaluee) => (
              <TableRow key={evaluee.id}>
                <TableCell>
                  {evaluee.first_name} {evaluee.last_name}
                </TableCell>
                <TableCell>
                  {new Date(evaluee.date_of_birth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </TableCell>
                <TableCell>
                  {new Date(evaluee.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/evaluees/${evaluee.id}`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    component={Link}
                    to={`/evaluees/${evaluee.id}/analysis/new`}
                    variant="contained"
                    size="small"
                    color="primary"
                  >
                    New Analysis
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

export default EvalueeList;
