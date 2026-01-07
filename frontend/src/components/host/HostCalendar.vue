<template>
  <div class="w-full">
    <!-- En-tête avec navigation -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ currentMonthLabel }}</h2>
        <p class="text-sm text-gray-500 mt-1">Gérez la disponibilité de votre logement</p>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="previousMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft class="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          @click="goToToday"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Aujourd'hui
        </button>
        
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight class="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Légende -->
    <div class="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-green-500 rounded"></div>
        <span class="text-sm text-gray-700">Disponible</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-red-500 rounded"></div>
        <span class="text-sm text-gray-700">Réservé</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-orange-500 rounded"></div>
        <span class="text-sm text-gray-700">Bloqué</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-gray-300 rounded"></div>
        <span class="text-sm text-gray-700">Passé</span>
      </div>
    </div>

    <!-- Grille du calendrier -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <!-- Jours de la semaine -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-semibold text-gray-600 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Grille du calendrier -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Jours vides au début -->
        <div
          v-for="n in firstDayOfMonth"
          :key="`empty-${n}`"
          class="aspect-square"
        ></div>

        <!-- Jours du mois -->
        <button
          v-for="day in daysInMonth"
          :key="day"
          @click="selectDate(day)"
          @contextmenu.prevent="showContextMenu($event, day)"
          :class="[
            'aspect-square rounded-lg text-sm font-medium transition-all relative',
            getDateClass(day),
            isDateClickable(day) ? 'cursor-pointer hover:ring-2 hover:ring-indigo-600' : 'cursor-default'
          ]"
        >
          <span class="absolute top-1 left-1">{{ day }}</span>
          
          <!-- Indicateur d'événement -->
          <div
            v-if="hasEventOnDate(day)"
            class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
            :class="getEventColor(day)"
          ></div>
        </button>
      </div>
    </div>

    <!-- Menu contextuel pour bloquer/débloquer -->
    <div
      v-if="contextMenuVisible"
      ref="contextMenuRef"
      class="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
    >
      <button
        @click="blockSelectedDate"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Bloquer cette date
      </button>
      <button
        @click="blockDateRange"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Bloquer une plage de dates
      </button>
      <button
        v-if="isDateBlocked(selectedContextDate)"
        @click="unblockSelectedDate"
        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        Débloquer
      </button>
    </div>

    <!-- Modal pour bloquer une plage de dates -->
    <div
      v-if="showBlockModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      @click.self="closeBlockModal"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Bloquer des dates</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Du
            </label>
            <input
              v-model="blockRangeStart"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Au
            </label>
            <input
              v-model="blockRangeEnd"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Raison (optionnel)
            </label>
            <textarea
              v-model="blockReason"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              placeholder="Ex: Maintenance, Utilisation personnelle..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="closeBlockModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="confirmBlockRange"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Bloquer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Booking, BlockedDate, CalendarEvent } from '@/types/booking'
import { normalizeDate, getDaysInMonth, getStartOfMonth, addMonths, subMonths, isSameDay, isBeforeDay } from '@/utils/dateUtils'

interface Props {
  bookings?: Booking[]
  blockedDates?: BlockedDate[]
  onDateBlock?: (startDate: Date, endDate: Date, reason?: string) => void
  onDateUnblock?: (blockedDateId: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  bookings: () => [],
  blockedDates: () => [],
})

const emit = defineEmits<{
  'date-selected': [date: Date]
  'date-blocked': [startDate: Date, endDate: Date, reason?: string]
  'date-unblocked': [blockedDateId: string]
}>()

const currentDate = ref(getStartOfMonth(new Date()))
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedContextDate = ref<Date | null>(null)
const contextMenuRef = ref<HTMLElement>()
const showBlockModal = ref(false)
const blockRangeStart = ref('')
const blockRangeEnd = ref('')
const blockReason = ref('')

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const currentMonthLabel = computed(() => {
  return `${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const daysInMonth = computed(() => getDaysInMonth(currentDate.value))
const firstDayOfMonth = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // 0 = Lundi
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

const getDateAt = (day: number): Date => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  return normalizeDate(date)
}

const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const normalized = normalizeDate(date)
  const start = normalizeDate(startDate)
  const end = normalizeDate(endDate)
  return normalized >= start && normalized <= end
}

const isDateBooked = (day: number): boolean => {
  const date = getDateAt(day)
  return props.bookings.some(booking => {
    const checkIn = normalizeDate(booking.checkIn)
    const checkOut = normalizeDate(booking.checkOut)
    return isDateInRange(date, checkIn, checkOut)
  })
}

const isDateBlocked = (date: Date | null): boolean => {
  if (!date) return false
  const normalized = normalizeDate(date)
  return props.blockedDates.some(blocked => {
    const start = normalizeDate(blocked.startDate)
    const end = normalizeDate(blocked.endDate)
    return isDateInRange(normalized, start, end)
  })
}

const isDatePast = (day: number): boolean => {
  const date = getDateAt(day)
  const today = normalizeDate(new Date())
  return isBeforeDay(date, today)
}

const hasEventOnDate = (day: number): boolean => {
  return isDateBooked(day) || isDateBlocked(getDateAt(day))
}

const getEventColor = (day: number): string => {
  if (isDateBooked(day)) return 'bg-red-500'
  if (isDateBlocked(getDateAt(day))) return 'bg-orange-500'
  return ''
}

const getDateClass = (day: number): string => {
  const date = getDateAt(day)
  const today = normalizeDate(new Date())
  const classes: string[] = []

  if (isSameDay(date, today)) {
    classes.push('ring-2 ring-indigo-600')
  }

  if (isDatePast(day)) {
    classes.push('bg-gray-100 text-gray-400')
  } else if (isDateBooked(day)) {
    classes.push('bg-red-50 text-red-900 border border-red-200')
  } else if (isDateBlocked(getDateAt(day))) {
    classes.push('bg-orange-50 text-orange-900 border border-orange-200')
  } else {
    classes.push('bg-green-50 text-gray-900 border border-green-200 hover:bg-green-100')
  }

  return classes.join(' ')
}

const isDateClickable = (day: number): boolean => {
  return !isDatePast(day)
}

const selectDate = (day: number) => {
  if (!isDateClickable(day)) return
  const date = getDateAt(day)
  emit('date-selected', date)
}

const showContextMenu = (event: MouseEvent, day: number) => {
  if (!isDateClickable(day)) return
  
  event.preventDefault()
  const date = getDateAt(day)
  selectedContextDate.value = date
  
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  selectedContextDate.value = null
}

const blockSelectedDate = () => {
  if (!selectedContextDate.value) return
  
  const dateStr = selectedContextDate.value.toISOString().split('T')[0]
  blockRangeStart.value = dateStr
  blockRangeEnd.value = dateStr
  showBlockModal.value = true
  closeContextMenu()
}

const blockDateRange = () => {
  if (!selectedContextDate.value) return
  
  const dateStr = selectedContextDate.value.toISOString().split('T')[0]
  blockRangeStart.value = dateStr
  blockRangeEnd.value = ''
  showBlockModal.value = true
  closeContextMenu()
}

const unblockSelectedDate = () => {
  if (!selectedContextDate.value) return
  
  const blocked = props.blockedDates.find(blocked => {
    const start = normalizeDate(blocked.startDate)
    const end = normalizeDate(blocked.endDate)
    const selected = normalizeDate(selectedContextDate.value!)
    return selected >= start && selected <= end
  })
  
  if (blocked) {
    emit('date-unblocked', blocked.id)
  }
  
  closeContextMenu()
}

const closeBlockModal = () => {
  showBlockModal.value = false
  blockRangeStart.value = ''
  blockRangeEnd.value = ''
  blockReason.value = ''
}

const confirmBlockRange = () => {
  if (!blockRangeStart.value) return
  
  const startDate = new Date(blockRangeStart.value)
  const endDate = blockRangeEnd.value ? new Date(blockRangeEnd.value) : new Date(blockRangeStart.value)
  
  if (endDate < startDate) {
    alert('La date de fin doit être après la date de début')
    return
  }
  
  emit('date-blocked', startDate, endDate, blockReason.value || undefined)
  closeBlockModal()
}

const handleClickOutside = (event: MouseEvent) => {
  if (contextMenuVisible.value && contextMenuRef.value && !contextMenuRef.value.contains(event.target as Node)) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

