<template>
  <div class="w-full">
    <!-- En-tête avec navigation -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Disponibilités</h3>
      <div class="flex items-center space-x-2">
        <button
          @click="previousMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft class="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          @click="goToToday"
          class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Aujourd'hui
        </button>
        
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight class="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Légende -->
    <div class="flex items-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-green-500 rounded"></div>
        <span class="text-xs text-gray-700">Disponible</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-red-500 rounded"></div>
        <span class="text-xs text-gray-700">Réservé</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-gray-300 rounded"></div>
        <span class="text-xs text-gray-700">Passé</span>
      </div>
    </div>

    <!-- Grille du calendrier -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <!-- Mois et année -->
      <div class="text-center mb-4">
        <h4 class="text-base font-semibold text-gray-900">{{ currentMonthLabel }}</h4>
      </div>

      <!-- Jours de la semaine -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Grille du calendrier -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Jours vides au début -->
        <div
          v-for="n in firstDayOfMonth"
          :key="`empty-${n}`"
          class="aspect-square"
        ></div>

        <!-- Jours du mois -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          :class="[
            'aspect-square rounded-lg text-xs font-medium transition-all relative flex items-center justify-center',
            getDateClass(day)
          ]"
        >
          <span>{{ day }}</span>
          
          <!-- Indicateur d'état -->
          <div
            v-if="hasEventOnDate(day)"
            class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            :class="getEventColor(day)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Calendrier du mois suivant (optionnel, si showNextMonth est true) -->
    <div v-if="showNextMonth" class="mt-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="text-center mb-4">
          <h4 class="text-base font-semibold text-gray-900">{{ nextMonthLabel }}</h4>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-xs font-medium text-gray-500 py-2"
          >
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="n in firstDayOfNextMonth"
            :key="`empty-next-${n}`"
            class="aspect-square"
          ></div>

          <div
            v-for="day in daysInNextMonth"
            :key="day"
            :class="[
              'aspect-square rounded-lg text-xs font-medium transition-all relative flex items-center justify-center',
              getDateClassForMonth(day, nextMonthDate)
            ]"
          >
            <span>{{ day }}</span>
            <div
              v-if="hasEventOnDateForMonth(day, nextMonthDate)"
              class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
              :class="getEventColorForMonth(day, nextMonthDate)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { DateRange } from '@/utils/dateUtils'
import { normalizeDate, getDaysInMonth, getStartOfMonth, addMonths, subMonths, isSameDay, isBeforeDay } from '@/utils/dateUtils'

interface Props {
  bookedRanges?: DateRange[]
  blockedRanges?: DateRange[]
  showNextMonth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bookedRanges: () => [],
  blockedRanges: () => [],
  showNextMonth: true,
})

const currentDate = ref(getStartOfMonth(new Date()))
const nextMonthDate = computed(() => addMonths(currentDate.value, 1))

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const currentMonthLabel = computed(() => {
  return `${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const nextMonthLabel = computed(() => {
  return `${monthNames[nextMonthDate.value.getMonth()]} ${nextMonthDate.value.getFullYear()}`
})

const daysInMonth = computed(() => getDaysInMonth(currentDate.value))
const daysInNextMonth = computed(() => getDaysInMonth(nextMonthDate.value))

const firstDayOfMonth = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 0 = Lundi
})

const firstDayOfNextMonth = computed(() => {
  const firstDay = new Date(nextMonthDate.value.getFullYear(), nextMonthDate.value.getMonth(), 1)
  return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
})

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const goToToday = () => {
  currentDate.value = getStartOfMonth(new Date())
}

const getDateAt = (day: number, monthDate: Date = currentDate.value): Date => {
  const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
  return normalizeDate(date)
}

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const normalized = normalizeDate(date)
  const start = normalizeDate(startDate)
  const end = normalizeDate(endDate)
  return normalized >= start && normalized <= end
}

const isDateBooked = (day: number, monthDate: Date = currentDate.value): boolean => {
  const date = getDateAt(day, monthDate)
  return props.bookedRanges.some(range => {
    const start = normalizeDate(range.start)
    const end = normalizeDate(range.end)
    return isDateInRange(date, start, end)
  })
}

const isDateBlocked = (day: number, monthDate: Date = currentDate.value): boolean => {
  const date = getDateAt(day, monthDate)
  return props.blockedRanges.some(range => {
    const start = normalizeDate(range.start)
    const end = normalizeDate(range.end)
    return isDateInRange(date, start, end)
  })
}

const isDatePast = (day: number, monthDate: Date = currentDate.value): boolean => {
  const date = getDateAt(day, monthDate)
  const today = normalizeDate(new Date())
  return isBeforeDay(date, today)
}

const hasEventOnDate = (day: number): boolean => {
  return isDateBooked(day) || isDateBlocked(day)
}

const hasEventOnDateForMonth = (day: number, monthDate: Date): boolean => {
  return isDateBooked(day, monthDate) || isDateBlocked(day, monthDate)
}

const getEventColor = (day: number): string => {
  if (isDateBooked(day)) return 'bg-red-500'
  if (isDateBlocked(day)) return 'bg-orange-500'
  return ''
}

const getEventColorForMonth = (day: number, monthDate: Date): string => {
  if (isDateBooked(day, monthDate)) return 'bg-red-500'
  if (isDateBlocked(day, monthDate)) return 'bg-orange-500'
  return ''
}

const getDateClass = (day: number): string => {
  const date = getDateAt(day)
  const today = normalizeDate(new Date())
  const classes: string[] = []

  if (isSameDay(date, today)) {
    classes.push('ring-2 ring-blue-500')
  }

  if (isDatePast(day)) {
    classes.push('bg-gray-100 text-gray-400')
  } else if (isDateBooked(day)) {
    classes.push('bg-red-50 text-red-900 border border-red-200')
  } else if (isDateBlocked(day)) {
    classes.push('bg-orange-50 text-orange-900 border border-orange-200')
  } else {
    classes.push('bg-green-50 text-gray-900 border border-green-200')
  }

  return classes.join(' ')
}

const getDateClassForMonth = (day: number, monthDate: Date): string => {
  const date = getDateAt(day, monthDate)
  const today = normalizeDate(new Date())
  const classes: string[] = []

  if (isSameDay(date, today)) {
    classes.push('ring-2 ring-blue-500')
  }

  if (isDatePast(day, monthDate)) {
    classes.push('bg-gray-100 text-gray-400')
  } else if (isDateBooked(day, monthDate)) {
    classes.push('bg-red-50 text-red-900 border border-red-200')
  } else if (isDateBlocked(day, monthDate)) {
    classes.push('bg-orange-50 text-orange-900 border border-orange-200')
  } else {
    classes.push('bg-green-50 text-gray-900 border border-green-200')
  }

  return classes.join(' ')
}
</script>

