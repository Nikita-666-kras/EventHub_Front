<template>
  <div class="profile-layout">
    <NavBar />

    <div class="content">
      <div class="profile-card">
        <div class="profile-header">
          <p class="section-title">Профиль</p>
          <div class="actions">
            <img src="@/assets/login_icons/push.png" alt="" class="imge">
            <img src="@/assets/login_icons/redact.png" alt="" class="imge">
          </div>
        </div>

        <div class="profile-info">
          <div class="left">
            <div class="avatar"></div>
          </div>
          <div class="right">
            <div class="field-row"><span class="label">Фамилия:</span><span>{{ user.lastName }}</span></div>
            <div class="field-row"><span class="label">Имя:</span><span>{{ user.name }}</span></div>
            <div class="field-row"><span class="label">Отчество:</span><span>{{ user.middleName }}</span></div>
            <div class="field-row"><span class="label">Email:</span><span>{{ user.email }}</span></div>
            <div class="field-row"><span class="label">Телефон:</span><span>{{ user.phoneNumber }}</span></div>
            <div class="field-row"><span class="label">Telegram:</span><span>{{ user.telegram }}</span></div>
            <div class="field-row"><span class="label">Дата рождения:</span><span>{{ user.birthDate }}</span></div>
            <div class="field-row"><span class="label">Возраст:</span><span>{{ user.age }} лет</span></div>
          </div>
        </div>

        <h3 class="section-subtitle">Прошедшие мероприятия</h3>

        <div class="events-columns">
          <div class="column">
            <h4>Соло</h4>
            <div class="line"></div>
            <div class="event-card" v-for="event in soloEvents" :key="event.id">
              <p class="event-title">{{ event.eventName }}</p>
              <div class="calendar">
                <img src="@/assets/login_icons/calendar.png" class="icons" />
                <p class="event-date">{{ formatDate(event.startDateAndTime) }}</p>
              </div>
              <div class="calendar">
                <img src="@/assets/login_icons/location.png" class="icons" />
                <p class="event-location">{{ event.eventAddress }}</p>
              </div>
            </div>
          </div>

          <div class="column">
            <h4>Группа</h4>
            <div class="line"></div>
            <div class="event-card" v-for="event in groupEvents" :key="event.id">
              <p class="event-title">{{ event.eventName }}</p>
              <div class="calendar">
                <img src="@/assets/login_icons/calendar.png" class="icons" />
                <p class="event-date">{{ formatDate(event.startDateAndTime) }}</p>
              </div>
              <div class="calendar">
                <img src="@/assets/login_icons/location.png" class="icons" />
                <p class="event-location">{{ event.eventAddress }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="upcoming">
        <h4>Грядущие мероприятия</h4>
        <div class="event-upcoming" v-for="event in upcomingEvents" :key="event.id">
          <p>{{ event.eventName }}</p>
          <div class="calendar">
            <img src="@/assets/login_icons/calendar.png" class="icons">
            <p>{{ formatDate(event.startDateAndTime) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

const user = ref({})
const soloEvents = ref([])
const groupEvents = ref([])
const upcomingEvents = ref([])

const formatDate = (iso) => new Date(iso).toLocaleString()

const getUserIdFromToken = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.userId
  } catch (e) {
    return null
  }
}

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return

  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data

    const eventsRes = await api.get(`/events/participant/${userId}`)
    const allEvents = eventsRes.data || []

    const now = new Date()
    soloEvents.value = allEvents.filter(e => new Date(e.endDateAndTime) < now && e.grouping === 'solo')
    groupEvents.value = allEvents.filter(e => new Date(e.endDateAndTime) < now && e.grouping === 'group')
    upcomingEvents.value = allEvents.filter(e => new Date(e.startDateAndTime) >= now)
  } catch (e) {
    console.error('Ошибка загрузки данных:', e)
  }
})
</script>




<style scoped>
/* #app{
    justify-content: flex-end;
        padding-right: 8%
  } */




  .profile-info {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #666;
}



.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 22rem;
  gap: 0.8rem;
  flex: 1;
}

.field-row {
  display: flex;
  justify-content: space-between;
  
  background: #3d3d3d;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
}

.field-row .label {
  font-weight: bold;
  color: #ccc;
}





.profile-layout {
  justify-content: center;
  min-height: 100vh;
  margin-left: 80px;
  display: flex;
  width: 80%;
}

.content {
  display: flex;
  justify-content: space-between;
  /* padding: 2rem 0; */
  width: 80%;
}

.profile-card {
  background: #575757;
  border-radius: 8px 0 8px 8px;
  color: white;
  padding: 2rem;
  width: 75%;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-weight: bold;
}

.actions .icon {
  font-size: 1.2rem;
  margin-left: 1rem;
  cursor: pointer;
}

.imge {
  width: 40px;
  height: 40px;
  margin-left: 1.5rem;
}

.profile-info {
  display: flex;
  justify-content: space-evenly;
  margin-top: 1.5rem;
  gap: 2rem;
}

.avatar {
  width: 224px;
  height: 200px;
  border-radius: 8px;
  background: lightgray;
}

.right {
  display: flex;
  flex-direction: column;
  text-decoration: dashed;
  justify-content: space-around;
}

.name {
  display: flex;
  gap: 6rem;
  font-weight: bold;
}

.age-birth {
  display: flex;
  gap: 6rem;
}

.calendar {
  display: flex;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.section-subtitle {
  margin-top: 3rem;
  font: 3rem;
  text-align: center;
}

.events-columns {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  margin-top: 2rem;
}

.icons {
  width: 20px;
  height: 20px;
}

.column h4 {
  text-align: center;
  margin-bottom: 1rem;
}

.event-card {
  /* background: #333; */
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: white;
  border: 1px solid #888;
}

.event-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.event-date,
.event-location {
  font-size: 0.85rem;
  color: #ccc;
}

.upcoming {
  width: 25%;
  background: #333;
  border-radius: 0 12px 12px 0;
  padding: 1rem;
  color: white;
  height: fit-content;
}

.line {
  background-color: #ccc;
  height: 1px;
  width: 13rem;
  margin: 1rem;
  margin-left: 3rem;
}

.event-upcoming {
  border: 1px solid #999;
  border-radius: 8px;
  padding: 0.8rem;
  margin-top: 1rem;
  background: #555;
}
</style>