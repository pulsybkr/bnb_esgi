/**
 * Sentry/GlitchTip integration for Vue.js
 * Compatible with GlitchTip (self-hosted) or Sentry.io
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'

// Configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
const ENVIRONMENT = import.meta.env.MODE || 'development'

interface SentryConfig {
    app: App
    router: Router
}

// Global error state
let isInitialized = false

/**
 * Initialize Sentry for Vue.js application
 * Works with both Sentry.io and GlitchTip
 */
export function initSentry({ app, router }: SentryConfig) {
    if (!SENTRY_DSN) {
        console.warn('⚠️ Sentry DSN not configured. Error tracking disabled.')
        return
    }

    if (isInitialized) {
        return
    }

    // Dynamic import to avoid bundle size impact if not used
    import('@sentry/vue').then((Sentry) => {
        Sentry.init({
            app,
            dsn: SENTRY_DSN,
            environment: ENVIRONMENT,
            release: `bnb-afriq@${APP_VERSION}`,

            // Performance monitoring
            integrations: [
                Sentry.browserTracingIntegration({ router }),
            ],

            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
            // Reduce in production for high-traffic apps
            tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,

            // Capture Replay for 10% of all sessions, plus for 100% of sessions with an error
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            // Filter out specific errors
            beforeSend(event, hint) {
                // Don't send errors in development unless explicitly enabled
                if (ENVIRONMENT === 'development' && !import.meta.env.VITE_SENTRY_DEV) {
                    console.log('🐛 Sentry would capture:', event)
                    return null
                }

                // Filter out common non-actionable errors
                const error = hint.originalException
                if (error instanceof Error) {
                    // Ignore network errors that are expected
                    if (error.message.includes('Network Error')) {
                        return null
                    }
                    // Ignore cancelled requests
                    if (error.message.includes('canceled')) {
                        return null
                    }
                }

                return event
            },
        })

        isInitialized = true
        console.log('✅ Sentry initialized for error tracking')
    }).catch((err) => {
        console.warn('⚠️ Failed to load Sentry:', err)
    })
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
    if (!SENTRY_DSN) return

    import('@sentry/vue').then((Sentry) => {
        if (context) {
            Sentry.withScope((scope) => {
                Object.entries(context).forEach(([key, value]) => {
                    scope.setExtra(key, value)
                })
                Sentry.captureException(error)
            })
        } else {
            Sentry.captureException(error)
        }
    })
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!SENTRY_DSN) return

    import('@sentry/vue').then((Sentry) => {
        Sentry.captureMessage(message, level)
    })
}

/**
 * Set user context for error reports
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
    if (!SENTRY_DSN) return

    import('@sentry/vue').then((Sentry) => {
        Sentry.setUser(user)
    })
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
    category: string
    message: string
    level?: 'info' | 'warning' | 'error'
    data?: Record<string, any>
}) {
    if (!SENTRY_DSN) return

    import('@sentry/vue').then((Sentry) => {
        Sentry.addBreadcrumb({
            ...breadcrumb,
            level: breadcrumb.level || 'info',
        })
    })
}
