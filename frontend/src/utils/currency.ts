/**
 * Utilitaire de formatage des devises
 */

/**
 * Formate un prix en Francs CFA (XOF)
 * @param amount - Montant à formater
 * @param showDecimals - Afficher les décimales (par défaut: false car CFA n'utilise généralement pas de centimes)
 * @returns Prix formaté avec le symbole CFA
 */
export function formatCFA(amount: number, showDecimals: boolean = false): string {
    const formatted = showDecimals
        ? amount.toFixed(2)
        : Math.round(amount).toString()

    // Ajouter des espaces pour les milliers
    const withSpaces = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    return `${withSpaces} CFA`
}

/**
 * Formate un prix court (pour les cartes et affichages compacts)
 * @param amount - Montant à formater
 * @returns Prix formaté de manière compacte
 */
export function formatCFAShort(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M CFA`
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K CFA`
    }
    return `${amount} CFA`
}

/**
 * Formate un prix avec devise personnalisée
 * @param amount - Montant à formater
 * @param currency - Code de devise (XOF, EUR, USD, etc.)
 * @returns Prix formaté
 */
export function formatPrice(amount: number, currency: string = 'XOF'): string {
    const currencySymbols: Record<string, string> = {
        'XOF': 'CFA',
        'EUR': '€',
        'USD': '$',
        'GBP': '£'
    }

    const symbol = currencySymbols[currency] || currency
    const formatted = currency === 'XOF'
        ? Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        : amount.toFixed(2)

    return currency === 'XOF' || currency === 'CFA'
        ? `${formatted} ${symbol}`
        : `${symbol}${formatted}`
}
