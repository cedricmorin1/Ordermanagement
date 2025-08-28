import { useState, useEffect } from 'react';
import { Order } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis l'API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Convertir les dates en strings pour correspondre au type Order
        const ordersWithStringDates = data.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt).toISOString()
        }));
        setOrders(ordersWithStringDates);
      } else {
        console.error('Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const newOrder = await response.json();
        const orderWithStringDate = {
          ...newOrder,
          createdAt: new Date(newOrder.createdAt).toISOString()
        };
        setOrders(prevOrders => [...prevOrders, orderWithStringDate]);
        return newOrder;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        const orderWithStringDate = {
          ...updatedOrder,
          createdAt: new Date(updatedOrder.createdAt).toISOString()
        };
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? orderWithStringDate : order
          )
        );
        return updatedOrder;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      throw error;
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