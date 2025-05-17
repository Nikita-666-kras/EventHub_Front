<template>
  <div class="event-card">
    <div class="header">

      <div class="user-info">
        <img class="avatar" src="@/assets/icons/user_black.png" />
        <p class="nickname">{{ user.name }}</p>

      </div>
      <div class="title_event">
        <h3>{{ event.eventName }}</h3>
      </div>

      <div class="menu-icon">⋯</div>
    </div>

    <div class="body" @click="goToEventDetails">
      
      <div class="left">
        <img class="preview" :src="event.image" />
        <div class="info">
          <div class="date">
            <img src="@/assets/login_icons/calendar.png" alt="">
            <div>
              <p> Начало: {{ event.startDateAndTime }}</p>
              <p> Конец: {{ event.endDateAndTime }}</p>
            </div>

          </div>
          <div class="location">
            <img src="@/assets/login_icons/location.png" alt="">
            <p> {{ event.eventAddress }}</p>
          </div>

        </div>
      </div>
      <div class="right">
        <p class="description">
          {{ event.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

const props = defineProps({
  event: Object
})

const user = ref('')
const router = useRouter()

onMounted(async () => {
  try {
    const res = await api.get(`/users/${props.event.creatorId}`)
    user.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки пользователя:', err)
  }
})

const goToEventDetails = () => {
  router.push(`/event/${props.event.id}`)
}

</script>


<style scoped>
.event-card {
  background: linear-gradient(180deg, #245dff, #ae38b9);
  border-radius: 16px;

  padding: 1rem;
  color: white;
  margin-bottom: 2rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title_event {
  width: 27rem;
  text-align: center;
  font-size: large;

}

.avatar {
  width: 50px;
  height: 50px;
  margin-left: 0.5rem;
  border-radius: 28%;
}

.location {
  display: flex;

}

.location img {
  width: 30px;
  height: 30px;
  margin-right: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  background: #eee;
  border-radius: 20px;
  color: black;
  border: 0.5rem;
  flex: 1;
  margin-left: 1rem;
}

.nickname {
  font-weight: bold;
  margin: 0 2rem;
}

.menu-icon {
  margin-left: 12rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.body {
  display: flex;
  padding: 12px;
  gap: 1rem;
  border: 0.1rem solid #eee;
  border-radius: 30px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.body:hover {
  background: rgba(255, 255, 255, 0.05);
}


.date {
  display: flex;
  align-items: center;
}

.date img {
  width: 30px;
  height: 30px;
  margin-right: 1rem;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview {
  width: 400px;
  height: 235px;
  background: gray;
  border-radius: 8px;
  object-fit: cover;

}

.info {

  margin: 0.5rem 0 0.5rem 0.8rem;
}

.info p {
  margin: 0.7rem 0;
  font-size: 0.9rem;
}

.right {
  flex: 1;
  background: #eee;
  color: black;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
}
</style>