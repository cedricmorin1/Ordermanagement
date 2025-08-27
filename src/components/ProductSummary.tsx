import React from 'react';
import { Package, Check, X, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface ProductSummaryProps {
  orders: Order[];
  onUpdateProductStatus: (orderId: string, productId: string, produced: number) => void;
}

interface ProductSummaryItem {
  name: string;
  unit: string;
  normalizedUnit: string;
  totalQuantity: number;
  totalProduced: number;
  orders: Array<{
    orderId: string;
    productId: string;
    customerName: string;
    quantity: number;
    produced: number;
  }>;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ orders, onUpdateProductStatus }) => {
  // Grouper les produits par nom et unité
  const getProductSummary = (): ProductSummaryItem[] => {
    const productMap = new Map<string, ProductSummaryItem>();

    // Fonction pour normaliser les unités (convertir g en kg)
    const normalizeUnit = (quantity: number, unit: string): { quantity: number; unit: string } => {
      if (unit === 'g' && quantity >= 1000) {
        return { quantity: quantity / 1000, unit: 'kg' };
      }
      if (unit === 'g') {
        // Convertir en kg pour le groupement
        return { quantity: quantity / 1000, unit: 'kg' };
      }
      return { quantity, unit };
    };

    orders.forEach(order => {
      order.products.forEach(product => {
        const normalized = normalizeUnit(product.quantity, product.unit);
        const normalizedProduced = normalizeUnit(product.produced, product.unit);
        const key = `${product.name.toLowerCase()}-${normalized.unit}`;
        
        if (!productMap.has(key)) {
          productMap.set(key, {
            name: product.name,
            unit: normalized.unit,
            normalizedUnit: normalized.unit,
            totalQuantity: 0,
            totalProduced: 0,
            orders: []
          });
        }

        const summary = productMap.get(key)!;
        summary.totalQuantity += normalized.quantity;
        summary.totalProduced += normalizedProduced.quantity;
        summary.orders.push({
          orderId: order.id,
          productId: product.id,
          customerName: order.customerName,
          quantity: normalized.quantity,
          produced: normalizedProduced.quantity
        });
      });
    });

    // Trier : produits non terminés d'abord, puis terminés
    return Array.from(productMap.values()).sort((a, b) => {
      const aCompleted = a.totalProduced >= a.totalQuantity;
      const bCompleted = b.totalProduced >= b.totalQuantity;
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      return a.name.localeCompare(b.name);
    });
  };

  const productSummary = getProductSummary();

  const getStatusColor = (produced: number, total: number) => {
    if (produced >= total) return 'text-green-600 bg-green-100';
    if (produced > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (produced: number, total: number) => {
    if (produced >= total) return <Check className="w-4 h-4" />;
    if (produced > 0) return <AlertCircle className="w-4 h-4" />;
    return <X className="w-4 h-4" />;
  };

  const handleMarkAllComplete = (productSummary: ProductSummaryItem) => {
    productSummary.orders.forEach(order => {
      if (order.produced < order.quantity) {
        // Utiliser la quantité exacte de la commande
        const originalOrder = orders.find(o => o.id === order.orderId);
        const originalProduct = originalOrder?.products.find(p => p.id === order.productId);
        if (originalProduct) {
          onUpdateProductStatus(order.orderId, order.productId, originalProduct.quantity);
        }
      }
    });
  };

  const handleMarkAllIncomplete = (productSummary: ProductSummaryItem) => {
    productSummary.orders.forEach(order => {
      if (order.produced > 0) {
        onUpdateProductStatus(order.orderId, order.productId, 0);
      }
    });
  };

  const handleSetCustomQuantity = (productSummary: ProductSummaryItem, targetQuantity: number) => {
    let remainingToSet = targetQuantity;
    
    // Réinitialiser tout d'abord
    productSummary.orders.forEach(order => {
      onUpdateProductStatus(order.orderId, order.productId, 0);
    });
    
    // Puis distribuer la quantité demandée
    productSummary.orders.forEach(order => {
      if (remainingToSet <= 0) return;
      
      const toSet = Math.min(remainingToSet, order.quantity);
      onUpdateProductStatus(order.orderId, order.productId, toSet);
      remainingToSet -= toSet;
    });
  };

  if (productSummary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
        <p className="text-gray-500">Aucune commande pour ce jour.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Récapitulatif par produit
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {productSummary.map((product, index) => {
          const progress = product.totalQuantity > 0 
            ? Math.round((product.totalProduced / product.totalQuantity) * 100) 
            : 0;
          const remaining = product.totalQuantity - product.totalProduced;

          return (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(product.totalProduced, product.totalQuantity)}`}>
                    {getStatusIcon(product.totalProduced, product.totalQuantity)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Total: {product.totalQuantity.toFixed(product.unit === 'kg' ? 2 : 0)} {product.unit} • 
                      Fabriqué: {product.totalProduced.toFixed(product.unit === 'kg' ? 2 : 0)} {product.unit} • 
                      Reste: {remaining.toFixed(product.unit === 'kg' ? 2 : 0)} {product.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">{progress}%</span>
                  
                  {/* Input pour quantité personnalisée */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={product.totalQuantity}
                      step={product.unit === 'kg' ? '0.1' : '1'}
                      placeholder="Qté"
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(value) && value >= 0) {
                            handleSetCustomQuantity(product, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <span className="text-xs text-gray-500">{product.unit}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMarkAllComplete(product)}
                      disabled={product.totalProduced >= product.totalQuantity}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Tout fait
                    </button>
                    <button
                      onClick={() => handleMarkAllIncomplete(product)}
                      disabled={product.totalProduced === 0}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Rien fait
                    </button>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Détail par commande */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Détail par commande:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.orders.map((order, orderIndex) => (
                    <div
                      key={orderIndex}
                      className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-600">
                          {order.produced.toFixed(product.unit === 'kg' ? 2 : 0)} / {order.quantity.toFixed(product.unit === 'kg' ? 2 : 0)} {product.unit}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onUpdateProductStatus(order.orderId, order.productId, 0)}
                          disabled={order.produced === 0}
                          className="p-1 text-red-600 hover:bg-red-100 rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Marquer comme non fait"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                         onClick={() => {
                           // Utiliser la quantité exacte de la commande originale
                           const originalOrder = orders.find(o => o.id === order.orderId);
                           const originalProduct = originalOrder?.products.find(p => p.id === order.productId);
                           if (originalProduct) {
                             onUpdateProductStatus(order.orderId, order.productId, originalProduct.quantity);
                           }
                         }}
                          disabled={order.produced >= order.quantity}
                          className="p-1 text-green-600 hover:bg-green-100 rounded disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Marquer comme terminé"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSummary;