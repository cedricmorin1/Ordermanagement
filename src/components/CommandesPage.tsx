import React, { useState } from 'react';
import { ArrowLeft, Users, Package, TrendingUp, List, BarChart3, Calendar } from 'lucide-react';
import { Order, WeekInfo } from '../types';
import OrderCard from './OrderCard';
import ProductSummary from './ProductSummary';

interface CommandesPageProps {
  selectedWeek: WeekInfo;
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
  onBack: () => void;
}

const CommandesPage: React.FC<CommandesPageProps> = ({ 
  selectedWeek, 
  orders, 
  onUpdateOrder, 
  onDeleteOrder, 
  onBack 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showProductSummary, setShowProductSummary] = useState(false);

  // Filter orders by selected date
  const filteredOrders = selectedDate 
    ? orders.filter(order => order.deliveryDate === selectedDate)
    : [];

  // Calculate statistics for selected date
  const totalProductsCount = filteredOrders.reduce((total, order) => {
    return total + order.products.length;
  }, 0);

  const completedProductsCount = filteredOrders.reduce((total, order) => {
    return total + order.products.filter(product => 
      (product.produced || 0) >= product.quantity
    ).length;
  }, 0);

  const remainingProducts = totalProductsCount - completedProductsCount;
  const progressPercentage = totalProductsCount > 0 
    ? Math.round((completedProductsCount / totalProductsCount) * 100)
    : 0;

  const totalCustomers = new Set(filteredOrders.map(order => order.customerName.toLowerCase())).size;

  const handleUpdateProductStatus = async (orderId: string, productId: string, produced: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updatedProducts = order.products.map(product =>
        product.id === productId ? { ...product, produced } : product
      );

      await onUpdateOrder(orderId, { products: updatedProducts });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      alert('Erreur lors de la mise à jour du produit');
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Commandes</h2>
            <p className="text-gray-600">Gestion des commandes par date</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {selectedDate && (
            <button
              onClick={() => setShowProductSummary(!showProductSummary)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              {showProductSummary ? (
                <>
                  <List className="w-5 h-5 mr-2" />
                  Voir commandes
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Résumé produits
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Sélectionner une date</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-2">
              Date de livraison
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {selectedDate && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Date sélectionnée</p>
              <p className="text-lg font-semibold text-blue-600 capitalize">
                {formatDateForDisplay(selectedDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Show content only when a date is selected */}
      {selectedDate ? (
        <>
          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Commandes</h3>
                  <p className="text-2xl font-bold text-blue-600">{filteredOrders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Clients</h3>
                  <p className="text-2xl font-bold text-green-600">{totalCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Produits total</h3>
                  <p className="text-2xl font-bold text-yellow-600">{totalProductsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Reste à faire</h3>
                  <p className="text-2xl font-bold text-red-600">{remainingProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Progression du jour</h3>
              <span className="text-lg font-bold text-gray-900">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  progressPercentage === 100 ? 'bg-green-500' : progressPercentage > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{completedProductsCount} produits terminés</span>
              <span>{remainingProducts} produits restants</span>
            </div>
          </div>

          {/* Main Content */}
          {showProductSummary ? (
            <ProductSummary
              orders={filteredOrders}
              onUpdateProductStatus={handleUpdateProductStatus}
            />
          ) : (
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande pour cette date
                  </h3>
                  <p className="text-gray-500">
                    Les commandes pour cette date apparaîtront ici une fois ajoutées.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdateOrder={onUpdateOrder}
                      onDeleteOrder={onDeleteOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sélectionnez une date
          </h3>
          <p className="text-gray-500">
            Choisissez une date dans le calendrier ci-dessus pour voir les commandes correspondantes.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommandesPage;
