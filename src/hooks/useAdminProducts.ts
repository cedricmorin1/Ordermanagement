import { useState, useEffect } from 'react';
import { AdminProduct } from '../types';


export const useAdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis l'API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin-products');
      if (response.ok) {
        const data = await response.json();
        // Convertir les dates en strings pour correspondre au type AdminProduct
        const productsWithStringDates = data.map((product: any) => ({
          ...product,
          createdAt: new Date(product.createdAt).toISOString()
        }));
        setProducts(productsWithStringDates);
      } else {
        console.error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<AdminProduct, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        const productWithStringDate = {
          ...newProduct,
          createdAt: new Date(newProduct.createdAt).toISOString()
        };
        setProducts(prevProducts => [...prevProducts, productWithStringDate]);
        return newProduct;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<AdminProduct>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin-products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const productWithStringDate = {
          ...updatedProduct,
          createdAt: new Date(updatedProduct.createdAt).toISOString()
        };
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId ? productWithStringDate : product
          )
        );
        return updatedProduct;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin-products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    loading,
  };
};