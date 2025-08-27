import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import DayPage from './components/DayPage';
import AdminPage from './components/AdminPage';
import { useOrders } from './hooks/useOrders';
import { DeliveryDay } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    if (currentPage === 'home') {
      return (
        <HomePage 
          orders={orders}
          onNavigateToDay={handlePageChange}
          onAddOrder={addOrder}
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

    const days: DeliveryDay[] = ['mercredi', 'jeudi', 'vendredi', 'samedi'];
    
    if (days.includes(currentPage as DeliveryDay)) {
      return (
        <DayPage
          day={currentPage as DeliveryDay}
          orders={orders}
          onAddOrder={addOrder}
          onUpdateOrder={updateOrder}
          onDeleteOrder={deleteOrder}
        />
      );
    }

    return <HomePage orders={orders} onNavigateToDay={handlePageChange} onAddOrder={addOrder} />;
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