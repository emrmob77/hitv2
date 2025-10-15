'use client';

import { Download, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

// Mock data - will be replaced with real Stripe data
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-01-15',
    amount: '$29.00',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_002',
    date: '2023-12-15',
    amount: '$29.00',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_003',
    date: '2023-11-15',
    amount: '$29.00',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
];

interface BillingHistorySectionProps {
  isPremium: boolean;
}

export function BillingHistorySection({ isPremium }: BillingHistorySectionProps) {
  // If not premium, show info message
  if (!isPremium) {
    return (
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          Billing history is available for Pro and Enterprise subscribers. Upgrade to view your invoices and payment history.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Billing integration is currently in development. Once connected to Stripe, your real payment history will appear here.
        </AlertDescription>
      </Alert>

      {/* Payment Method */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-900">Payment Method</h3>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <CreditCard className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Card ending in ••••
              </p>
              <p className="text-xs text-neutral-500">
                Will be configured with Stripe
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Update
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-900">Invoice History</h3>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MOCK_INVOICES.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {invoice.description}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {invoice.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="h-8 text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500">
          Mock data shown for demonstration. Real invoices will be available after Stripe integration.
        </p>
      </div>
    </div>
  );
}
