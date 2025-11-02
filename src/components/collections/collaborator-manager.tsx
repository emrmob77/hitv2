'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CollaboratorUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface CollaboratorRecord {
  id: string;
  role: 'owner' | 'editor' | 'contributor' | 'viewer';
  permissions?: Record<string, unknown> | null;
  user: CollaboratorUser;
  created_at?: string;
}

interface CollaboratorManagerProps {
  collectionId: string;
  initialCollaborators: CollaboratorRecord[];
  currentUserRole: 'owner' | 'editor' | 'contributor' | 'viewer';
}

const ROLE_LABELS: Record<CollaboratorRecord['role'], string> = {
  owner: 'Owner',
  editor: 'Editor',
  contributor: 'Contributor',
  viewer: 'Viewer',
};

const MANAGEABLE_ROLES: CollaboratorRecord['role'][] = ['editor', 'contributor', 'viewer'];

export function CollaboratorManager({
  collectionId,
  initialCollaborators,
  currentUserRole,
}: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<CollaboratorRecord['role']>('editor');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserRole === 'owner';

  const refreshCollaborators = (next: CollaboratorRecord[]) => {
    setCollaborators(next.sort((a, b) => (a.user.display_name || a.user.username).localeCompare(b.user.display_name || b.user.username)));
  };

  const handleAdd = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${collectionId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), role }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to add collaborator');
      }

      if (payload?.collaborator) {
        refreshCollaborators([...collaborators.filter((c) => c.user.id !== payload.collaborator.user.id), payload.collaborator]);
        setUsername('');
        setRole('editor');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error while adding collaborator');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRoleChange = async (collaboratorId: string, nextRole: CollaboratorRecord['role']) => {
    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collections/${collectionId}/collaborators/${collaboratorId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: nextRole }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update collaborator');
      }

      if (payload?.collaborator) {
        refreshCollaborators(
          collaborators.map((item) => (item.id === collaboratorId ? payload.collaborator : item))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error while updating collaborator');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Remove this collaborator from the collection?')) {
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collections/${collectionId}/collaborators/${collaboratorId}`,
        { method: 'DELETE' }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to remove collaborator');
      }

      refreshCollaborators(collaborators.filter((item) => item.id !== collaboratorId));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unexpected error while removing collaborator');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">Collaborators</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Manage who can help curate this collection. Editors can reorder and remove bookmarks, contributors can add new ones, and viewers have read-only access.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isOwner ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-neutral-300 p-4 sm:flex-row sm:items-center">
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="sm:flex-1"
              disabled={isBusy}
            />
            <Select value={role} onValueChange={(value) => setRole(value as CollaboratorRecord['role'])} disabled={isBusy}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {MANAGEABLE_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={isBusy}>
              {isBusy ? 'Adding…' : 'Invite' }
            </Button>
          </div>

          <div className="space-y-4">
            {collaborators.length === 0 ? (
              <p className="text-sm text-neutral-500">No collaborators yet.</p>
            ) : (
              collaborators.map((collaborator) => {
                const displayName = collaborator.user.display_name || collaborator.user.username;
                const isManageable = MANAGEABLE_ROLES.includes(collaborator.role);

                return (
                  <div
                    key={collaborator.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {collaborator.user.avatar_url ? (
                        <Image
                          src={collaborator.user.avatar_url}
                          alt={displayName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{displayName}</p>
                        <p className="text-xs text-neutral-500">@{collaborator.user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={collaborator.role}
                        disabled={!isOwner || !isManageable || isBusy}
                        onValueChange={(value) => handleRoleChange(collaborator.id, value as CollaboratorRecord['role'])}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS)
                            .filter(([key]) => key === 'owner' ? collaborator.role === 'owner' : true)
                            .map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {isManageable && (
                        <Button
                          variant="ghost"
                          className="text-sm text-red-600 hover:bg-red-50"
                          onClick={() => handleRemove(collaborator.id)}
                          disabled={isBusy}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Only the collection owner can manage collaborators.
        </p>
      )}
    </div>
  );
}
