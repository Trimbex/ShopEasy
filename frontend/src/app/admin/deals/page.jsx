"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../../services/api";

const initialForm = {
  alias: '',
  issuedAt: new Date().toISOString().split('T')[0],
  expiresAt: '',
  minPrice: '',
  percentDiscount: '',
  maxUsesPerUser: '',
  maxUsesTotal: '',
  isRunning: true,
};

const AdminDealsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to access this page");
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await api.get("/coupons");
      setCoupons(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch coupons";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    // Basic validation
    if (!form.alias || !form.issuedAt || !form.expiresAt || !form.minPrice || !form.percentDiscount || !form.maxUsesPerUser || !form.maxUsesTotal) {
      setFormError("All fields are required.");
      setCreating(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.post("/coupons", {
        ...form,
        minPrice: Number(form.minPrice),
        percentDiscount: Number(form.percentDiscount),
        maxUsesPerUser: Number(form.maxUsesPerUser),
        maxUsesTotal: Number(form.maxUsesTotal),
      });
      setShowCreateModal(false);
      setForm(initialForm);
      fetchCoupons();
    } catch (err) {
      setFormError(err?.response?.data?.error || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (coupon) => {
    setSelectedCoupon(coupon);
    setForm({
      alias: coupon.alias,
      issuedAt: new Date(coupon.issuedAt).toISOString().split('T')[0],
      expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
      minPrice: coupon.minPrice.toString(),
      percentDiscount: coupon.percentDiscount.toString(),
      maxUsesPerUser: coupon.maxUsesPerUser.toString(),
      maxUsesTotal: coupon.maxUsesTotal.toString(),
      isRunning: coupon.isRunning,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setEditing(true);
    try {
      const token = localStorage.getItem("token");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put(`/coupons/${selectedCoupon.id}`, {
        ...form,
        issuedAt: new Date(form.issuedAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
        minPrice: Number(form.minPrice),
        percentDiscount: Number(form.percentDiscount),
        maxUsesPerUser: Number(form.maxUsesPerUser),
        maxUsesTotal: Number(form.maxUsesTotal),
      });
      setShowEditModal(false);
      setSelectedCoupon(null);
      setForm(initialForm);
      fetchCoupons();
    } catch (err) {
      setFormError(err?.response?.data?.error || "Failed to update coupon");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`/coupons/${selectedCoupon.id}`);
      setShowDeleteModal(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (err) {
      setError("Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:items-center lg:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Manage Deals
            </h2>
            <p className="mt-1 text-lg text-gray-600">
              Create, manage, and analyze coupons and campaigns for your store.
            </p>
          </div>
        </div>

        {/* Coupon Management Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Coupon Management</h3>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition" onClick={() => setShowCreateModal(true)}>
              + Create Coupon
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No coupons found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alias</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Uses</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unique Users</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => {
                    const now = new Date();
                    const issued = new Date(coupon.issuedAt);
                    const expires = new Date(coupon.expiresAt);
                    const isActive = coupon.isRunning && now >= issued && now <= expires;
                    const uniqueUsers = Array.from(new Set(coupon.usersWhoUsedMe || []));
                    return (
                      <tr key={coupon.id}>
                        <td className="px-4 py-2 font-mono text-sm">{coupon.alias}</td>
                        <td className="px-4 py-2">{coupon.percentDiscount}%</td>
                        <td className="px-4 py-2">${Number(coupon.minPrice).toFixed(2)}</td>
                        <td className="px-4 py-2">{issued.toLocaleDateString()}</td>
                        <td className="px-4 py-2">{expires.toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2">{coupon.usersWhoUsedMe?.length || 0}</td>
                        <td className="px-4 py-2">{uniqueUsers.length}</td>
                        <td className="px-4 py-2 text-right">
                          <button 
                            onClick={() => handleEditClick(coupon)} 
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(coupon)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCreateModal(false)}>
                <span className="sr-only">Close</span>
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Create Coupon</h3>
              {formError && <div className="mb-2 text-red-600 text-sm">{formError}</div>}
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alias</label>
                  <input type="text" name="alias" value={form.alias} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Issued At</label>
                    <input type="date" name="issuedAt" value={form.issuedAt} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Min Price</label>
                    <input type="number" name="minPrice" value={form.minPrice} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="0" step="0.01" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                    <input type="number" name="percentDiscount" value={form.percentDiscount} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" max="100" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Max Uses/User</label>
                    <input type="number" name="maxUsesPerUser" value={form.maxUsesPerUser} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Max Uses Total</label>
                    <input type="number" name="maxUsesTotal" value={form.maxUsesTotal} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" />
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="isRunning" checked={form.isRunning} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-700">Is Running</label>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <h3 className="text-lg font-semibold mb-4">Delete Coupon</h3>
              <p className="mb-4">Are you sure you want to delete the coupon "{selectedCoupon.alias}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCoupon(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Coupon Modal */}
        {showEditModal && selectedCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => {
                setShowEditModal(false);
                setSelectedCoupon(null);
                setForm(initialForm);
              }}>
                <span className="sr-only">Close</span>
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Edit Coupon</h3>
              {formError && <div className="mb-2 text-red-600 text-sm">{formError}</div>}
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alias</label>
                  <input type="text" name="alias" value={form.alias} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Issued At</label>
                    <input type="date" name="issuedAt" value={form.issuedAt} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Min Price</label>
                    <input type="number" name="minPrice" value={form.minPrice} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="0" step="0.01" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                    <input type="number" name="percentDiscount" value={form.percentDiscount} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" max="100" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Max Uses/User</label>
                    <input type="number" name="maxUsesPerUser" value={form.maxUsesPerUser} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Max Uses Total</label>
                    <input type="number" name="maxUsesTotal" value={form.maxUsesTotal} onChange={handleFormChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" />
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="isRunning" checked={form.isRunning} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-700">Is Running</label>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition" disabled={editing}>
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Campaign Management Section */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Management</h3>
          <p className="text-gray-500 text-center mb-4">Group coupons into campaigns and manage their lifecycle.</p>
          <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded">Coming soon</span>
        </div>
        {/* Deal Telemetry Section */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Deal Telemetry</h3>
          <p className="text-gray-500 text-center mb-4">View usage statistics and performance of your deals.</p>
          <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded">Coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDealsPage; 