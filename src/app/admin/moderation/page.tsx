/**
 * Admin Moderation Page
 *
 * Handle content reports and moderation actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Ban,
  Flag,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Report {
  id: string;
  content_type: 'bookmark' | 'collection' | 'user' | 'comment';
  content_id: string;
  content_title: string;
  reason: string;
  description?: string;
  reporter_email: string;
  reported_user_email: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  action_taken?: string;
}

const REPORT_REASONS = [
  'spam',
  'inappropriate_content',
  'copyright_violation',
  'harassment',
  'misinformation',
  'other',
];

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [actionType, setActionType] = useState<string>('dismiss');

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    reviewing: 0,
    resolved: 0,
    dismissed: 0,
    total: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/moderation/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        calculateStats(data.reports || []);
      } else {
        toast.error('Failed to fetch reports');
      }
    } catch (error) {
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsList: Report[]) => {
    setStats({
      pending: reportsList.filter((r) => r.status === 'pending').length,
      reviewing: reportsList.filter((r) => r.status === 'reviewing').length,
      resolved: reportsList.filter((r) => r.status === 'resolved').length,
      dismissed: reportsList.filter((r) => r.status === 'dismissed').length,
      total: reportsList.length,
    });
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Report ${status}`);
        fetchReports();
      } else {
        toast.error('Failed to update report');
      }
    } catch (error) {
      toast.error('Error updating report');
    }
  };

  const takeAction = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch(`/api/admin/moderation/reports/${selectedReport.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType }),
      });

      if (response.ok) {
        toast.success('Action taken successfully');
        setShowReviewDialog(false);
        setSelectedReport(null);
        fetchReports();
      } else {
        toast.error('Failed to take action');
      }
    } catch (error) {
      toast.error('Error taking action');
    }
  };

  const openReviewDialog = (report: Report) => {
    setSelectedReport(report);
    setShowReviewDialog(true);
    setActionType('dismiss');
  };

  // Filter reports by status
  const filteredReports = reports.filter((report) => {
    if (activeTab === 'all') return true;
    return report.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'reviewing':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <Eye className="mr-1 h-3 w-3" />
            Reviewing
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      case 'dismissed':
        return (
          <Badge variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            Dismissed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="mt-2 text-muted-foreground">Review and handle content reports</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviewing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.dismissed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Queue</CardTitle>
          <CardDescription>Review and take action on reported content</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="reviewing">
                Reviewing ({stats.reviewing})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({stats.resolved})
              </TabsTrigger>
              <TabsTrigger value="dismissed">
                Dismissed ({stats.dismissed})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({stats.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading reports...</p>
              ) : filteredReports.length === 0 ? (
                <div className="py-12 text-center">
                  <Flag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">No reports in this category</p>
                  <p className="text-sm text-muted-foreground">
                    Reports will appear here when users flag content
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reported User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.content_title}</p>
                            {report.description && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.content_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {report.reason.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{report.reporter_email}</code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{report.reported_user_email}</code>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell className="text-xs" suppressHydrationWarning>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReportStatus(report.id, 'reviewing')}
                              >
                                Review
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => openReviewDialog(report)}
                            >
                              Take Action
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Take action on this reported content
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Report Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Content:</dt>
                    <dd className="font-medium">{selectedReport.content_title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="capitalize">{selectedReport.content_type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Reason:</dt>
                    <dd className="capitalize">{selectedReport.reason.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Reporter:</dt>
                    <dd>
                      <code className="text-xs">{selectedReport.reporter_email}</code>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Reported User:</dt>
                    <dd>
                      <code className="text-xs">{selectedReport.reported_user_email}</code>
                    </dd>
                  </div>
                  {selectedReport.description && (
                    <div>
                      <dt className="text-muted-foreground mb-1">Description:</dt>
                      <dd className="text-sm">{selectedReport.description}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Action</label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dismiss">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Dismiss Report (No Action)
                      </div>
                    </SelectItem>
                    <SelectItem value="delete_content">
                      <div className="flex items-center">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Content
                      </div>
                    </SelectItem>
                    <SelectItem value="suspend_user">
                      <div className="flex items-center">
                        <Ban className="mr-2 h-4 w-4" />
                        Suspend User
                      </div>
                    </SelectItem>
                    <SelectItem value="warn_user">
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Warn User
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> This action will be logged and cannot be undone.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={takeAction}>
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
