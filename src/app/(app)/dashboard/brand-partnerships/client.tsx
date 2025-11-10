'use client';

import { useState } from 'react';
import { Plus, Briefcase, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface BrandPartnership {
  id: string;
  brand_name: string;
  brand_logo_url?: string;
  partnership_type: string;
  status: string;
  commission_rate?: number;
  flat_fee_cents?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface SponsoredContent {
  id: string;
  sponsor_name: string;
  campaign_name?: string;
  total_impressions: number;
  total_clicks: number;
  total_spend_cents: number;
  budget_cents?: number;
  is_active: boolean;
}

interface BrandPartnershipsClientProps {
  partnerships: BrandPartnership[];
  sponsoredContent: SponsoredContent[];
}

export function BrandPartnershipsClient({ partnerships, sponsoredContent }: BrandPartnershipsClientProps) {
  const [activeTab, setActiveTab] = useState<'partnerships' | 'sponsored'>('partnerships');

  // Calculate totals
  const totalRevenue = sponsoredContent.reduce((sum, content) => sum + (content.total_spend_cents || 0), 0);
  const totalImpressions = sponsoredContent.reduce((sum, content) => sum + content.total_impressions, 0);
  const totalClicks = sponsoredContent.reduce((sum, content) => sum + content.total_clicks, 0);
  const activePartnerships = partnerships.filter(p => p.status === 'active').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Brand Partnerships
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your brand partnerships and sponsored content campaigns
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Partnerships</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePartnerships}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Impressions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalImpressions.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clicks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalClicks.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('partnerships')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'partnerships'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Partnerships ({partnerships.length})
          </button>
          <button
            onClick={() => setActiveTab('sponsored')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'sponsored'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Sponsored Content ({sponsoredContent.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'partnerships' ? (
        <div>
          {/* Add New Button */}
          <button className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            Add Partnership
          </button>

          {/* Partnerships List */}
          {partnerships.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No partnerships yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start collaborating with brands to monetize your content
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {partnerships.map((partnership) => (
                <div
                  key={partnership.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {partnership.brand_logo_url ? (
                        <img
                          src={partnership.brand_logo_url}
                          alt={partnership.brand_name}
                          className="w-12 h-12 rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {partnership.brand_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {partnership.partnership_type}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span
                            className={`text-sm px-2 py-0.5 rounded ${
                              partnership.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : partnership.status === 'pending'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {partnership.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {partnership.commission_rate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Commission</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {partnership.commission_rate}%
                        </p>
                      </div>
                    )}
                    {partnership.flat_fee_cents && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Flat Fee</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${(partnership.flat_fee_cents / 100).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {partnership.start_date && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(partnership.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {partnership.end_date && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(partnership.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Add New Button */}
          <button className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            Create Campaign
          </button>

          {/* Sponsored Content List */}
          {sponsoredContent.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No sponsored campaigns yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create sponsored content campaigns to promote brands
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sponsoredContent.map((content) => (
                <div
                  key={content.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content.sponsor_name}
                      </h3>
                      {content.campaign_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {content.campaign_name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        content.is_active
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {content.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Impressions</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content.total_impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clicks</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content.total_clicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CTR</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content.total_impressions > 0
                          ? ((content.total_clicks / content.total_impressions) * 100).toFixed(2)
                          : '0.00'}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Spend</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${(content.total_spend_cents / 100).toFixed(2)}
                        {content.budget_cents && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {' '}
                            / ${(content.budget_cents / 100).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
