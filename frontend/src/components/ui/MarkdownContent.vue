<template>
  <div class="markdown-content prose prose-sm max-w-none" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
}>()

const renderedContent = computed(() => {
  if (!props.content) return ''
  // Configurer marked pour gérer les retours à la ligne simples
  marked.setOptions({
    breaks: true,
    gfm: true
  })
  const html = marked.parse(props.content) as string
  return DOMPurify.sanitize(html)
})
</script>

<style>
.markdown-content ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content strong {
  font-weight: 700;
  color: #111827; /* gray-900 */
}
</style>
