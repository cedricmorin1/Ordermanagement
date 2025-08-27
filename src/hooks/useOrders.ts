import { useState, useEffect } from 'react';
import { Order } from '../types';

const STORAGE_KEY = 'butchery_orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Sauvegarder les données dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }, [orders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
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
  };
};

export default useOrders;