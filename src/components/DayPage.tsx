import React, { useState } from 'react';
import { ArrowLeft, Package, Users, TrendingUp, List, BarChart3 } from 'lucide-react';
import { Order } from '../types';
import OrderCard from './OrderCard';
import AddOrderModal from './AddOrderModal';
import ProductSummary from './ProductSummary';

interface DayPageProps {
  day: string;
  orders: Order[];
  onBack: () => void;
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
}

const DayPage: React.FC<DayPageProps> = ({
  day,
  orders,
  onBack,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
}) => {
  const [showProductSummary, setShowProductSummary] = useState(false);

  const dayLabels: { [key: string]: string } = {
    mercredi: 'Mercredi',
    jeudi: 'Jeudi',
    vendredi: 'Vendredi',
    samedi: 'Samedi',
  };

  const dayOrders = orders.filter(order => order.deliveryDay === day);

  const uniqueProducts = new Set();
  dayOrders.forEach(order => {
    order.products.forEach(product => {
      uniqueProducts.add(product.name.toLowerCase());
    });
  });

  const totalProducts = uniqueProducts.size;

  const totalRequiredQuantity = dayOrders.reduce((total, order) => {
    return total + order.products.reduce((orderTotal, product) => {
      return orderTotal + product.quantity;
    }, 0);
  }, 0);

  const completedProductsQuantity = dayOrders.reduce((total, order) => {
    return total + order.products.reduce((orderTotal, product) => {
      return orderTotal + (product.produced || 0);
    }, 0);
  }, 0);

  const remainingProducts = Math.max(0, totalRequiredQuantity - completedProductsQuantity);

  const progressPercentage = totalRequiredQuantity > 0 
    ? Math.round((completedProductsQuantity / totalRequiredQuantity) * 100)
    : 0;

  const totalCustomers = new Set(dayOrders.map(order => order.customerName.toLowerCase())).size;

  const handleUpdateProductStatus = (orderId: string, productId: string, produced: number) => {
    const order = dayOrders.find(o => o.id === orderId);
    if (!order) return;

    const updatedProducts = order.products.map(product => 
      product.id === productId ? { ...product, produced } : product
    );

    onUpdateOrder(orderId, { products: updatedProducts });
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
            <h2 className="text-3xl font-bold text-gray-900">{dayLabels[day]}</h2>
            <p className="text-gray-600">Gestion des commandes du jour</p>
          </div>
        </div>
        
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
              Récap produits
            </>
          )}
        </button>
      </div>

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Commandes</h3>
              <p className="text-2xl font-bold text-blue-600">{dayOrders.length}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{totalProducts}</p>
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

      {/* Barre de progression globale */}
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
          <span>{completedProductsQuantity} fabriqués</span>
          <span>{Math.max(0, remainingProducts)} restants</span>
        </div>
      </div>

      {/* Contenu principal */}
      {showProductSummary ? (
        <ProductSummary
          orders={dayOrders}
          onUpdateProductStatus={handleUpdateProductStatus}
        />
      ) : (
        <>
          {dayOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune commande pour {dayLabels[day].toLowerCase()}
              </h3>
              <p className="text-gray-500">
                Les commandes pour ce jour apparaîtront ici une fois ajoutées.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dayOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateOrder={onUpdateOrder}
                  onDeleteOrder={onDeleteOrder}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DayPage;