import { ref } from 'vue'

/**
 * Composable for managing SEO meta tags dynamically
 */

const APP_NAME = 'BnB Afriq'
const DEFAULT_DESCRIPTION = 'Découvrez les meilleures locations saisonnières en Afrique. Appartements, villas, maisons traditionnelles dans toute l\'Afrique francophone.'

export function useSeo() {
    const currentTitle = ref(document.title)
    const currentDescription = ref('')

    /**
     * Set the page title
     */
    function setPageTitle(title: string, includeAppName = true) {
        const fullTitle = includeAppName ? `${title} | ${APP_NAME}` : title
        document.title = fullTitle
        currentTitle.value = fullTitle

        // Update OG title
        updateMetaTag('og:title', fullTitle)
    }

    /**
     * Set the meta description
     */
    function setMetaDescription(description: string) {
        currentDescription.value = description
        updateMetaTag('description', description, 'name')
        updateMetaTag('og:description', description)
    }

    /**
     * Set Open Graph image
     */
    function setOgImage(imageUrl: string) {
        updateMetaTag('og:image', imageUrl)
    }

    /**
     * Set canonical URL
     */
    function setCanonicalUrl(url: string) {
        updateMetaTag('og:url', url)

        // Update or create canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
        if (!canonicalLink) {
            canonicalLink = document.createElement('link')
            canonicalLink.rel = 'canonical'
            document.head.appendChild(canonicalLink)
        }
        canonicalLink.href = url
    }

    /**
     * Set all SEO tags at once
     */
    function setSeoTags(options: {
        title: string
        description?: string
        image?: string
        url?: string
        includeAppName?: boolean
    }) {
        setPageTitle(options.title, options.includeAppName ?? true)

        if (options.description) {
            setMetaDescription(options.description)
        }

        if (options.image) {
            setOgImage(options.image)
        }

        if (options.url) {
            setCanonicalUrl(options.url)
        }
    }

    /**
     * Reset to default SEO tags
     */
    function resetSeo() {
        setPageTitle('Locations en Afrique')
        setMetaDescription(DEFAULT_DESCRIPTION)
    }

    return {
        currentTitle,
        currentDescription,
        setPageTitle,
        setMetaDescription,
        setOgImage,
        setCanonicalUrl,
        setSeoTags,
        resetSeo
    }
}

/**
 * Helper function to update or create a meta tag
 */
function updateMetaTag(name: string, content: string, attributeType: 'name' | 'property' = 'property') {
    let meta = document.querySelector(`meta[${attributeType}="${name}"]`) as HTMLMetaElement

    if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attributeType, name)
        document.head.appendChild(meta)
    }

    meta.content = content
}
