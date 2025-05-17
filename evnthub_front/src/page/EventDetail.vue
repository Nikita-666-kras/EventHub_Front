<template>
    <div class="event-details-wrapper">
        <NavBar />

        <div class="event-details">
            <div class="left">
                <img class="banner" :src="event.image" alt="Event image" />

                <div class="date-location">
                    <div class="date">
                        <img src="@/assets/login_icons/calendar.png" alt="calendar icon" />
                        <p><strong>Начало:</strong> {{ formatDate(event.startDateAndTime) }}</p>
                        <p><strong>Конец:</strong> {{ formatDate(event.endDateAndTime) }}</p>
                    </div>

                    <div class="location">
                        <img src="@/assets/login_icons/location.png" alt="location icon" />
                        <p>{{ event.eventAddress }}</p>
                    </div>
                </div>

                <p class="description">{{ event.description }}</p>
                <button class="register-btn" @click="register">Зарегистрироваться</button>
            </div>

            <div class="right">
                <h2 class="title">{{ event.eventName }}</h2>
                <div class="creator">
                    <img class="creator-avatar" src="@/assets/icons/user_black.png" />
                    <p>{{ creator.name }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/axios'
import NavBar from '@/components/nav_bar.vue'

const route = useRoute()
const event = ref({})
const creator = ref({})

onMounted(async () => {
    const eventId = route.params.id
    try {
        const res = await api.get(`/event/${eventId}`)
        event.value = res.data

        const userRes = await api.get(`/users/${res.data.creatorId}`)
        creator.value = userRes.data
    } catch (e) {
        console.error('Ошибка загрузки данных:', e)
    }
})

const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleString()
}


const getUserIdFromToken = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))?.split('=')[1]
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.userId
  } catch (e) {
    console.error('JWT decode error', e)
    return null
  }
}

const register = async () => {
    const eventId = route.params.id
  try {
    const userId = getUserIdFromToken()
    
    await api.post('/participants/register', {
      userId: userId, // замените на реальный userId из авторизации
      eventId: eventId,
      teamId: null
    })
    alert('Вы успешно зарегистрированы!')
  } catch (e) {
    console.error('Ошибка при регистрации:', e)
    alert('Ошибка при регистрации')
  }
}
</script>

<style scoped>
.event-details-wrapper {
    background: #150a1e;
    color: white;
    min-height: 100vh;
    padding: 2rem;
}

.event-details {
    display: flex;
    justify-content: space-between;
    gap: 3rem;
    max-width: 1400px;
    margin: auto;
    background: #222;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.6s ease-in-out;
}

.left {
    flex: 2;
}

.right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #333;
    padding: 1.5rem;
    border-radius: 12px;
}

.banner {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.date-location {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.date,
.location {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.95rem;
}

.date img,
.location img {
    width: 24px;
    height: 24px;
}

.description {
    background: #444;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.6;
}

.title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 1rem;
}

.creator {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #444;
    padding: 0.8rem;
    border-radius: 8px;
    width: 100%;
    justify-content: center;
}

.creator-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.register-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.8rem 1.6rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
}

.register-btn:hover {
    background: linear-gradient(to right, #2563eb, #7e22ce);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>