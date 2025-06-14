<script setup>
import { ref, onMounted } from 'vue'
import EventCard from '@/components/EventCard.vue'

const events = ref([])

onMounted(async () => {
// заглушка пока не настроенно подключение к бд
  events.value = [
    {
      id: 1,
      nickname: 'NICKNAME',
      title: 'Название Мероприятия',
      image: '/src/assets/preview.png',
      start: '30.09.2004',
      end: '01.10.2004',
      location: 'Площадь Гагарина, 1, Ростов-на-Дону',
      description: 'Тут описание крутого мероприятия и всякая полезная инфа...'
    },
    {
      id: 2,
      nickname: 'USERNAME',
      title: 'Событие в Москве',
      image: '/src/assets/preview.png',
      start: '12.04.2024',
      end: '13.04.2024',
      location: 'ЦДМ, Москва',
      description: 'Очень важная ивент-сессия, будем рады видеть вас всех!'
    }
  ]
})
</script>

<template>
  <div class="feed">
    <EventCard v-for="event in events" :key="event.id" :event="event" />
  </div>
</template>

<style scoped>
.feed {
  padding: 2rem;
  margin-left: 80px;
}
</style>
