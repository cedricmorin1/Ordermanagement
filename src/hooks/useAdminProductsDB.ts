import { useState, useEffect } from 'react';
import { AdminProduct } from '../types';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const useAdminProductsDB = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis PostgreSQL
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await prisma.adminProduct.findMany({
        orderBy: { createdAt: 'asc' }
      });
      // Convertir les dates en strings pour correspondre au type AdminProduct
      const productsWithStringDates = data.map(product => ({
        ...product,
        createdAt: product.createdAt.toISOString()
      }));
      setProducts(productsWithStringDates);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    return () => {
      prisma.$disconnect();
    };
  }, []);

  const addProduct = async (productData: Omit<AdminProduct, 'id' | 'createdAt'>) => {
    try {
      // Vérifier si le produit existe déjà
      const existingProduct = await prisma.adminProduct.findUnique({
        where: { name: productData.name }
      });

      if (existingProduct) {
        throw new Error('Un produit avec ce nom existe déjà');
      }

      const newProduct = await prisma.adminProduct.create({
        data: productData
      });
      
      const productWithStringDate = {
        ...newProduct,
        createdAt: newProduct.createdAt.toISOString()
      };
      
      setProducts(prevProducts => [...prevProducts, productWithStringDate]);
      return newProduct;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<AdminProduct>) => {
    try {
      // Vérifier si le produit existe
      const existingProduct = await prisma.adminProduct.findUnique({
        where: { id: productId }
      });

      if (!existingProduct) {
        throw new Error('Produit non trouvé');
      }

      // Vérifier si un autre produit avec le même nom existe déjà
      if (updates.name) {
        const duplicateProduct = await prisma.adminProduct.findFirst({
          where: { 
            name: updates.name,
            id: { not: productId }
          }
        });

        if (duplicateProduct) {
          throw new Error('Un produit avec ce nom existe déjà');
        }
      }

      const updatedProduct = await prisma.adminProduct.update({
        where: { id: productId },
        data: updates
      });
      
      const productWithStringDate = {
        ...updatedProduct,
        createdAt: updatedProduct.createdAt.toISOString()
      };
      
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? productWithStringDate : product
        )
      );
      return updatedProduct;
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
      // Vérifier si le produit existe
      const productToDelete = await prisma.adminProduct.findUnique({
        where: { id: productId }
      });

      if (!productToDelete) {
        throw new Error('Produit non trouvé');
      }

      await prisma.adminProduct.delete({
        where: { id: productId }
      });
      
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
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
    refreshProducts: loadProducts,
  };
};
