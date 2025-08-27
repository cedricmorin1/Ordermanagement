import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import DayPage from './components/DayPage';
import AdminPage from './components/AdminPage';
import WeekSelector from './components/WeekSelector';
import { useOrders } from './hooks/useOrders';
import { DeliveryDay, WeekInfo } from './types';
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
        <>
          <WeekSelector 
            weeks={getNext3Weeks()}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
          />
          <HomePage 
            orders={orders}
            selectedWeek={selectedWeek}
            onNavigateToDay={handlePageChange}
            onAddOrder={addOrder}
          />
        </>
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
        <>
          <WeekSelector 
            weeks={getNext3Weeks()}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
          />
          <DayPage
            day={currentPage as DeliveryDay}
            selectedWeek={selectedWeek}
            orders={orders}
            onAddOrder={addOrder}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
          />
        </>
      );
    }

    return (
      <>
        <WeekSelector 
          weeks={getNext3Weeks()}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
        />
        <HomePage 
          orders={orders}
          selectedWeek={selectedWeek}
          onNavigateToDay={handlePageChange}
          onAddOrder={addOrder}
        />
      </>
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