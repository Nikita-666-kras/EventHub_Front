<template>
  <div class="lenta-page fade-in">
    <NavBar />

    <div class="main-wrapper">
      <div class="events-container">
        <EventCard v-for="event in events" :key="event.id" :event="event" class="event-card" />
      </div>

      <div v-if="loading" class="loader-container">
        <div class="loader"></div>
      </div>
      <p v-if="!hasMore && !loading" class="no-more-events">Упс, Больше мероприятий нет <br> :(</p>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import EventCard from '@/components/EventCard.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/utils/axios'

const events = ref([])
const loading = ref(false)
const hasMore = ref(true)
let cursor = ''
const limit = 5

const formatCursor = (dateStr) => {
  // Преобразуем дату к ISO с миллисекундами без Z
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toISOString().replace('Z', '')
}

const fetchEvents = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const sortBy = 'create_date'
    const url = cursor
      ? `/events/page?cursor=${encodeURIComponent(cursor)}&limit=${limit}&sortBy=${sortBy}`
      : `/events/page?limit=${limit}&sortBy=${sortBy}`

    const response = await api.get(url)
    const newEvents = response.data || []

    // Убрать дубли по id
    const existingIds = new Set(events.value.map(e => e.id))
    const uniqueNewEvents = newEvents.filter(e => !existingIds.has(e.id))
    events.value.push(...uniqueNewEvents)

    if (uniqueNewEvents.length < limit) {
      hasMore.value = false
    }

    if (uniqueNewEvents.length > 0) {
      // Курсор — дата последнего события (ISO с миллисекундами)
      cursor = formatCursor(uniqueNewEvents[uniqueNewEvents.length - 1].createDate)
    }
  } catch (err) {
    console.error('[❌] Ошибка загрузки событий:', err)
    if (err?.response?.status === 400) {
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

let throttle = false

const handleScroll = () => {
  if (throttle) return
  throttle = true

  setTimeout(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
      fetchEvents()
    }
    throttle = false
  }, 200)
}

onMounted(() => {
  fetchEvents()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.lenta-page {
  /* Стили для всей страницы ленты, если нужны */
  overflow-x: hidden;
  /* Убираем горизонтальную прокрутку на уровне страницы */
}

.main-wrapper {
  padding: 1rem;
  min-height: 100vh;
  background: #150A1E;
  animation: fadeIn 0.5s ease-out;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  /* Центрирование контейнера карточек */
  padding: 0 1rem;
  /* Добавляем внутренние отступы, чтобы контент не прилипал к краям */
}

.event-card {
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.5s ease-out forwards;
  transition: all 0.3s ease;
  width: 100%;
  border-radius: 16px;
  /* Карточки занимают всю доступную ширину контейнера */
  box-sizing: border-box;
  /* Учитываем padding и border в общей ширине */
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.event-card:nth-child(1) {
  animation-delay: 0.1s;
}

.event-card:nth-child(2) {
  animation-delay: 0.2s;
}

.event-card:nth-child(3) {
  animation-delay: 0.3s;
}

.event-card:nth-child(4) {
  animation-delay: 0.4s;
}

.event-card:nth-child(5) {
  animation-delay: 0.5s;
}

.loader-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;
}

.no-more-events {
  color: #aaa;
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
  animation: fadeIn 0.5s ease-out;
  transition: color 0.3s ease;
  padding: 0 1rem;
}

.no-more-events:hover {
  color: #9333ea;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Добавляем медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    padding: 1rem;
    padding-top: 76px;
    /* Добавляем отступ для шапки */
  }

  .events-container {
    gap: 1rem;
    padding: 0;
    /* Убираем padding, так как карточки будут иметь свои отступы */
  }

  .event-card {
    margin-bottom: 1rem;
    /* Добавляем отступ между карточками */
    padding: 0 1rem;
    /* Добавляем внутренние отступы к самим карточкам */
    border-radius: 0;
  }

  .event-card:hover {
    transform: none;
    /* Убираем эффект при наведении на мобильных */
  }

  .loader-container {
    padding: 1.5rem;
  }

  .loader {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .no-more-events {
    font-size: 0.9rem;
    margin-top: 1.5rem;
    padding: 0 1rem;
  }

  /* Оптимизация анимаций для мобильных устройств */
  @media (prefers-reduced-motion: reduce) {
    .event-card {
      border-radius: 16px;
      animation: none;
      opacity: 1;
      transform: none;
    }

    .event-card:nth-child(n) {
      animation-delay: 0s;
    }

    .loader {
      animation: none;
    }
  }
}

/* Добавляем стили для планшетов */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-wrapper {
    margin-left: 80px;
    /* Предполагаем, что NavBAr появляется на планшетах и выше */
    padding: 1.5rem;
  }

  .events-container {
    max-width: 600px;
    padding: 0 1rem;
  }
}

/* Добавляем стили для больших экранов */
@media (min-width: 1025px) {
  .main-wrapper {
    margin-left: 80px;
    /* Учитываем ширину NavBAr */
    padding: 2rem;
  }

  .events-container {
    max-width: 800px;
    padding: 0 1rem;
  }
}
</style>