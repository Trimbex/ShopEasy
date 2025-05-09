"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

const InventoryManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editModes, setEditModes] = useState({});
  const [newStockValues, setNewStockValues] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState("table");
  const [threshold, setThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(DEFAULT_LOW_STOCK_THRESHOLD);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        const initialStockValues = {};
        data.forEach(product => {
          initialStockValues[product.id] = product.stock;
        });
        setNewStockValues(initialStockValues);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && user?.isAdmin) fetchProducts();
  }, [isAuthenticated, user]);

  const toggleEditMode = (productId) => {
    setEditModes(prev => ({ ...prev, [productId]: !prev[productId] }));
    if (editModes[productId]) {
      setNewStockValues(prev => ({ ...prev, [productId]: products.find(p => p.id === productId).stock }));
    }
  };

  const handleStockChange = (productId, value) => {
    setNewStockValues(prev => ({ ...prev, [productId]: value }));
  };

  const handleStockUpdate = async (id) => {
    setSuccess(null);
    setError(null);
    const product = products.find(p => p.id === id);
    const currentStock = product.stock;
    const newStock = Number(newStockValues[id]);
    if (newStock === currentStock) {
      toggleEditMode(id);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stock: newStock
        }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      const updatedProduct = await res.json();
      
      // Ensure status is correctly updated
      updatedProduct.stockStatus = {
        isLowStock: updatedProduct.stock <= threshold,
        currentStock: updatedProduct.stock,
        threshold: threshold
      };
      
      setProducts(prevProducts => prevProducts.map(p => p.id === id ? updatedProduct : p));
      setSuccess(`Stock updated for ${product.name}`);
      setTimeout(() => setSuccess(null), 2000);
      toggleEditMode(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Threshold logic
  const handleThresholdSave = () => {
    setThreshold(Number(thresholdInput));
    setEditingThreshold(false);
  };

  // Calculate inventory statistics
  const calculateStats = () => {
    const total = products.length;
    const lowStock = products.filter(p => p.stock <= threshold).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
    const avgStock = total > 0 ? Math.round(totalItems / total) : 0;
    const healthyStock = total - lowStock;
    
    return {
      total,
      lowStock,
      outOfStock,
      totalItems,
      avgStock,
      healthyStock,
      lowStockPercentage: total > 0 ? Math.round((lowStock / total) * 100) : 0
    };
  };

  // Sort function for products
  const sortedProducts = () => {
    let sortableProducts = [...products];
    
    // Apply filtering
    if (filterStatus === "low") {
      sortableProducts = sortableProducts.filter(p => p.stock <= threshold && p.stock > 0);
    } else if (filterStatus === "ok") {
      sortableProducts = sortableProducts.filter(p => p.stock > threshold);
    } else if (filterStatus === "out") {
      sortableProducts = sortableProducts.filter(p => p.stock === 0);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (sortConfig.key === 'name') {
          return sortConfig.direction === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortConfig.key === 'stock') {
          return sortConfig.direction === 'asc' 
            ? a.stock - b.stock
            : b.stock - a.stock;
        }
        return 0;
      });
    }
    
    return sortableProducts;
  };

  // Handle sort requests
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted class for table headers
  const getSortClass = (key) => {
    if (sortConfig.key !== key) return 'cursor-pointer hover:bg-gray-200';
    return sortConfig.direction === 'asc' 
      ? 'cursor-pointer hover:bg-gray-200 text-indigo-600 bg-indigo-50' 
      : 'cursor-pointer hover:bg-gray-200 text-indigo-600 bg-indigo-50';
  };

  // Get stock distribution categories
  const getStockDistribution = () => {
    const distribution = {
      outOfStock: 0,
      critical: 0, // 1-2
      low: 0,      // 3-5
      medium: 0,   // 6-15
      high: 0      // 16+
    };
    
    products.forEach(product => {
      if (product.stock === 0) distribution.outOfStock++;
      else if (product.stock <= 2) distribution.critical++;
      else if (product.stock <= threshold) distribution.low++;
      else if (product.stock <= 15) distribution.medium++;
      else distribution.high++;
    });
    
    return distribution;
  };

  // Top 5 lowest stock items - prioritize out-of-stock items
  const getLowestStockItems = () => {
    return [...products]
      .sort((a, b) => {
        // First prioritize out-of-stock (0 stock) items
        if (a.stock === 0 && b.stock !== 0) return -1;
        if (a.stock !== 0 && b.stock === 0) return 1;
        // Then sort by lowest stock
        return a.stock - b.stock;
      })
      .slice(0, 5);
  };

  const stats = calculateStats();
  const stockDistribution = getStockDistribution();
  const lowestStockItems = getLowestStockItems();

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode("dashboard")} 
              className={`px-4 py-2 rounded text-sm font-medium ${viewMode === "dashboard" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setViewMode("table")} 
              className={`px-4 py-2 rounded text-sm font-medium ${viewMode === "table" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              Inventory Table
            </button>
          </div>
        </div>
        
        <p className="mb-4 text-gray-600">Track product availability, manage stock levels, and get alerts for low stock.</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <>
            {viewMode === "dashboard" && (
              <div className="dashboard mb-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                    <p className="text-3xl font-bold text-amber-600">{stats.lowStock}</p>
                    <p className="text-sm text-gray-500">{stats.lowStockPercentage}% of inventory</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm font-medium text-gray-500">Average Stock Level</h3>
                    <p className="text-3xl font-bold">{stats.avgStock} units</p>
                  </div>
                </div>

                {/* Stock Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-medium mb-4">Stock Level Distribution</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Out of Stock (0)</span>
                          <span>{stockDistribution.outOfStock} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div 
                            className="bg-red-500 h-2 rounded" 
                            style={{ width: `${(stockDistribution.outOfStock / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Critical (1-2)</span>
                          <span>{stockDistribution.critical} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div 
                            className="bg-red-400 h-2 rounded" 
                            style={{ width: `${(stockDistribution.critical / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Low (3-5)</span>
                          <span>{stockDistribution.low} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div 
                            className="bg-amber-400 h-2 rounded" 
                            style={{ width: `${(stockDistribution.low / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Medium (6-15)</span>
                          <span>{stockDistribution.medium} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div 
                            className="bg-green-400 h-2 rounded" 
                            style={{ width: `${(stockDistribution.medium / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>High (16+)</span>
                          <span>{stockDistribution.high} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div 
                            className="bg-green-600 h-2 rounded" 
                            style={{ width: `${(stockDistribution.high / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 lowest stock products */}
                  <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-lg font-medium mb-4">Products Needing Attention</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 text-xs uppercase text-gray-600">Product</th>
                            <th className="text-center py-2 text-xs uppercase text-gray-600">Stock</th>
                            <th className="text-center py-2 text-xs uppercase text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowestStockItems.map(product => (
                            <tr key={product.id} className="border-b">
                              <td className="py-2">{product.name}</td>
                              <td className="py-2 text-center">{product.stock}</td>
                              <td className="py-2 text-center">
                                {product.stock === 0 ? (
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                    Out of Stock
                                  </span>
                                ) : product.stock <= 2 ? (
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                    Critical
                                  </span>
                                ) : product.stock <= threshold ? (
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                    OK
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {lowestStockItems.length === 0 && (
                            <tr>
                              <td colSpan="3" className="py-4 text-center text-gray-500">
                                No products to display
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "table" && (
              <div className="inventory-table">
                <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Low Stock Threshold: {threshold}</h3>
                    <p className="text-sm text-gray-600">Products with stock levels at or below this threshold will be marked as low stock.</p>
                  </div>
                  {editingThreshold ? (
                    <div className="flex items-center space-x-2">
                      <input type="number" min="0" value={thresholdInput} onChange={e => setThresholdInput(e.target.value)} className="border rounded px-2 py-1 w-20" />
                      <button onClick={handleThresholdSave} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                      <button onClick={() => setEditingThreshold(false)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingThreshold(true); setThresholdInput(threshold); }} className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Change Threshold</button>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setFilterStatus("all")} 
                      className={`px-3 py-1 text-sm rounded ${filterStatus === "all" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-white text-gray-700"}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilterStatus("low")} 
                      className={`px-3 py-1 text-sm rounded ${filterStatus === "low" 
                        ? "bg-amber-600 text-white" 
                        : "bg-white text-gray-700"}`}
                    >
                      Low Stock
                    </button>
                    <button 
                      onClick={() => setFilterStatus("out")} 
                      className={`px-3 py-1 text-sm rounded ${filterStatus === "out" 
                        ? "bg-red-600 text-white" 
                        : "bg-white text-gray-700"}`}
                    >
                      Out of Stock
                    </button>
                    <button 
                      onClick={() => setFilterStatus("ok")} 
                      className={`px-3 py-1 text-sm rounded ${filterStatus === "ok" 
                        ? "bg-green-600 text-white" 
                        : "bg-white text-gray-700"}`}
                    >
                      Healthy Stock
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {sortedProducts().length} products
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getSortClass('name')}`}
                          onClick={() => requestSort('name')}
                        >
                          Product Name
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getSortClass('stock')}`}
                          onClick={() => requestSort('stock')}
                        >
                          Stock
                          {sortConfig.key === 'stock' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Bar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedProducts().map((product) => {
                        const isOutOfStock = product.stock === 0;
                        const isLow = !isOutOfStock && product.stock <= threshold;
                        const isEditing = editModes[product.id] || false;
                        
                        return (
                          <tr key={product.id} className={
                            isOutOfStock ? "bg-red-50" : 
                            isLow ? "bg-amber-50" : ""
                          }>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={newStockValues[product.id]}
                                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                                  className="border rounded px-2 py-1 w-20"
                                />
                              ) : (
                                product.stock
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-gray-200 rounded h-2">
                                <div 
                                  className={`h-2 rounded ${
                                    isOutOfStock ? "bg-red-500" : 
                                    isLow ? "bg-amber-500" : 
                                    "bg-green-500"
                                  }`} 
                                  style={{ 
                                    width: `${Math.min(100, (product.stock / 20) * 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleStockUpdate(product.id)}
                                    className="mr-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => toggleEditMode(product.id)}
                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 ml-2"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => toggleEditMode(product.id)}
                                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                  Update Stock
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {sortedProducts().length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No products match the selected filter
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement; 