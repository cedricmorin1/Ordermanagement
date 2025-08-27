import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Order, Product, DeliveryDay, WeekInfo } from '../types';
import { getDateForDayInWeek } from '../utils/dateUtils';
import { useAdminProducts } from '../hooks/useAdminProducts';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  defaultDay?: DeliveryDay;
  selectedWeek: WeekInfo;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddOrder,
  defaultDay,
  selectedWeek 
}) => {
  const { products: adminProducts } = useAdminProducts();
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryDay: defaultDay || 'mercredi' as DeliveryDay,
    notes: ''
  });

  const [products, setProducts] = useState<Omit<Product, 'id'>[]>([
    { name: '', quantity: 1, unit: 'kg', produced: 0 }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const units = ['kg', 'g', 'pièce(s)', 'tranche(s)'];

  const resetForm = () => {
    setOrderData({
      customerName: '',
      customerPhone: '',
      deliveryDay: defaultDay || 'mercredi',
      notes: ''
    });
    setProducts([{ name: '', quantity: 1, unit: 'kg', produced: 0 }]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 1, unit: 'kg', produced: 0 }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof Omit<Product, 'id'>, value: string | number) => {
    const updatedProducts = products.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!orderData.customerName.trim()) {
      newErrors.customerName = 'Le nom du client est requis';
    }

    if (!orderData.customerPhone.trim()) {
      newErrors.customerPhone = 'Le téléphone est requis';
    }

    products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_${index}_name`] = 'Le nom du produit est requis';
      }
      if (product.quantity <= 0) {
        newErrors[`product_${index}_quantity`] = 'La quantité doit être supérieure à 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted - START');
    console.log('orderData:', orderData);
    console.log('products:', products);
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    console.log('Validation passed');

    const deliveryDate = getDateForDayInWeek(selectedWeek.startDate, orderData.deliveryDay);
    console.log('Calculated deliveryDate:', deliveryDate);
    
    const newOrder: Omit<Order, 'id' | 'createdAt'> = {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryDay: orderData.deliveryDay,
      deliveryDate,
      notes: orderData.notes,
      products: products.map((product, index) => ({
        ...product,
        id: `product_${Date.now()}_${index}`,
      })),
    };

    console.log('About to call onAddOrder with:', newOrder);
    
    try {
      onAddOrder(newOrder);
      console.log('onAddOrder called successfully');
      handleClose();
      console.log('Modal closed');
    } catch (error) {
      console.error('Error calling onAddOrder:', error);
    }
  };

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Modal is open, rendering...');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle commande</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du client *
              </label>
              <input
                type="text"
                value={orderData.customerName}
                onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.customerName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nom du client"
              />
              {errors.customerName && (
                <p className="text-red-600 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={orderData.customerPhone}
                onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="06 00 00 00 00"
              />
              {errors.customerPhone && (
                <p className="text-red-600 text-sm mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jour de livraison
            </label>
            <select
              value={orderData.deliveryDay}
              onChange={(e) => setOrderData({ ...orderData, deliveryDay: e.target.value as DeliveryDay })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="mercredi">Mercredi</option>
              <option value="jeudi">Jeudi</option>
              <option value="vendredi">Vendredi</option>
              <option value="samedi">Samedi</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Produits commandés *
              </label>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter produit
              </button>
            </div>

            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={`product-${index}`} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit
                      </label>
                      <div className="relative">
                       <select
                         value={product.name || ""}
                         onChange={(e) => {
                           const selectedProductName = e.target.value;
                           const newProducts = [...products];
                           newProducts[index] = {
                             ...newProducts[index],
                             name: selectedProductName
                           };
                           
                           // Auto-select unit based on admin products
                           if (selectedProductName) {
                             const adminProduct = adminProducts.find(p => p.name === selectedProductName);
                             if (adminProduct) {
                               newProducts[index] = {
                                 ...newProducts[index],
                                 unit: adminProduct.defaultUnit
                               };
                             }
                           }
                           
                           setProducts(newProducts);
                         }}
                         className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                           errors[`product_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                         }`}
                       >
                         <option value="">Sélectionner un produit</option>
                         {adminProducts.map((prod) => (
                           <option key={prod.id} value={prod.name}>{prod.name}</option>
                         ))}
                       </select>
                      </div>
                      {errors[`product_${index}_name`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`product_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        required
                        placeholder="Quantité"
                        value={product.quantity === 0 ? '' : product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors[`product_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`product_${index}_quantity`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`product_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unité
                        </label>
                        <select
                          value={product.unit}
                          onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {units.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Notes supplémentaires, instructions spéciales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Button clicked - direct handler!');
                console.log('Current orderData:', orderData);
                console.log('Current products:', products);
                
                // Validation manuelle
                if (!orderData.customerName.trim()) {
                  console.log('Missing customer name');
                  return;
                }
                if (!orderData.customerPhone.trim()) {
                  console.log('Missing customer phone');
                  return;
                }
                if (products.length === 0 || !products[0].name.trim()) {
                  console.log('Missing product name');
                  return;
                }
                
                console.log('All validation passed, calling onAddOrder...');
                
                try {
                  console.log('selectedWeek:', selectedWeek);
                  
                  if (!selectedWeek || !selectedWeek.startDate) {
                    console.error('selectedWeek is undefined or missing startDate');
                    return;
                  }
                  
                  const deliveryDate = getDateForDayInWeek(selectedWeek.startDate, orderData.deliveryDay);
                  console.log('Calculated deliveryDate:', deliveryDate);
                  
                  const newOrder = {
                    customerName: orderData.customerName,
                    customerPhone: orderData.customerPhone,
                    deliveryDay: orderData.deliveryDay,
                    deliveryDate,
                    notes: orderData.notes,
                    products: products.map((product, index) => ({
                      ...product,
                      id: `product_${Date.now()}_${index}`,
                    })),
                  };
                  
                  console.log('Calling onAddOrder with:', newOrder);
                  onAddOrder(newOrder);
                  console.log('onAddOrder called, closing modal...');
                  handleClose();
                } catch (error) {
                  console.error('Error in order creation:', error);
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer la commande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;