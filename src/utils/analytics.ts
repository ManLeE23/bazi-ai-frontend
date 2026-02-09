import { postAnalyticsEvents } from '@/api/services';

const SESSION_KEY = 'app_analytics_session_id';
const QUEUE_KEY = 'app_analytics_queue';
const FLUSH_INTERVAL = 10000; // 10 seconds
const BATCH_SIZE = 10;

interface AnalyticsEvent {
  event_type: string;
  source: string;
  page?: string;
  session_id: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsManager {
  private sessionId: string = '';
  private eventQueue: AnalyticsEvent[] = [];
  private timer: any = null;
  private isFlushing: boolean = false;

  constructor() {
    this.eventQueue = uni.getStorageSync(QUEUE_KEY) || [];
  }

  // Generate simple UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Initialize session (call on App Launch)
  public initSession() {
    this.sessionId = this.generateUUID();
    console.log('[Analytics] Session initialized:', this.sessionId);
    this.startFlushTimer();
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Track event
  public track(eventType: string, properties?: Record<string, any>) {
    if (!this.sessionId) {
      console.warn('[Analytics] Session not initialized, auto-initializing...');
      this.initSession();
    }

    // Get current page
    let currentPage = '';
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const page = pages[pages.length - 1];
      currentPage = page ? `/${page.route}` : '';
    }

    const event: AnalyticsEvent = {
      event_type: eventType,
      source: 'miniapp', // Default to miniapp as per requirement
      page: currentPage,
      session_id: this.sessionId,
      properties: properties || {},
      timestamp: Date.now()
    };

    this.eventQueue.push(event);
    this.saveQueue();
    
    // If queue is large enough, flush immediately
    if (this.eventQueue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  private saveQueue() {
    try {
      uni.setStorageSync(QUEUE_KEY, this.eventQueue);
    } catch (e) {
      console.error('[Analytics] Failed to save queue', e);
    }
  }

  private startFlushTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  private async flush() {
    if (this.eventQueue.length === 0 || this.isFlushing) return;
    
    this.isFlushing = true;
    const eventsToSend = [...this.eventQueue];
    
    // Clear queue temporarily (optimistic) - or keep until success. 
    // To be safe, we keep in queue until success, but for simplicity here:
    // We'll take a snapshot.
    
    try {
      console.log(`[Analytics] Flushing ${eventsToSend.length} events`);
      await postAnalyticsEvents({ events: eventsToSend });
      
      // Remove sent events from queue
      // Note: New events might have been added while flushing
      // We should only remove the ones we sent.
      // But since JS is single threaded mostly here, straightforward slicing works usually.
      // Better: filter out by timestamp or ID if we had one.
      // Let's just remove the first N count.
      this.eventQueue.splice(0, eventsToSend.length);
      this.saveQueue();
    } catch (error) {
      console.error('[Analytics] Flush failed', error);
      // Keep events in queue for next retry
    } finally {
      this.isFlushing = false;
    }
  }
}

export const analytics = new AnalyticsManager();
