<template>
  <div class="relative">
    <!-- Input déclencheur -->
    <div
      ref="triggerRef"
      @click="toggleCalendar"
      class="cursor-pointer"
    >
      <slot name="trigger" :dates="selectedDates" :isOpen="isOpen">
        <div class="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-2 bg-white hover:border-gray-400 transition-colors">
          <Calendar class="w-4 h-4 text-gray-500" />
          <div class="flex-1 text-sm">
            <span v-if="selectedDates.start && selectedDates.end" class="text-gray-900">
              {{ formatDate(selectedDates.start) }} - {{ formatDate(selectedDates.end) }}
            </span>
            <span v-else-if="selectedDates.start" class="text-gray-900">
              {{ formatDate(selectedDates.start) }} - ...
            </span>
            <span v-else class="text-gray-400">
              {{ placeholder }}
            </span>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400" :class="{ 'transform rotate-180': isOpen }" />
        </div>
      </slot>
    </div>

    <!-- Calendrier -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="calendarRef"
        class="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        :class="calendarClass"
      >
        <div class="flex items-center justify-between mb-4">
          <button
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft class="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 class="text-lg font-semibold text-gray-900">
            {{ currentMonthLabel }}
          </h3>
          
          <button
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </button>
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
          <button
            v-for="day in daysInMonth"
            :key="day"
            @click="selectDate(day)"
            :disabled="isDateDisabled(day)"
            :class="[
              'aspect-square rounded-lg text-sm font-medium transition-all',
              getDateClass(day),
              isDateDisabled(day) ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:bg-gray-100'
            ]"
          >
            {{ day }}
          </button>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button
            @click="clearDates"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Effacer
          </button>
          <button
            @click="applyDates"
            :disabled="!isSelectionComplete"
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  modelValue?: {
    start: Date | null
    end: Date | null
  }
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  showActions?: boolean
  autoApply?: boolean
  calendarClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionner des dates',
  showActions: false,
  autoApply: true,
  calendarClass: 'left-0',
  disabledDates: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: { start: Date | null; end: Date | null }]
  'change': [value: { start: Date | null; end: Date | null }]
}>()

const triggerRef = ref<HTMLElement>()
const calendarRef = ref<HTMLElement>()
const isOpen = ref(false)
const currentDate = ref(new Date())
const selectedDates = ref<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
})
const tempSelection = ref<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
})

const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// Initialiser avec la valeur du modèle
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedDates.value = {
      start: newValue.start ? new Date(newValue.start) : null,
      end: newValue.end ? new Date(newValue.end) : null,
    }
    tempSelection.value = { ...selectedDates.value }
  }
}, { immediate: true })

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const firstDayOfMonth = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return firstDay.getDay()
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const isSelectionComplete = computed(() => {
  return tempSelection.value.start !== null && tempSelection.value.end !== null
})

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const isDateDisabled = (day: number): boolean => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  date.setHours(0, 0, 0, 0)
  
  // Vérifier les dates min/max
  if (props.minDate) {
    const minDate = new Date(props.minDate)
    minDate.setHours(0, 0, 0, 0)
    if (date < minDate) return true
  }
  
  if (props.maxDate) {
    const maxDate = new Date(props.maxDate)
    maxDate.setHours(0, 0, 0, 0)
    if (date > maxDate) return true
  }
  
  // Vérifier les dates désactivées (dates réservées/bloquées)
  if (props.disabledDates.length > 0) {
    return props.disabledDates.some(disabledDate => {
      const normalizedDisabled = new Date(disabledDate)
      normalizedDisabled.setHours(0, 0, 0, 0)
      return date.getTime() === normalizedDisabled.getTime()
    })
  }
  
  // Ne pas permettre les dates passées
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) return true
  
  return false
}

const getDateClass = (day: number): string => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  date.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const classes: string[] = []
  
  // Date du jour
  if (date.getTime() === today.getTime()) {
    classes.push('border-2 border-red-500')
  }
  
  // Dates réservées/désactivées (grisées) - vérifier avant les dates sélectionnées
  const isDisabled = isDateDisabled(day)
  if (isDisabled) {
    classes.push('bg-gray-100 text-gray-400 line-through')
    return classes.join(' ') // Retourner tôt pour éviter d'ajouter d'autres styles
  }
  
  // Dates sélectionnées
  const startDate = tempSelection.value.start ? new Date(tempSelection.value.start) : null
  const endDate = tempSelection.value.end ? new Date(tempSelection.value.end) : null
  
  if (startDate) {
    startDate.setHours(0, 0, 0, 0)
    if (date.getTime() === startDate.getTime()) {
      classes.push('bg-red-600 text-white rounded-l-lg')
    }
  }
  
  if (endDate) {
    endDate.setHours(0, 0, 0, 0)
    if (date.getTime() === endDate.getTime()) {
      classes.push('bg-red-600 text-white rounded-r-lg')
    }
  }
  
  if (startDate && endDate && date >= startDate && date <= endDate) {
    // Ne pas ajouter la classe si c'est déjà une date de début ou fin
    if (date.getTime() !== startDate.getTime() && date.getTime() !== endDate.getTime()) {
      classes.push('bg-red-100 text-red-900')
    }
  }
  
  if (classes.length === 0 || (classes.length === 1 && classes[0] === 'border-2 border-red-500')) {
    classes.push('text-gray-900')
  }
  
  return classes.join(' ')
}

const selectDate = (day: number) => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  date.setHours(0, 0, 0, 0)
  
  // Si aucune date sélectionnée ou si on a déjà start et end, commencer une nouvelle sélection
  if (!tempSelection.value.start || (tempSelection.value.start && tempSelection.value.end)) {
    tempSelection.value = { start: date, end: null }
  } else {
    // Si on a déjà start, définir end
    if (date > tempSelection.value.start!) {
      tempSelection.value.end = date
    } else {
      // Si la nouvelle date est avant start, inverser
      tempSelection.value = { start: date, end: tempSelection.value.start }
    }
    
    // Si autoApply est activé, appliquer immédiatement
    if (props.autoApply && tempSelection.value.end) {
      applyDates()
    }
  }
}

const applyDates = () => {
  selectedDates.value = { ...tempSelection.value }
  emit('update:modelValue', selectedDates.value)
  emit('change', selectedDates.value)
  if (props.autoApply) {
    isOpen.value = false
  }
}

const clearDates = () => {
  tempSelection.value = { start: null, end: null }
  if (props.autoApply) {
    selectedDates.value = { start: null, end: null }
    emit('update:modelValue', selectedDates.value)
    emit('change', selectedDates.value)
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const toggleCalendar = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    tempSelection.value = { ...selectedDates.value }
  }
}

const closeCalendar = (event: MouseEvent) => {
  if (
    isOpen.value &&
    calendarRef.value &&
    triggerRef.value &&
    !calendarRef.value.contains(event.target as Node) &&
    !triggerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false
    if (!props.autoApply) {
      tempSelection.value = { ...selectedDates.value }
    }
  }
}

onMounted(() => {
  document.addEventListener('click', closeCalendar)
})

onUnmounted(() => {
  document.removeEventListener('click', closeCalendar)
})
</script>

