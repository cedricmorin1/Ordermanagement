import React, { useState } from 'react';
import { Edit2, Phone, User, Package, Check, X, Plus } from 'lucide-react';
import { Order, Product } from '../types';

interface OrderCardProps {
  order: Order;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateOrder, onDeleteOrder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order>({ ...order });
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 1, unit: 'kg' });
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleSave = () => {
    onUpdateOrder(order.id, editingOrder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingOrder({ ...order });
    setIsEditing(false);
    setShowAddProduct(false);
    setNewProduct({ name: '', quantity: 1, unit: 'kg' });
  };

  const updateProductProduced = (productId: string, produced: number) => {
    const updatedProducts = order.products.map(product =>
      product.id === productId ? { ...product, produced } : product
    );
    onUpdateOrder(order.id, { products: updatedProducts });
  };

  const getTotalProgress = () => {
    const totalQuantity = order.products.reduce((sum, product) => sum + product.quantity, 0);
    const totalProduced = order.products.reduce((sum, product) => sum + product.produced, 0);
    return totalQuantity > 0 ? Math.round((totalProduced / totalQuantity) * 100) : 0;
  };

  const getStatusColor = (product: Product) => {
    if (product.produced >= product.quantity) return 'text-green-600 bg-green-100';
    if (product.produced > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (product: Product) => {
    if (product.produced >= product.quantity) return 'Terminé';
    if (product.produced > 0) return 'En cours';
    return 'À faire';
  };

  const addNewProduct = () => {
    if (!newProduct.name.trim() || newProduct.quantity <= 0) return;
    
    const productToAdd = {
      ...newProduct,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      produced: 0
    };
    
    setEditingOrder({
      ...editingOrder,
      products: [...editingOrder.products, productToAdd]
    });
    
    setNewProduct({ name: '', quantity: 1, unit: 'kg' });
    setShowAddProduct(false);
  };

  const removeProduct = (productId: string) => {
    setEditingOrder({
      ...editingOrder,
      products: editingOrder.products.filter(p => p.id !== productId)
    });
  };
  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
              <input
                type="text"
                value={editingOrder.customerName}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={editingOrder.customerPhone}
                onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editingOrder.notes || ''}
              onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Produits</label>
              <button
                type="button"
                onClick={() => setShowAddProduct(true)}
                className="inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {editingOrder.products.map((product, index) => (
                <div key={product.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Produit</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => {
                          const updatedProducts = editingOrder.products.map((p, i) =>
                            i === index ? { ...p, name: e.target.value } : p
                          );
                          setEditingOrder({ ...editingOrder, products: updatedProducts });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={product.quantity}
                        onChange={(e) => {
                          const updatedProducts = editingOrder.products.map((p, i) =>
                            i === index ? { ...p, quantity: parseFloat(e.target.value) || 1 } : p
                          );
                          setEditingOrder({ ...editingOrder, products: updatedProducts });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unité</label>
                      <select
                        value={product.unit}
                        onChange={(e) => {
                          const updatedProducts = editingOrder.products.map((p, i) =>
                            i === index ? { ...p, unit: e.target.value } : p
                          );
                          setEditingOrder({ ...editingOrder, products: updatedProducts });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="pièce(s)">pièce(s)</option>
                        <option value="tranche(s)">tranche(s)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Supprimer ce produit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {showAddProduct && (
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau produit</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nom du produit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                       value={newProduct.quantity || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: parseFloat(e.target.value) || 1 })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Quantité"
                       required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unité</label>
                      <select
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="pièce(s)">pièce(s)</option>
                        <option value="tranche(s)">tranche(s)</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-1">
                      <button
                        type="button"
                        onClick={addNewProduct}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Ajouter ce produit"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProduct(false);
                          setNewProduct({ name: '', quantity: 1, unit: 'kg' });
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="bg-red-100 p-2 rounded-full">
            <User className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Phone className="w-4 h-4 mr-1" />
              {order.customerPhone}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm text-gray-500">
            Progression: {getTotalProgress()}%
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
            title="Modifier la commande"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteOrder(order.id)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Supprimer la commande"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Produits commandés
        </h4>
        
        {order.products.map((product) => (
          <div key={product.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-medium text-gray-900">{product.name}</h5>
                <p className="text-sm text-gray-600">
                  Quantité: {product.quantity} {product.unit}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product)}`}>
                {getStatusText(product)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité fabriquée
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={product.produced}
                    onChange={(e) => updateProductProduced(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">/ {product.quantity} {product.unit}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Reste à faire
                </p>
                <p className={`text-lg font-bold ${
                  product.produced >= product.quantity ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.max(0, product.quantity - product.produced)} {product.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Notes:</strong> {order.notes}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Commande créée le {new Date(order.createdAt).toLocaleDateString('fr-FR')} à{' '}
        {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="bg-red-100 p-2 rounded-full">
            <User className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Phone className="w-4 h-4 mr-1" />
              {order.customerPhone}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right text-sm text-gray-500">
            Progression: {getTotalProgress()}%
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
            title="Modifier la commande"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteOrder(order.id)}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Supprimer la commande"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Produits commandés
        </h4>
        
        {order.products.map((product) => (
          <div key={product.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-medium text-gray-900">{product.name}</h5>
                <p className="text-sm text-gray-600">
                  Quantité: {product.quantity} {product.unit}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product)}`}>
                {getStatusText(product)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité fabriquée
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max={product.quantity}
                    value={product.produced}
                    onChange={(e) => updateProductProduced(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">/ {product.quantity} {product.unit}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Reste à faire
                </p>
                <p className={`text-lg font-bold ${
                  product.produced >= product.quantity ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.max(0, product.quantity - product.produced)} {product.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Notes:</strong> {order.notes}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Commande créée le {new Date(order.createdAt).toLocaleDateString('fr-FR')} à{' '}
        {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

export default OrderCard;