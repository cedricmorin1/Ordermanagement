import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import CommandesPage from './components/CommandesPage';
import AdminPage from './components/AdminPage';
import WeekSelector from './components/WeekSelector';
import { useOrders } from './hooks/useOrders';
import { WeekInfo } from './types';
import { getNext3Weeks } from './utils/dateUtils';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedWeek, setSelectedWeek] = useState<WeekInfo>(getNext3Weeks()[0]);
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    if (currentPage === 'home') {
      return (
        <HomePage 
          orders={orders}
          selectedWeek={selectedWeek}
          onNavigateToDay={handlePageChange}
          onAddOrder={addOrder}
          onWeekChange={setSelectedWeek}
        />
      );
    }

    if (currentPage === 'admin') {
      return (
        <AdminPage 
          onBack={() => handlePageChange('home')}
        />
      );
    }

    if (currentPage === 'commandes') {
      return (
        <CommandesPage
          selectedWeek={selectedWeek}
          orders={orders}
          onUpdateOrder={updateOrder}
          onDeleteOrder={deleteOrder}
          onBack={() => handlePageChange('home')}
        />
      );
    }

    return (
      <HomePage 
        orders={orders}
        selectedWeek={selectedWeek}
        onNavigateToDay={handlePageChange}
        onAddOrder={addOrder}
        onWeekChange={setSelectedWeek}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;