import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResults from './pages/AnalysisResults';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Economic Analysis Calculator
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Calculate pre-injury and post-injury earnings based on worklife expectancy,
                growth rates, and adjustment factors.
              </p>
              <div className="space-y-4">
                <Link
                  to="/new"
                  className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start New Analysis
                </Link>
              </div>
            </div>
          } />
          <Route path="/new" element={<NewAnalysis />} />
          <Route path="/analysis/:id" element={<AnalysisResults />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
