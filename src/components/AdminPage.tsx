import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';
import { AdminProduct } from '../types';
import { useAdminProducts } from '../hooks/useAdminProducts';

interface AdminPageProps {
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', defaultUnit: 'kg' });
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const units = ['kg', 'g', 'pièce(s)', 'tranche(s)'];

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return;
    
    addProduct(newProduct);
    setNewProduct({ name: '', defaultUnit: 'kg' });
    setIsAdding(false);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = () => {
    if (!editingProduct || !editingProduct.name.trim()) return;
    
    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      defaultUnit: editingProduct.defaultUnit,
    });
    setEditingId(null);
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingProduct(null);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header line if it exists
      const dataLines = lines.slice(1);
      let importedCount = 0;
      let skippedCount = 0;
      const totalLines = dataLines.length;
      
      dataLines.forEach(line => {
        const [name, unit] = line.split(',').map(item => item.trim());
        if (name && unit) {
          // Check if product already exists (case insensitive)
          const existingProduct = products.find(p => 
            p.name.toLowerCase() === name.toLowerCase()
          );
          
          if (!existingProduct) {
            addProduct({ name, defaultUnit: unit });
            importedCount++;
          } else {
            skippedCount++;
          }
        }
      });
      
      // Show import message with details
      let message = `${importedCount} produit(s) sur ${totalLines} ont été importés avec succès.`;
      if (skippedCount > 0) {
        message += ` ${skippedCount} produit(s) ignoré(s) (déjà existant(s)).`;
      }
      setImportMessage(message);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setImportMessage(null);
      }, 5000);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Administration</h2>
            <p className="text-gray-600">Gestion des produits</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Upload className="w-5 h-5 mr-2" />
            Importer CSV
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau produit
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
        />
      </div>

      {/* Message d'import */}
      {importMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{importMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setImportMessage(null)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouveau produit</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité par défaut
              </label>
              <select
                value={newProduct.defaultUnit}
                onChange={(e) => setNewProduct({ ...newProduct, defaultUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewProduct({ name: '', defaultUnit: 'kg' });
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Annuler
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Produits ({products.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {products.map((product) => (
            <div key={product.id} className="p-6">
              {editingId === product.id ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du produit
                    </label>
                    <input
                      type="text"
                      value={editingProduct?.name || ''}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unité par défaut
                    </label>
                    <select
                      value={editingProduct?.defaultUnit || 'kg'}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, defaultUnit: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Sauvegarder
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Unité par défaut: {product.defaultUnit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit configuré</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;