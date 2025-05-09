'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { campaignsApi } from '../../../services/api';
import Link from 'next/link';

const AdminCampaignsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, user]);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        if (isAuthenticated && user?.isAdmin) {
          setIsLoading(true);
          const data = await campaignsApi.getAll();
          setCampaigns(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.isAdmin) {
      fetchCampaigns();
    }
  }, [isAuthenticated, user]);

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await campaignsApi.delete(id);
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign. Please try again.');
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null; // Will be redirected
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Campaign
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <p className="text-gray-500">No campaigns found. Create your first campaign!</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Campaign Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Color
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Range
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Coupons
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => {
                const now = new Date();
                const startDate = new Date(campaign.startDate);
                const endDate = new Date(campaign.endDate);
                
                let status;
                if (now < startDate) {
                  status = 'Upcoming';
                } else if (now > endDate) {
                  status = 'Expired';
                } else {
                  status = 'Active';
                }

                return (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded-full mr-2 border border-gray-200" 
                          style={{ backgroundColor: campaign.color }}
                        ></div>
                        <span className="text-sm text-gray-500">{campaign.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : status === 'Upcoming'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.coupons.length} coupons
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
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
  );
};

export default AdminCampaignsPage; 