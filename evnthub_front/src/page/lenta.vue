<template>
  <div>
  <NavBar />

  <div class="main-wrapper">
    <EventCard
      v-for="event in events"
      :key="event.id"
      :event="event"
    />
  </div>
</div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import EventCard from '@/components/EventCard.vue'
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

const events = ref([])

onMounted(async() => {
  

const response = await api.get('/events') // пример GET запроса
console.log(response.data)
events.value = response.data
  
})
</script>

<style scoped>
.main-wrapper {
  margin-left: 80px;
  padding: 2rem;
  min-height: 100vh;
  background: #150A1E;
}
</style>
