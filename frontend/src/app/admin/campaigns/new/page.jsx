'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import CampaignForm from '../CampaignForm';
import Link from 'next/link';

const NewCampaignPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, user]);

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
      <div className="flex items-center mb-8">
        <Link
          href="/admin/campaigns"
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          ← Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
      </div>

      <CampaignForm />
    </div>
  );
};

export default NewCampaignPage; 