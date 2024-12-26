import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import NewAnalysis from './pages/NewAnalysis';
import AnalysesList from './pages/AnalysesList';
import EvalueeList from './components/EvalueeList';
import EvalueeForm from './components/EvalueeForm';
import HealthcarePlan from './pages/HealthcarePlan';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Economic Analysis Calculator
          </Typography>
          <Button color="inherit" component={Link} to="/analyses">
            Analyses
          </Button>
          <Button color="inherit" component={Link} to="/evaluees">
            Evaluees
          </Button>
          <Button color="inherit" component={Link} to="/healthcare">
            Healthcare
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container>
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<AnalysesList />} />
            <Route path="/analyses" element={<AnalysesList />} />
            <Route path="/analysis/new" element={<NewAnalysis />} />
            <Route path="/analysis/:id" element={<NewAnalysis />} />
            <Route path="/analysis/:id/edit" element={<NewAnalysis />} />
            <Route path="/evaluees" element={<EvalueeList />} />
            <Route path="/evaluees/new" element={<EvalueeForm />} />
            <Route path="/evaluees/:id" element={<EvalueeForm />} />
            <Route path="/evaluees/:id/analysis/new" element={<NewAnalysis />} />
            <Route path="/healthcare" element={<HealthcarePlan />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
