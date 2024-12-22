import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/Home Link */}
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  to="/" 
                  className="text-xl font-bold text-gray-800 hover:text-gray-600"
                >
                  Economic Analysis
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/new"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-600"
                >
                  New Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Economic Analysis Calculator
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
