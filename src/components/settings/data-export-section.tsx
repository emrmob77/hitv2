'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataExportSectionProps {
  userId: string;
}

export function DataExportSection({ userId }: DataExportSectionProps) {
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleExportJSON = async () => {
    setIsExportingJSON(true);
    try {
      const response = await fetch('/api/export/data?format=json');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hittags-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const response = await fetch('/api/export/data?format=csv');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hittags-bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Bookmarks exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export bookmarks');
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <FileJson className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Complete Data Export (JSON)</p>
              <p className="text-sm text-muted-foreground">
                Download all your data including bookmarks, collections, and profile information
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportJSON}
            disabled={isExportingJSON}
            variant="outline"
            size="sm"
          >
            {isExportingJSON ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Bookmarks Export (CSV)</p>
              <p className="text-sm text-muted-foreground">
                Download your bookmarks in CSV format for import to other services
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            variant="outline"
            size="sm"
          >
            {isExportingCSV ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>GDPR Compliance:</strong> You have the right to access, rectify, and erase your personal data.
          Exported data includes all information associated with your account.
        </p>
      </div>
    </div>
  );
}
