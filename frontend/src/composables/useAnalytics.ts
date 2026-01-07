/**
 * Composable for Matomo Analytics integration
 * Provides tracking functions for page views and custom events
 */

declare global {
    interface Window {
        _paq?: any[]
    }
}

// Configuration - à mettre à jour après installation Matomo
const MATOMO_URL = import.meta.env.VITE_MATOMO_URL || 'http://localhost:8081/'
const MATOMO_SITE_ID = import.meta.env.VITE_MATOMO_SITE_ID || '1'

let isInitialized = false

export function useAnalytics() {
    /**
     * Initialize Matomo tracker
     * Should be called once on app mount
     */
    function init() {
        if (isInitialized) return

        // Initialize _paq array
        window._paq = window._paq || []

        // Configure tracker
        window._paq.push(['trackPageView'])
        window._paq.push(['enableLinkTracking'])
        window._paq.push(['setTrackerUrl', `${MATOMO_URL}matomo.php`])
        window._paq.push(['setSiteId', MATOMO_SITE_ID])

        // Load Matomo script asynchronously
        const script = document.createElement('script')
        script.async = true
        script.src = `${MATOMO_URL}matomo.js`

        script.onerror = () => {
            console.warn('⚠️ Matomo script failed to load. Analytics disabled.')
        }

        const firstScript = document.getElementsByTagName('script')[0]
        firstScript.parentNode?.insertBefore(script, firstScript)

        isInitialized = true
        console.log('📊 Matomo Analytics initialized')
    }

    /**
     * Track a page view
     */
    function trackPageView(title?: string, url?: string) {
        if (!window._paq) return

        if (url) {
            window._paq.push(['setCustomUrl', url])
        }
        if (title) {
            window._paq.push(['setDocumentTitle', title])
        }
        window._paq.push(['trackPageView'])
    }

    /**
     * Track a custom event
     */
    function trackEvent(category: string, action: string, name?: string, value?: number) {
        if (!window._paq) return

        const eventData: (string | number | undefined)[] = ['trackEvent', category, action]
        if (name) eventData.push(name)
        if (value !== undefined) eventData.push(value)

        window._paq.push(eventData)
    }

    /**
     * Track a search query
     */
    function trackSearch(keyword: string, category?: string, resultsCount?: number) {
        if (!window._paq) return

        window._paq.push(['trackSiteSearch', keyword, category, resultsCount])
    }

    /**
     * Set user ID for cross-device tracking
     */
    function setUserId(userId: string) {
        if (!window._paq) return

        window._paq.push(['setUserId', userId])
    }

    /**
     * Reset user ID on logout
     */
    function resetUserId() {
        if (!window._paq) return

        window._paq.push(['resetUserId'])
    }

    /**
     * Track a goal conversion
     */
    function trackGoal(goalId: number, revenue?: number) {
        if (!window._paq) return

        window._paq.push(['trackGoal', goalId, revenue])
    }

    return {
        init,
        trackPageView,
        trackEvent,
        trackSearch,
        setUserId,
        resetUserId,
        trackGoal
    }
}
