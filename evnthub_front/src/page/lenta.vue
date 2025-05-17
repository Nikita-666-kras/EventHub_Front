<template>
  <div>
    <NavBar />

    <div class="main-wrapper">
      <EventCard v-for="event in events" :key="event.id" :event="event" />

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

    
    const response = await api.get(url)
    

    const newEvents = response.data || []
    console.log(newEvents)
    if (newEvents.length < limit) hasMore.value = false
    if (newEvents.length > 0) {
      cursor = newEvents[newEvents.length - 1].createDate
      
      events.value.push(...newEvents)
    }
  } catch (err) {
    console.error('[❌] Ошибка загрузки событий:', err)
    if (err?.response?.status === 400) {// спросить норм это или нет
      
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
}

.loader-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.no-more-events {
  color: #aaa;
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
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
</style>
