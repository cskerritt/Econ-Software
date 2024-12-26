import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Economic Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Analysis Card */}
        <Link to="/new" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">New Analysis</h2>
            <p className="text-gray-600">Create a new economic analysis report with detailed calculations.</p>
          </div>
        </Link>

        {/* AEF Calculator Card */}
        <Link to="/calculator" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">AEF Calculator</h2>
            <p className="text-gray-600">Calculate Adjusted Earnings Factor with customizable parameters.</p>
          </div>
        </Link>

        {/* Templates Card */}
        <Link to="/templates" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">Report Templates</h2>
            <p className="text-gray-600">Manage and create templates for economic analysis reports.</p>
          </div>
        </Link>
      </div>

      {/* Recent Analyses Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Recent Analyses</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">No recent analyses found.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
