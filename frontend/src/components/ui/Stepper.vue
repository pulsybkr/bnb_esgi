<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-8">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex items-center"
        :class="{ 'flex-1': index < steps.length - 1 }"
      >
        <!-- Step circle -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
              index < currentStep
                ? 'bg-african-green text-white'
                : index === currentStep
                ? 'bg-african-green text-white ring-4 ring-green-100'
                : 'bg-gray-200 text-gray-500'
            ]"
          >
            <Check v-if="index < currentStep" class="w-5 h-5" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            :class="[
              'mt-2 text-xs font-medium text-center',
              index <= currentStep ? 'text-african-green' : 'text-gray-500'
            ]"
          >
            {{ step }}
          </span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          :class="[
            'flex-1 h-1 mx-4 rounded-full transition-all',
            index < currentStep ? 'bg-african-green' : 'bg-gray-200'
          ]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

defineProps<{
  steps: string[]
  currentStep: number
}>()
</script>
