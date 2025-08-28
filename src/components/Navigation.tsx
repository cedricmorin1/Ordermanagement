import React from 'react';
import { Calendar, Home } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const pages = [
    { key: 'home', label: 'Accueil', icon: Home },
    { key: 'commandes', label: 'Commandes', icon: Calendar },
    { key: 'admin', label: 'Gestionnaire', icon: Home },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-red-600">Boucherie - Gestion Commandes</h1>
            </div>
            <div className="flex space-x-4">
              {pages.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => onPageChange(key)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === key
                      ? 'bg-red-100 text-red-700 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;