import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface SyncItem {
  id: string;
  entity_type: 'bookmark' | 'collection' | 'post' | 'link_group' | 'settings';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  sync_data: any;
  created_at: string;
}

export interface DeviceSession {
  id: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  platform?: string;
  is_active: boolean;
  last_activity_at: string;
}

/**
 * Cross-Device Sync Manager
 *
 * Handles synchronization of data across multiple devices
 */
export class CrossDeviceSync {
  private supabase = createSupabaseBrowserClient();
  private deviceId: string;
  private userId: string | null = null;

  constructor(deviceId?: string) {
    this.deviceId = deviceId || this.generateDeviceId();
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    // Try to get existing device ID from localStorage
    if (typeof window !== 'undefined') {
      const existingId = localStorage.getItem('device_id');
      if (existingId) {
        return existingId;
      }

      // Generate new device ID
      const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', newId);
      return newId;
    }

    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register current device session
   */
  async registerDevice(options: {
    deviceName?: string;
    deviceType?: string;
    platform?: string;
  }): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    this.userId = user.id;

    // Detect device info
    const deviceType =
      options.deviceType ||
      (/mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop');
    const platform = options.platform || 'web';

    // Register or update device session
    const { error } = await this.supabase.rpc('register_device_session', {
      p_user_id: user.id,
      p_device_id: this.deviceId,
      p_device_name: options.deviceName || `${deviceType} - ${platform}`,
      p_device_type: deviceType,
      p_platform: platform,
      p_session_data: {},
    });

    if (error) {
      console.error('Failed to register device:', error);
    }
  }

  /**
   * Queue an item for synchronization
   */
  async queueSync(options: {
    entityType: 'bookmark' | 'collection' | 'post' | 'link_group' | 'settings';
    entityId: string;
    action: 'create' | 'update' | 'delete';
    data: any;
    targetDevices?: string[];
  }): Promise<void> {
    if (!this.userId) {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return;
      this.userId = user.id;
    }

    const { error } = await this.supabase.rpc('queue_sync', {
      p_user_id: this.userId,
      p_entity_type: options.entityType,
      p_entity_id: options.entityId,
      p_action: options.action,
      p_sync_data: options.data,
      p_target_device_ids: options.targetDevices || null,
    });

    if (error) {
      console.error('Failed to queue sync:', error);
    }
  }

  /**
   * Get pending sync items for current device
   */
  async getPendingSyncItems(): Promise<SyncItem[]> {
    if (!this.userId) {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return [];
      this.userId = user.id;
    }

    const { data, error } = await this.supabase
      .from('sync_queue')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_processed', false)
      .not('processed_by_devices', 'cs', `{${this.deviceId}}`) // Not yet processed by this device
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Failed to get pending sync items:', error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      action: item.action,
      sync_data: item.sync_data,
      created_at: item.created_at,
    }));
  }

  /**
   * Process sync items
   */
  async processSyncItems(items: SyncItem[]): Promise<void> {
    for (const item of items) {
      try {
        // Apply the sync based on entity type and action
        await this.applySyncItem(item);

        // Mark as processed
        await this.supabase.rpc('mark_sync_processed', {
          p_sync_id: item.id,
          p_device_id: this.deviceId,
        });
      } catch (error) {
        console.error(`Failed to process sync item ${item.id}:`, error);
      }
    }
  }

  /**
   * Apply a single sync item
   */
  private async applySyncItem(item: SyncItem): Promise<void> {
    switch (item.entity_type) {
      case 'bookmark':
        await this.syncBookmark(item);
        break;
      case 'collection':
        await this.syncCollection(item);
        break;
      case 'settings':
        await this.syncSettings(item);
        break;
      default:
        console.warn(`Unknown entity type: ${item.entity_type}`);
    }
  }

  /**
   * Sync bookmark
   */
  private async syncBookmark(item: SyncItem): Promise<void> {
    const table = this.supabase.from('bookmarks');

    switch (item.action) {
      case 'create':
      case 'update':
        await table.upsert(item.sync_data);
        break;
      case 'delete':
        await table.delete().eq('id', item.entity_id);
        break;
    }
  }

  /**
   * Sync collection
   */
  private async syncCollection(item: SyncItem): Promise<void> {
    const table = this.supabase.from('collections');

    switch (item.action) {
      case 'create':
      case 'update':
        await table.upsert(item.sync_data);
        break;
      case 'delete':
        await table.delete().eq('id', item.entity_id);
        break;
    }
  }

  /**
   * Sync settings
   */
  private async syncSettings(item: SyncItem): Promise<void> {
    if (typeof window !== 'undefined') {
      // Update local settings
      Object.keys(item.sync_data).forEach((key) => {
        localStorage.setItem(key, JSON.stringify(item.sync_data[key]));
      });
    }
  }

  /**
   * Start automatic sync (poll for changes)
   */
  startAutoSync(intervalMs: number = 30000): NodeJS.Timer {
    const interval = setInterval(async () => {
      const items = await this.getPendingSyncItems();
      if (items.length > 0) {
        await this.processSyncItems(items);
      }
    }, intervalMs);

    return interval;
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(interval: NodeJS.Timer): void {
    clearInterval(interval);
  }

  /**
   * Get all device sessions for current user
   */
  async getDeviceSessions(): Promise<DeviceSession[]> {
    if (!this.userId) {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) return [];
      this.userId = user.id;
    }

    const { data, error } = await this.supabase
      .from('device_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('last_activity_at', { ascending: false });

    if (error) {
      console.error('Failed to get device sessions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Deactivate a device session
   */
  async deactivateDevice(deviceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('device_sessions')
      .update({ is_active: false })
      .eq('device_id', deviceId);

    if (error) {
      console.error('Failed to deactivate device:', error);
    }
  }
}
