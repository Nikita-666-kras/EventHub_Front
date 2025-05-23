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

const fetchEvents = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const url = cursor
      ? `/events/page?cursor=${encodeURIComponent(cursor)}&limit=${limit}&sortBy=create_date`
      : `/events/page?limit=${limit}&sortBy=start_date_and_time`

    console.log('Fetching events from URL:', url)
    const response = await api.get(url)
    console.log('Response data:', response.data)

    const newEvents = response.data || []
    console.log('New events:', newEvents)

    if (newEvents.length < limit) {
      console.log('No more events available')
      hasMore.value = false
    }

    if (newEvents.length > 0) {
      cursor = newEvents[newEvents.length - 1].createDate
      console.log('New cursor:', cursor)
      events.value.push(...newEvents)
      console.log('Total events:', events.value.length)
    }
  } catch (err) {
    console.error('[❌] Ошибка загрузки событий:', err)
    if (err?.response?.status === 400) {
      console.log('Received 400 status, marking as no more events')
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
.main-wrapper {
  margin-left: 80px;
  padding: 2rem;
  min-height: 100vh;
  background: #150A1E;
  animation: fadeIn 0.5s ease-out;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-card {
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.5s ease-out forwards;
  transition: all 0.3s ease;
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
</style>
