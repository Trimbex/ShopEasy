'use client';

import { useState, useEffect } from 'react';
import { telemetryApi } from '../../../../services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Custom chart components
const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="h-64">
      {children}
    </div>
  </div>
);

const DealTelemetryPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [couponMetrics, setCouponMetrics] = useState([]);
  const [campaignMetrics, setCampaignMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch metrics based on active tab
        if (activeTab === 'overview') {
          const data = await telemetryApi.getOverviewMetrics();
          setOverviewMetrics(data);
        } else if (activeTab === 'coupons') {
          const data = await telemetryApi.getCouponMetrics();
          setCouponMetrics(data);
        } else if (activeTab === 'campaigns') {
          const data = await telemetryApi.getCampaignMetrics();
          setCampaignMetrics(data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching telemetry data:', err);
        setError('Failed to load telemetry data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Color schemes
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const renderOverviewTab = () => {
    if (!overviewMetrics) return null;

    // Calculate additional metrics
    const activeRatio = overviewMetrics.coupons.active / overviewMetrics.coupons.total * 100;
    const activeCampaignRatio = overviewMetrics.campaigns.active / overviewMetrics.campaigns.total * 100;
    
    // Prepare data for charts
    const statusData = [
      { name: 'Active Coupons', value: overviewMetrics.coupons.active },
      { name: 'Inactive Coupons', value: overviewMetrics.coupons.total - overviewMetrics.coupons.active }
    ];
    
    const campaignStatusData = [
      { name: 'Active Campaigns', value: overviewMetrics.campaigns.active },
      { name: 'Inactive Campaigns', value: overviewMetrics.campaigns.total - overviewMetrics.campaigns.active }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Coupons</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">{overviewMetrics.coupons.total}</p>
              <p className="ml-2 text-sm font-medium text-green-600">
                {formatPercent(activeRatio)} Active
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">{overviewMetrics.campaigns.total}</p>
              <p className="ml-2 text-sm font-medium text-green-600">
                {formatPercent(activeCampaignRatio)} Active
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Discounted Revenue</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">
                {formatCurrency(overviewMetrics.revenue.totalDiscountedRevenue)}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Discount Amount</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">
                {formatCurrency(overviewMetrics.revenue.totalDiscountAmount)}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-600">
                Avg: {formatCurrency(overviewMetrics.revenue.averageDiscount)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Revenue & Discount Trends (Last 30 Days)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={overviewMetrics.timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                <Area type="monotone" dataKey="discount" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Discount" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Daily Orders (Last 30 Days)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overviewMetrics.timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Coupon Status Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Campaign Status Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={campaignStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    );
  };

  const renderCouponsTab = () => {
    if (couponMetrics.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No coupon data available.</p>
        </div>
      );
    }

    // Sort coupons by revenue
    const sortedCoupons = [...couponMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const topCoupons = sortedCoupons.slice(0, 5);
    
    // Calculate usage metrics
    const usageData = sortedCoupons.map(coupon => ({
      name: coupon.alias,
      usage: coupon.uniqueUsers,
      limit: coupon.maxUsesTotal,
      percentage: coupon.redemptionRate
    })).slice(0, 10);

    return (
      <div className="space-y-6">
        {/* Top Performing Coupons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Coupons</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.alias}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.percentDiscount}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(coupon.totalRevenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(coupon.totalDiscountAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Coupon Usage vs Limit">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#8884d8" name="Current Usage" />
                <Bar dataKey="limit" fill="#82ca9d" name="Usage Limit" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Coupon Redemption Rate">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8" name="Redemption Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          {topCoupons.length > 0 && (
            <>
              <ChartCard title={`${topCoupons[0].alias} - Revenue Over Time`} className="lg:col-span-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={topCoupons[0].timeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                    <Line type="monotone" dataKey="discountAmount" stroke="#82ca9d" name="Discount Amount" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCampaignsTab = () => {
    if (campaignMetrics.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No campaign data available.</p>
        </div>
      );
    }

    // Sort campaigns by revenue
    const sortedCampaigns = [...campaignMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Prepare data for charts
    const campaignRevenueData = sortedCampaigns.map(campaign => ({
      name: campaign.name,
      revenue: campaign.totalRevenue,
      discount: campaign.totalDiscountAmount
    }));
    
    // Get coupon breakdown for the top campaign
    const topCampaign = sortedCampaigns[0];
    const couponBreakdown = topCampaign ? topCampaign.couponData.map(coupon => ({
      name: coupon.alias,
      value: coupon.revenue
    })) : [];

    return (
      <div className="space-y-6">
        {/* Campaign Performance Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupons</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded-full mr-2 border border-gray-200" 
                          style={{ backgroundColor: campaign.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.totalCoupons}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(campaign.totalRevenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(campaign.totalDiscountAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Campaign Revenue Comparison">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignRevenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="discount" fill="#82ca9d" name="Discount" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          {topCampaign && (
            <ChartCard title={`${topCampaign.name} - Coupon Revenue Breakdown`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={couponBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {couponBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          
          {topCampaign && (
            <ChartCard title={`${topCampaign.name} - Revenue Over Time`} className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={topCampaign.timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="discountAmount" stroke="#82ca9d" name="Discount Amount" />
                  <Line type="monotone" dataKey="orderCount" stroke="#ffc658" name="Order Count" yAxisId="right" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Telemetry</h1>
          <p className="mt-1 text-lg text-gray-600">
            Analyze performance metrics for your coupons and campaigns
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/admin/deals"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Deals
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`${
              activeTab === 'coupons'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`${
              activeTab === 'campaigns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Campaigns
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'coupons' && renderCouponsTab()}
          {activeTab === 'campaigns' && renderCampaignsTab()}
        </div>
      )}
    </div>
  );
};

export default DealTelemetryPage; 