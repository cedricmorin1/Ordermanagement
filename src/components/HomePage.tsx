import React, { useState } from 'react';
import { Calendar, Package, Users, TrendingUp } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Order, WeekInfo } from '../types';
import { getDateForDayInWeek, getNext3Weeks } from '../utils/dateUtils';
import AddOrderModal from './AddOrderModal';

interface HomePageProps {
  orders: Order[];
  selectedWeek: WeekInfo;
  onNavigateToDay: (day: string) => void;
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onWeekChange: (week: WeekInfo) => void;
}

const HomePage: React.FC<HomePageProps> = ({ orders, selectedWeek, onNavigateToDay, onAddOrder, onWeekChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getOrdersByDay = (day: string) => {
    const targetDate = getDateForDayInWeek(selectedWeek.startDate, day as any);
    return orders.filter(order => 
      order.deliveryDay === day && order.deliveryDate === targetDate
    );
  };

  const getTotalProductsByDay = (day: string) => {
    const dayOrders = getOrdersByDay(day);
    return dayOrders.reduce((total, order) => {
      return total + order.products.length;
    }, 0);
  };

  const getCompletedProductsByDay = (day: string) => {
    const dayOrders = getOrdersByDay(day);
    return dayOrders.reduce((total, order) => {
      return total + order.products.filter(product => 
        (product.produced || 0) >= product.quantity
      ).length;
    }, 0);
  };

  const getProgressPercentage = (day: string) => {
    const dayOrders = getOrdersByDay(day);
    const totalProducts = dayOrders.reduce((total, order) => {
      return total + order.products.length;
    }, 0);
    const completedProducts = dayOrders.reduce((total, order) => {
      return total + order.products.filter(product => 
        (product.produced || 0) >= product.quantity
      ).length;
    }, 0);
    return totalProducts > 0 ? Math.round((completedProducts / totalProducts) * 100) : 0;
  };

  const getCompletedOrdersByDay = (day: string) => {
    const dayOrders = getOrdersByDay(day);
    return dayOrders.filter(order => 
      order.products.every(product => product.produced >= product.quantity)
    ).length;
  };

  const days = [
    { key: 'mercredi', label: 'Mercredi', color: 'bg-blue-500' },
    { key: 'jeudi', label: 'Jeudi', color: 'bg-green-500' },
    { key: 'vendredi', label: 'Vendredi', color: 'bg-yellow-500' },
    { key: 'samedi', label: 'Samedi', color: 'bg-red-500' },
  ];

  // Filter orders for selected week
  const weekOrders = orders.filter(order => {
    const orderDate = new Date(order.deliveryDate);
    const weekStart = new Date(selectedWeek.startDate);
    const weekEnd = new Date(selectedWeek.endDate);
    return orderDate >= weekStart && orderDate <= weekEnd;
  });

  const totalOrders = weekOrders.length;
  const totalCustomers = new Set(weekOrders.map(order => order.customerName.toLowerCase())).size;
  const uniqueProducts = new Set();
  weekOrders.forEach(order => {
    order.products.forEach(product => {
      uniqueProducts.add(product.name.toLowerCase());
    });
  });
  const totalProductsCount = weekOrders.reduce((total, order) => {
    return total + order.products.length;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
          <p className="text-gray-600">Vue d'ensemble de vos commandes de la semaine</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle commande
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Sélectionner une semaine</h3>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newStartDate = new Date(selectedWeek.startDate);
                newStartDate.setDate(newStartDate.getDate() - 7);
                const newEndDate = new Date(selectedWeek.endDate);
                newEndDate.setDate(newEndDate.getDate() - 7);
                
                const newWeek: WeekInfo = {
                  weekNumber: selectedWeek.weekNumber - 1,
                  startDate: newStartDate.toISOString().split('T')[0],
                  endDate: newEndDate.toISOString().split('T')[0],
                  label: `Semaine ${selectedWeek.weekNumber - 1}`
                };
                
                onWeekChange(newWeek);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              ←
            </button>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Semaine sélectionnée</p>
              <p className="text-lg font-semibold text-blue-600">{selectedWeek.label}</p>
              <p className="text-sm text-gray-500">
                {new Date(selectedWeek.startDate).toLocaleDateString('fr-FR')} - {new Date(selectedWeek.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <button
              onClick={() => {
                const newStartDate = new Date(selectedWeek.startDate);
                newStartDate.setDate(newStartDate.getDate() + 7);
                const newEndDate = new Date(selectedWeek.endDate);
                newEndDate.setDate(newEndDate.getDate() + 7);
                
                const newWeek: WeekInfo = {
                  weekNumber: selectedWeek.weekNumber + 1,
                  startDate: newStartDate.toISOString().split('T')[0],
                  endDate: newEndDate.toISOString().split('T')[0],
                  label: `Semaine ${selectedWeek.weekNumber + 1}`
                };
                
                onWeekChange(newWeek);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Commandes</h3>
              <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Clients uniques</h3>
              <p className="text-3xl font-bold text-green-600">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Produits total</h3>
              <p className="text-3xl font-bold text-yellow-600">{totalProductsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vue par jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {days.map(({ key, label, color }) => {
          const dayOrders = getOrdersByDay(key);
          const totalProducts = getTotalProductsByDay(key);
          const completedProducts = getCompletedProductsByDay(key);
          const progress = getProgressPercentage(key);
          
          return (
            <div
              key={key}
              onClick={() => onNavigateToDay(key)}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                <div className={`p-2 rounded-full ${color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                  <Calendar className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commandes</span>
                  <span className="text-sm font-semibold">{dayOrders.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Produits</span>
                  <span className="text-sm font-semibold">{totalProducts}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fabriqués</span>
                  <span className="text-sm font-semibold text-green-600">{completedProducts}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">À faire</span>
                  <span className="text-sm font-semibold text-red-600">{totalProducts - completedProducts}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commandes terminées</span>
                  <span className="text-sm font-semibold text-blue-600">{getCompletedOrdersByDay(key)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progression</span>
                    <span className="text-xs font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalOrders === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande pour le moment</h3>
          <p className="text-gray-500">Commencez par ajouter votre première commande en naviguant vers un jour spécifique.</p>
        </div>
      )}

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddOrder={onAddOrder}
      />
    </div>
  );
};

export default HomePage;