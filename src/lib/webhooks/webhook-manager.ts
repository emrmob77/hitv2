/**
 * Webhook Management System
 *
 * Handles webhook subscriptions, delivery, and retry logic
 */

import crypto from 'crypto';

export interface WebhookSubscription {
  id: string;
  user_id: string;
  api_key_id?: string;
  url: string;
  events: string[];
  secret_key: string;
  is_active: boolean;
  failed_attempts: number;
  last_success_at?: string;
  last_failure_at?: string;
  description?: string;
  headers?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_subscription_id: string;
  event_type: string;
  event_data: any;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  http_status?: number;
  response_body?: string;
  error_message?: string;
  sent_at?: string;
  next_retry_at?: string;
  completed_at?: string;
  created_at: string;
}

/**
 * Available webhook events
 */
export const WEBHOOK_EVENTS = {
  BOOKMARK_CREATED: 'bookmark.created',
  BOOKMARK_UPDATED: 'bookmark.updated',
  BOOKMARK_DELETED: 'bookmark.deleted',
  COLLECTION_CREATED: 'collection.created',
  COLLECTION_UPDATED: 'collection.updated',
  COLLECTION_DELETED: 'collection.deleted',
  TAG_CREATED: 'tag.created',
  USER_UPDATED: 'user.updated',
} as const;

/**
 * Webhook Manager
 */
export class WebhookManager {
  /**
   * Create webhook subscription
   */
  static async createSubscription(
    userId: string,
    url: string,
    events: string[],
    supabase: any,
    options?: {
      api_key_id?: string;
      description?: string;
      headers?: Record<string, string>;
    }
  ): Promise<WebhookSubscription> {
    // Validate URL
    if (!this.isValidURL(url)) {
      throw new Error('Invalid webhook URL');
    }

    // Validate events
    if (!events.every((e) => Object.values(WEBHOOK_EVENTS).includes(e as any))) {
      throw new Error('Invalid webhook event');
    }

    // Generate secret key
    const secretKey = this.generateSecretKey();

    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .insert({
        user_id: userId,
        url,
        events,
        secret_key: secretKey,
        api_key_id: options?.api_key_id,
        description: options?.description,
        headers: options?.headers,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * List webhook subscriptions
   */
  static async listSubscriptions(
    userId: string,
    supabase: any
  ): Promise<WebhookSubscription[]> {
    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  /**
   * Delete webhook subscription
   */
  static async deleteSubscription(
    subscriptionId: string,
    userId: string,
    supabase: any
  ): Promise<void> {
    const { error } = await supabase
      .from('webhook_subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Deliver webhook
   */
  static async deliverWebhook(
    subscription: WebhookSubscription,
    eventType: string,
    eventData: any
  ): Promise<{
    success: boolean;
    status?: number;
    response?: string;
    error?: string;
  }> {
    try {
      // Generate signature
      const signature = this.generateSignature(eventData, subscription.secret_key);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-ID': subscription.id,
        'User-Agent': 'HitV2-Webhooks/1.0',
        ...subscription.headers,
      };

      // Deliver webhook
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: eventType,
          data: eventData,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseText = await response.text();

      return {
        success: response.ok,
        status: response.status,
        response: responseText,
      };
    } catch (error) {
      console.error('Webhook delivery error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Queue webhook delivery
   */
  static async queueDelivery(
    subscriptionId: string,
    eventType: string,
    eventData: any,
    supabase: any
  ): Promise<string> {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_subscription_id: subscriptionId,
        event_type: eventType,
        event_data: eventData,
        status: 'pending',
        next_retry_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  }

  /**
   * Process pending webhooks
   */
  static async processPendingWebhooks(supabase: any): Promise<void> {
    // Get pending deliveries
    const { data: deliveries } = await supabase
      .from('webhook_deliveries')
      .select('*, webhook_subscriptions(*)')
      .in('status', ['pending', 'retrying'])
      .lte('next_retry_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!deliveries || deliveries.length === 0) {
      return;
    }

    // Process each delivery
    for (const delivery of deliveries) {
      if (!delivery.webhook_subscriptions?.is_active) {
        continue;
      }

      const result = await this.deliverWebhook(
        delivery.webhook_subscriptions,
        delivery.event_type,
        delivery.event_data
      );

      // Update delivery
      const updates: any = {
        attempts: delivery.attempts + 1,
        sent_at: new Date().toISOString(),
      };

      if (result.success) {
        updates.status = 'sent';
        updates.http_status = result.status;
        updates.response_body = result.response?.substring(0, 1000); // Limit response size
        updates.completed_at = new Date().toISOString();

        // Update subscription success
        await supabase
          .from('webhook_subscriptions')
          .update({
            last_success_at: new Date().toISOString(),
            failed_attempts: 0,
          })
          .eq('id', delivery.webhook_subscription_id);
      } else {
        updates.status = delivery.attempts + 1 >= delivery.max_attempts ? 'failed' : 'retrying';
        updates.http_status = result.status;
        updates.error_message = result.error;

        // Calculate next retry (exponential backoff)
        if (delivery.attempts + 1 < delivery.max_attempts) {
          const backoffMinutes = Math.pow(2, delivery.attempts + 1); // 2, 4, 8 minutes
          updates.next_retry_at = new Date(
            Date.now() + backoffMinutes * 60 * 1000
          ).toISOString();
        } else {
          updates.completed_at = new Date().toISOString();

          // Update subscription failure
          await supabase
            .from('webhook_subscriptions')
            .update({
              last_failure_at: new Date().toISOString(),
              failed_attempts: delivery.webhook_subscriptions.failed_attempts + 1,
            })
            .eq('id', delivery.webhook_subscription_id);
        }
      }

      await supabase
        .from('webhook_deliveries')
        .update(updates)
        .eq('id', delivery.id);
    }
  }

  /**
   * Validate webhook signature
   */
  static validateSignature(
    payload: any,
    signature: string,
    secretKey: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secretKey);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get webhook delivery logs
   */
  static async getDeliveryLogs(
    subscriptionId: string,
    userId: string,
    supabase: any,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    // Verify ownership
    const { data: subscription } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const { data: deliveries } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return deliveries || [];
  }

  // Private helper methods

  private static generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private static generateSignature(payload: any, secretKey: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secretKey)
      .update(payloadString)
      .digest('hex');
  }

  private static isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
