import { useState, useEffect } from 'react';
import { AdminProduct } from '../types';

const STORAGE_KEY = 'butchery_admin_products';

const DEFAULT_PRODUCTS: Omit<AdminProduct, 'id' | 'createdAt'>[] = [
  { name: 'Steak haché', defaultUnit: 'kg' },
  { name: 'Côtes de bœuf', defaultUnit: 'kg' },
  { name: 'Rôti de porc', defaultUnit: 'kg' },
  { name: 'Escalopes de veau', defaultUnit: 'kg' },
  { name: 'Saucisses', defaultUnit: 'kg' },
  { name: 'Merguez', defaultUnit: 'kg' },
  { name: 'Boudin noir', defaultUnit: 'kg' },
  { name: 'Pâté de campagne', defaultUnit: 'g' },
  { name: 'Andouillette', defaultUnit: 'pièce(s)' },
];

export const useAdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis localStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        if (parsedProducts && parsedProducts.length > 0) {
          setProducts(parsedProducts);
        } else {
          // Initialiser avec les produits par défaut seulement si aucun produit sauvegardé
          const defaultProducts = DEFAULT_PRODUCTS.map((product, index) => ({
            ...product,
            id: `admin_product_${Date.now()}_${index}`,
            createdAt: new Date().toISOString(),
          }));
          setProducts(defaultProducts);
        }
      } else {
        // Initialiser avec les produits par défaut
        const defaultProducts = DEFAULT_PRODUCTS.map((product, index) => ({
          ...product,
          id: `admin_product_${Date.now()}_${index}`,
          createdAt: new Date().toISOString(),
        }));
        setProducts(defaultProducts);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits admin:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque changement
  useEffect(() => {
    if (!loading && products.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des produits admin:', error);
      }
    }
  }, [products, loading]);

  const addProduct = (productData: Omit<AdminProduct, 'id' | 'createdAt'>) => {
    const newProduct: AdminProduct = {
      ...productData,
      id: `admin_product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (productId: string, updates: Partial<AdminProduct>) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
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