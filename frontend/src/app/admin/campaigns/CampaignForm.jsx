'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { campaignsApi } from '../../../services/api';
import api from '../../../services/api';

const CampaignForm = ({ campaignId }) => {
  const router = useRouter();
  const isEditMode = !!campaignId;
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366F1',
    couponIds: []
  });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch campaign data if in edit mode
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;
      
      try {
        setIsLoading(true);
        const campaign = await campaignsApi.getOne(campaignId);
        setFormData({
          name: campaign.name,
          color: campaign.color,
          couponIds: campaign.coupons
        });
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [campaignId]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/coupons');
        setAvailableCoupons(response.data);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Failed to load available coupons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCouponToggle = (couponId) => {
    setFormData(prev => {
      const newCouponIds = prev.couponIds.includes(couponId)
        ? prev.couponIds.filter(id => id !== couponId)
        : [...prev.couponIds, couponId];

      return {
        ...prev,
        couponIds: newCouponIds
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (formData.couponIds.length === 0) {
      setError('At least one coupon must be selected');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (isEditMode) {
        await campaignsApi.update(campaignId, formData);
      } else {
        await campaignsApi.create(formData);
      }

      router.push('/admin/campaigns');
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Information</h2>
        
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-10 rounded border border-gray-300 shadow-sm cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                name="color"
                className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Coupons</h2>
        
        {availableCoupons.length === 0 ? (
          <p className="text-gray-500">No coupons available. Please create coupons first.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableCoupons.map(coupon => (
              <div 
                key={coupon.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.couponIds.includes(coupon.id) 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCouponToggle(coupon.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{coupon.alias}</h3>
                    <p className="mt-1 text-sm text-gray-500">{coupon.percentDiscount}% OFF</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Min: ${Number(coupon.minPrice).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(coupon.issuedAt).toLocaleDateString()} - {new Date(coupon.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.couponIds.includes(coupon.id)}
                    onChange={() => {}} // Handled by the div onClick
                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/campaigns')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || formData.couponIds.length === 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            (isSaving || formData.couponIds.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? 'Saving...' : isEditMode ? 'Update Campaign' : 'Create Campaign'}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm; 