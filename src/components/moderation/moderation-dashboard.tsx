'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  reported_user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ModerationDashboardProps {
  initialReports: Report[];
  stats: {
    pending: number;
    reviewing: number;
    resolvedToday: number;
  };
}

export function ModerationDashboard({ initialReports, stats }: ModerationDashboardProps) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateReport = async (reportId: string, status: string, resolution?: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolution,
          moderator_notes: `Moderated on ${new Date().toLocaleString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // Remove from list
      setReports(reports.filter((r) => r.id !== reportId));
      setSelectedReport(null);

      toast({
        title: 'Report updated',
        description: `Report has been ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonBadgeColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-yellow-100 text-yellow-800',
      harassment: 'bg-red-100 text-red-800',
      inappropriate_content: 'bg-orange-100 text-orange-800',
      copyright_violation: 'bg-purple-100 text-purple-800',
      misinformation: 'bg-pink-100 text-pink-800',
      hate_speech: 'bg-red-100 text-red-800',
      violence: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[reason] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewing}</div>
            <p className="text-xs text-muted-foreground">Currently being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pending Reports
          </CardTitle>
          <CardDescription>Review and moderate reported content</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pending reports. Great job!
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getReasonBadgeColor(report.reason)}>
                          {report.reason.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-neutral-600">
                          {report.content_type}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium text-neutral-900">
                          Reported by: {report.reporter.display_name || report.reporter.username}
                        </p>
                        {report.reported_user && (
                          <p className="text-neutral-600">
                            Against: {report.reported_user.display_name || report.reported_user.username}
                          </p>
                        )}
                      </div>

                      {report.description && (
                        <p className="text-sm text-neutral-600">{report.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() =>
                          handleUpdateReport(report.id, 'resolved', 'No violation found')
                        }
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          handleUpdateReport(report.id, 'dismissed', 'Invalid report')
                        }
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal (simplified) */}
      {selectedReport && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>ID: {selectedReport.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Content Type</h4>
              <p className="text-sm text-neutral-600">{selectedReport.content_type}</p>
            </div>

            <div>
              <h4 className="font-medium">Reason</h4>
              <p className="text-sm text-neutral-600">
                {selectedReport.reason.replace('_', ' ')}
              </p>
            </div>

            {selectedReport.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-neutral-600">{selectedReport.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() =>
                  handleUpdateReport(selectedReport.id, 'resolved', 'Content removed')
                }
                disabled={isLoading}
              >
                Resolve & Remove Content
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  handleUpdateReport(selectedReport.id, 'dismissed', 'No action needed')
                }
                disabled={isLoading}
              >
                Dismiss Report
              </Button>
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
