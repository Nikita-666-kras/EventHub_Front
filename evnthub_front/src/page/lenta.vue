<template>
  <NavBar />

  <div class="main-wrapper">
    <EventCard
      v-for="event in events"
      :key="event.id"
      :event="event"
    />
  </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import EventCard from '@/components/EventCard.vue'
import { ref, onMounted } from 'vue'

const events = ref([])

onMounted(() => {
  // Здесь можно заменить на API
  events.value = [
    {
      id: 1,
      nickname: 'NICKNAME',
      title: 'Название Мероприятия',
      image: '/src/assets/preview.png',
      start: '30.09.2004',
      end: '01.10.2004',
      location: 'Площадь Гагарина, 1, Ростов-на-Дону',
      description: 'Описание мероприятия — подробности, как, где, зачем и почему.'
    },
    {
      id: 2,
      nickname: 'ДРУГОЙ',
      title: 'Конференция Vue ',
      image: '/src/assets/preview.png',
      start: '15.04.2025',
      end: '16.04.2025',
      location: 'Москва, Красная Площадь',
      description: 'Отличное мероприятие для всех разработчиков Vue 3.'
    },
    {
      id: 3,
      nickname: 'ДРУГОЙ',
      title: 'Конференция Vue',
      image: '/src/assets/preview.png',
      start: '15.04.2025',
      end: '16.04.2025',
      location: 'Москва, Красная Площадь',
      description: 'Отличное мероприятие для всех разработчиков Vue 3.'
    },
    {
      id: 4,
      nickname: 'ДРУГОЙ',
      title: 'Конференция Vue',
      image: '/src/assets/preview.png',
      start: '15.04.2025',
      end: '16.04.2025',
      location: 'Москва, Красная Площадь',
      description: 'Отличное мероприятие для всех разработчиков Vue 3.'
    },
    {
      id: 5,
      nickname: 'ДРУГОЙ',
      title: 'Конференция xue',
      image: '/src/assets/preview.png',
      start: '15.04.2025',
      end: '16.04.2025',
      location: 'Москва, Красная Площадь',
      description: 'Отличное мероприятие для всех разработчиков Vue 3.'
    },
  ]
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
