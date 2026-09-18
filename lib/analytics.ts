export type AnalyticsEvent =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_started'
  | 'signup'
  | 'store_created';

export function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? [];
      dataLayer.push({ event, properties: properties ?? {} });
    }
  } catch {
    // noop: analytics should never block the app
  }
}
