// Analytics tracking utilities for Grant Geenie
// Supports multiple analytics providers

type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

type PageViewData = {
  path: string;
  title: string;
};

class Analytics {
  private initialized = false;
  private gaId: string | null = null;

  // Initialize Google Analytics 4
  initGA4(measurementId: string) {
    if (this.initialized) return;

    this.gaId = measurementId;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // We'll handle page views manually
    });

    this.initialized = true;
  }

  // Track page views
  trackPageView(data: PageViewData) {
    if (!this.initialized || !this.gaId) return;

    if (window.gtag) {
      window.gtag('config', this.gaId, {
        page_path: data.path,
        page_title: data.title,
      });
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.initialized) return;

    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }

  // Track user authentication
  trackAuth(action: 'signup' | 'login' | 'logout') {
    this.trackEvent({
      category: 'User',
      action: action,
    });
  }

  // Track questionnaire completion
  trackQuestionnaireComplete() {
    this.trackEvent({
      category: 'Onboarding',
      action: 'questionnaire_complete',
    });
  }

  // Track grant interactions
  trackGrantAction(action: 'view' | 'favorite' | 'unfavorite' | 'search', grantId?: string) {
    this.trackEvent({
      category: 'Grant',
      action: `grant_${action}`,
      label: grantId,
    });
  }

  // Track subscription events
  trackSubscription(action: 'start' | 'cancel' | 'upgrade', tier?: string) {
    this.trackEvent({
      category: 'Subscription',
      action: `subscription_${action}`,
      label: tier,
    });
  }

  // Track search queries
  trackSearch(query: string, resultCount: number) {
    this.trackEvent({
      category: 'Search',
      action: 'search_query',
      label: query,
      value: resultCount,
    });
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Export singleton instance
export const analytics = new Analytics();
