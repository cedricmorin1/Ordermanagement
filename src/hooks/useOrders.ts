import { useState, useEffect } from 'react';
import { Order } from '../types';

const STORAGE_KEY = 'butchery_orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque changement
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
    }
  }, [orders, loading]);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    console.log('useOrders.addOrder called with:', orderData);
    
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Creating new order:', newOrder);
    
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders, newOrder];
      console.log('Orders updated, new count:', updatedOrders.length);
      return updatedOrders;
    });
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  const deleteOrder = (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    }
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    loading,
  };
};

export default useOrders;