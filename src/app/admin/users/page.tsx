/**
 * Admin Users Management Page
 *
 * Manage all users, view details, and perform admin actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Search, MoreVertical, Shield, Ban, CheckCircle, XCircle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'premium';
  is_suspended: boolean;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
  bookmarks_count: number;
  collections_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    pro: 0,
    premium: 0,
    suspended: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        calculateStats(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersList: User[]) => {
    const stats = {
      total: usersList.length,
      free: usersList.filter((u) => u.subscription_tier === 'free').length,
      pro: usersList.filter((u) => u.subscription_tier === 'pro').length,
      premium: usersList.filter((u) => u.subscription_tier === 'premium').length,
      suspended: usersList.filter((u) => u.is_suspended).length,
    };
    setStats(stats);
  };

  const suspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('User suspended');
        fetchUsers();
      } else {
        toast.error('Failed to suspend user');
      }
    } catch (error) {
      toast.error('Error suspending user');
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('User unsuspended');
        fetchUsers();
      } else {
        toast.error('Failed to unsuspend user');
      }
    } catch (error) {
      toast.error('Error unsuspending user');
    }
  };

  const makeAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('User is now an admin');
        fetchUsers();
      } else {
        toast.error('Failed to make user admin');
      }
    } catch (error) {
      toast.error('Error making user admin');
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">Manage all users and their accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Free</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pro}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterTier === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier('all')}
              >
                All
              </Button>
              <Button
                variant={filterTier === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier('free')}
              >
                Free
              </Button>
              <Button
                variant={filterTier === 'pro' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier('pro')}
              >
                Pro
              </Button>
              <Button
                variant={filterTier === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier('premium')}
              >
                Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>View and manage all user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.full_name || 'N/A'}</p>
                          {user.is_admin && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{user.email}</code>
                    </TableCell>
                    <TableCell>
                      {user.subscription_tier === 'free' && (
                        <Badge variant="outline">Free</Badge>
                      )}
                      {user.subscription_tier === 'pro' && (
                        <Badge className="bg-blue-600">
                          <Crown className="mr-1 h-3 w-3" />
                          Pro
                        </Badge>
                      )}
                      {user.subscription_tier === 'premium' && (
                        <Badge className="bg-purple-600">
                          <Crown className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <div>{user.bookmarks_count} bookmarks</div>
                        <div className="text-muted-foreground">
                          {user.collections_count} collections
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_suspended ? (
                        <Badge variant="destructive">
                          <Ban className="mr-1 h-3 w-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs" suppressHydrationWarning>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs" suppressHydrationWarning>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {!user.is_admin && (
                            <DropdownMenuItem onClick={() => makeAdmin(user.id)}>
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {user.is_suspended ? (
                            <DropdownMenuItem onClick={() => unsuspendUser(user.id)}>
                              Unsuspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => suspendUser(user.id)}
                              className="text-red-600"
                            >
                              Suspend User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
