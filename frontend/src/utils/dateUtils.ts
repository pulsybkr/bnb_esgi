/**
 * Utilitaires pour la gestion des dates et vérification de conflits
 */

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Vérifie si deux plages de dates se chevauchent
 */
export function dateRangesOverlap(range1: DateRange, range2: DateRange): boolean {
  const start1 = range1.start.getTime()
  const end1 = range1.end.getTime()
  const start2 = range2.start.getTime()
  const end2 = range2.end.getTime()

  // Deux plages se chevauchent si :
  // - start1 est entre start2 et end2, OU
  // - end1 est entre start2 et end2, OU
  // - range1 contient complètement range2
  return (start1 >= start2 && start1 < end2) ||
         (end1 > start2 && end1 <= end2) ||
         (start1 <= start2 && end1 >= end2)
}

/**
 * Vérifie si une plage de dates chevauche avec au moins une des plages réservées
 */
export function hasDateConflict(
  selectedRange: DateRange,
  bookedRanges: DateRange[]
): boolean {
  return bookedRanges.some(bookedRange => 
    dateRangesOverlap(selectedRange, bookedRange)
  )
}

/**
 * Génère toutes les dates d'une plage (incluses)
 */
export function getDatesInRange(range: DateRange): Date[] {
  const dates: Date[] = []
  const current = new Date(range.start)
  current.setHours(0, 0, 0, 0)
  const end = new Date(range.end)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Génère toutes les dates des plages réservées
 */
export function getBookedDates(bookedRanges: DateRange[]): Date[] {
  const allDates: Date[] = []
  
  bookedRanges.forEach(range => {
    const dates = getDatesInRange(range)
    allDates.push(...dates)
  })

  // Supprimer les doublons
  return Array.from(
    new Set(allDates.map(date => date.getTime()))
  ).map(time => new Date(time))
}

/**
 * Vérifie si une date se trouve dans une des plages réservées
 */
export function isDateInBookedRange(date: Date, bookedRanges: DateRange[]): boolean {
  const dateTime = date.getTime()
  date.setHours(0, 0, 0, 0)

  return bookedRanges.some(range => {
    const start = new Date(range.start)
    start.setHours(0, 0, 0, 0)
    const end = new Date(range.end)
    end.setHours(0, 0, 0, 0)

    return date >= start && date <= end
  })
}

/**
 * Normalise une date (met les heures à 0)
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Vérifie si deux dates sont le même jour (ignorant l'heure)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return normalizeDate(date1).getTime() === normalizeDate(date2).getTime()
}

/**
 * Vérifie si date1 est avant date2 (ignorant l'heure)
 */
export function isBeforeDay(date1: Date, date2: Date): boolean {
  return normalizeDate(date1).getTime() < normalizeDate(date2).getTime()
}

/**
 * Vérifie si date1 est après date2 (ignorant l'heure)
 */
export function isAfterDay(date1: Date, date2: Date): boolean {
  return normalizeDate(date1).getTime() > normalizeDate(date2).getTime()
}

/**
 * Retourne le nombre de jours dans un mois donné
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Retourne le premier jour du mois d'une date donnée (normalisé)
 */
export function getStartOfMonth(date: Date): Date {
  return normalizeDate(new Date(date.getFullYear(), date.getMonth(), 1))
}

/**
 * Ajoute un nombre de mois à une date
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return normalizeDate(newDate)
}

/**
 * Soustrait un nombre de mois à une date
 */
export function subMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() - months)
  return normalizeDate(newDate)
}

/**
 * Vérifie si une date est valide pour une sélection
 */
export function isValidDateSelection(
  date: Date,
  selectedStart: Date | null,
  bookedRanges: DateRange[]
): { valid: boolean; reason?: string } {
  const normalized = normalizeDate(date)
  const today = normalizeDate(new Date())

  // Ne pas permettre les dates passées
  if (normalized < today) {
    return { valid: false, reason: 'Les dates passées ne sont pas autorisées' }
  }

  // Si on a déjà une date de début, vérifier que la date de fin est après
  if (selectedStart) {
    const normalizedStart = normalizeDate(selectedStart)
    if (normalized <= normalizedStart) {
      return { valid: false, reason: 'La date de fin doit être après la date de début' }
    }

    // Vérifier les conflits avec les réservations existantes
    const range: DateRange = {
      start: normalizedStart,
      end: normalized
    }

    if (hasDateConflict(range, bookedRanges)) {
      return { valid: false, reason: 'Cette période est déjà réservée' }
    }
  } else {
    // Vérifier si la date est dans une plage réservée
    if (isDateInBookedRange(normalized, bookedRanges)) {
      return { valid: false, reason: 'Cette date est déjà réservée' }
    }
  }

  return { valid: true }
}

