import posthog from 'posthog-js';

// Initialize PostHog
export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture manually
      capture_pageleave: true,
    });
  }
}

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

// Track user identification
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', { $current_url: path });
  }
};

// Predefined events for Parcin
export const AnalyticsEvents = {
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTER_APPLIED: 'search_filter_applied',
  LOT_VIEWED: 'lot_viewed',
  
  // Reservation events
  RESERVATION_STARTED: 'reservation_started',
  RESERVATION_COMPLETED: 'reservation_completed',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  
  // Payment events
  PAYMENT_STARTED: 'payment_started',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // Check-in/out events
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',
  NO_SHOW: 'no_show',
  
  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  VEHICLE_ADDED: 'vehicle_added',
  
  // Operator events
  OPERATOR_LOT_CREATED: 'operator_lot_created',
  OPERATOR_AVAILABILITY_UPDATED: 'operator_availability_updated',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
};

// Helper functions for common events
export const trackSearchPerformed = (query: string, location?: string) => {
  trackEvent(AnalyticsEvents.SEARCH_PERFORMED, {
    search_query: query,
    user_location: location,
    timestamp: new Date().toISOString(),
  });
};

export const trackLotViewed = (lotId: string, lotName: string) => {
  trackEvent(AnalyticsEvents.LOT_VIEWED, {
    lot_id: lotId,
    lot_name: lotName,
    timestamp: new Date().toISOString(),
  });
};

export const trackReservationStarted = (lotId: string, amount: number) => {
  trackEvent(AnalyticsEvents.RESERVATION_STARTED, {
    lot_id: lotId,
    reservation_amount: amount,
    timestamp: new Date().toISOString(),
  });
};

export const trackReservationCompleted = (reservationId: string, lotId: string, amount: number) => {
  trackEvent(AnalyticsEvents.RESERVATION_COMPLETED, {
    reservation_id: reservationId,
    lot_id: lotId,
    reservation_amount: amount,
    timestamp: new Date().toISOString(),
  });
};

export const trackPaymentCompleted = (reservationId: string, amount: number, method: string) => {
  trackEvent(AnalyticsEvents.PAYMENT_COMPLETED, {
    reservation_id: reservationId,
    payment_amount: amount,
    payment_method: method,
    timestamp: new Date().toISOString(),
  });
};

export const trackCheckIn = (reservationId: string, lotId: string) => {
  trackEvent(AnalyticsEvents.CHECK_IN, {
    reservation_id: reservationId,
    lot_id: lotId,
    timestamp: new Date().toISOString(),
  });
};

export const trackCheckOut = (reservationId: string, lotId: string, duration: number) => {
  trackEvent(AnalyticsEvents.CHECK_OUT, {
    reservation_id: reservationId,
    lot_id: lotId,
    parking_duration: duration,
    timestamp: new Date().toISOString(),
  });
};

export const trackError = (error: string, context?: string) => {
  trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
    error_message: error,
    error_context: context,
    timestamp: new Date().toISOString(),
  });
};
