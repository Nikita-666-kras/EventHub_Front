<template>
  <div class="statistics-wrapper">
    <NavBar />
    <div class="statistics-page">
      <div class="main-content">
        <div class="stats-header">
          <h3>Статистика мероприятий</h3>
          <a href="" class="edit-button">
            <img src="@/assets/login_icons/redact.png" alt="edit" class="imge" />
          </a>
        </div>
        <input class="event-title" :value="eventTitle" disabled />

        <div class="chart-section">
          <div class="donut-chart">
            <div class="donut-center"></div>
          </div>
          <div class="legend">
            <div class="legend-item"><span class="dot yellow"></span>Среднее</div>
            <div class="legend-item"><span class="dot green"></span>Высшее</div>
            <div class="legend-item"><span class="dot pink"></span>Раковое</div>
          </div>
        </div>

        <div class="chart-field-selector">
          <label>Показать статистику по полю:</label>
          <select v-model="selectedField">
            <option v-for="field in availableFields" :key="field" :value="field">
              {{ field }}
            </option>
          </select>
        </div>

        <div class="view-switch">
          <input type="radio" id="view-single" value="single" v-model="viewMode">
          <label for="view-single">
            <img src="@/assets/icons/user.png" alt="User" />
          </label>
          <input type="radio" id="view-group" value="group" v-model="viewMode">
          <label for="view-group">
            <img src="@/assets/icons/stats.png" alt="Group" />
          </label>
        </div>

        <div class="participants-box">
          <h3>Участвуют</h3>

          <template v-if="viewMode === 'single'">
            <div class="participant" v-for="(p, i) in participants" :key="i">
              <div class="avatar"></div>
              <span class="name">{{ p.name }}</span>
              <span class="email">{{ p.email }}</span>
              <button class="more-options">...</button>
            </div>
          </template>

          <template v-else>
            <div class="group" v-for="(group, index) in groupedParticipants" :key="index">
              <div class="group-title">{{ group.name }}</div>
              <div class="group-member" v-for="(p, i) in group.members" :key="i">
                <div class="avatar"></div>
                <span class="name">{{ p.name }}</span>
                <span class="email">{{ p.email }}</span>
                <button class="more-options">...</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="sidebar_2">
        <div class="sidebar_2_scroll">
          <h4 class="tile_sidebar">Мои мероприятия</h4>
          <div class="event-item" v-for="event in userEvents" :key="event.id" @click="selectEvent(event)"
            :class="{ active: selectedEvent && selectedEvent.id === event.id }">
            <p>{{ event.eventName }}</p>
            <p>Дата начала: {{ formatDateSafe(event.startDateAndTime) }}</p>
          </div>
        </div>
        <button class="create-btn">Создать мероприятие</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, watch, onMounted } from 'vue'
import api from '@/utils/axios'

const selectEvent = async (event) => {
  selectedEvent.value = event
  eventTitle.value = event.eventName
  availableFields.value = event.fields || []

  try {
    const res = await api.get(`/participants/${event.id}`)
    const rawParticipants = res.data || []

    // Получаем данные о пользователях по userId
    const detailed = await Promise.all(
      rawParticipants.map(async (p) => {
        try {
          const userRes = await api.get(`/users/${p.userId}`)
          return {
            name: userRes.data.name || 'Без имени',
            email: userRes.data.email || 'Нет email'
          }
        } catch {
          return { name: 'Ошибка', email: 'Ошибка' }
        }
      })
    )

    participants.value = detailed
  } catch (err) {
    console.error('Ошибка при загрузке участников:', err)
  }
}


const viewMode = ref('single')
const selectedField = ref('')
const availableFields = ref([])
const eventTitle = ref('')
const events = ref([])
const selectedEvent = ref(null)
const createdEvents = ref([])
const participants = ref([])
const groupedParticipants = ref([])


const userEvents = ref([])
const formatDateSafe = (value) => {
  const date = new Date(value)
  return isNaN(date) ? 'Дата недоступна' : date.toLocaleDateString()
}


watch(viewMode, async (val) => {
  if (val === 'group' && selectedEvent.value) {
    try {
      const res = await api.get(`/teams/${selectedEvent.value.id}`)
      groupedParticipants.value = res.data
      console.log(groupedParticipants)
    } catch (err) {
      console.error('Ошибка при загрузке команд:', err)
    }
  }
})

watch(selectedField, async (val) => {
  if (val) {
    const res = await api.get(`/statistics?field=${val}`)
    // Здесь ты можешь обработать данные и отрисовать график
    console.log('Статистика по полю', val, res.data)
  }
})

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

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return
  try {
    // ✅ Получаем мероприятия, СОЗДАННЫЕ пользователем
    const eventsRes = await api.get(`/events/creator/${userId}`)
    userEvents.value = eventsRes.data || []
    console.log("USEREVENTS", userEvents)
    if (!userEvents.length) {
      console.warn('У пользователя нет созданных мероприятий')
      return
    }

    const selected = userEvents[0]
    selectedEvent.value = selected
    eventTitle.value = selected.eventName
    availableFields.value = selected.fields || []


  } catch (err) {
    console.error('Ошибка инициализации:', err)
  }
})

</script>

<style scoped>
.chart-field-selector {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item.active {
  border: 1px solid #9333ea;
  background: #555;
}

.chart-field-selector select {
  background: #333;
  color: white;
  padding: 0.4rem;
  border-radius: 8px;
  border: 1px solid #555;
}

.statistics-wrapper {
  display: flex;
  background: #150a1e;
  min-height: 100vh;
  color: white;

  padding: 2rem 0;
  /* justify-content: center; */
}

.statistics-page {
  display: flex;
  width: 80%;
  max-width: 1224px;
  /* margin: 0 auto; */
  gap: 0;
}

.main-content {
  background: #444;
  border-radius: 16px 0 0 16px;
  padding: 2.5rem;

  min-width: 45rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: fadeIn 0.5s ease-out;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.8s ease-out;
}

.edit-button button {
  background: #333;
  transition: transform 0.3s ease;
}

.edit-button button:hover {
  transform: scale(1.1);
}

.imge {
  width: 40px;
  height: 40px;
  margin-left: 1.5rem;
  transition: transform 0.3s ease;
}

.imge:hover {
  transform: scale(1.1);
}

.event-title {
  background: #2a2a2a;
  border: 1px solid #333;
  color: white;
  padding: 0.8rem 1rem;
  width: 100%;
  margin: 1rem 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.event-title:hover {
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.chart-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
  animation: fadeIn 1.2s ease-out;
}

.donut-chart {
  width: 200px;
  height: 200px;
  background: conic-gradient(#f87171 0% 32%, #4ade80 32% 55%, #fbbf24 55% 73%, #60a5fa 73% 100%);
  border-radius: 50%;
  position: relative;
  transition: transform 0.3s ease;
}

.donut-chart:hover {
  transform: scale(1.05);
}

.donut-center {
  width: 90px;
  height: 90px;
  background: #444;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.legend-item:hover {
  transform: translateX(5px);
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  transition: transform 0.3s ease;
}

.legend-item:hover .dot {
  transform: scale(1.2);
}

.dot.yellow {
  background: #fbbf24;
}

.dot.green {
  background: #4ade80;
}

.dot.pink {
  background: #f87171;
}

.view-switch {
  display: flex;
  background: #333;
  border-radius: 11px;
  overflow: hidden;
  width: fit-content;
  margin-left: auto;
  animation: fadeIn 1.4s ease-out;
}

.view-switch input[type="radio"] {
  display: none;
}

.view-switch label {
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  background: #333;
  transition: all 0.3s ease;
}

.view-switch label:hover {
  background: #444;
}

.view-switch input[type="radio"]:checked+label {
  background: #150a1e;
}

.sidebar_2 {
  background: #222;
  border-radius: 0 16px 16px 0;
  padding: 1.5rem;
  color: white;
  height: fit-content;
  width: 30%;
  min-width: 300px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: slideIn 0.5s ease-out;
}

.sidebar_2_scroll {
  flex-grow: 1;
  overflow-y: auto;
  text-align: center;
  padding: 0 1rem 1rem 1rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tile_sidebar {
  position: sticky;
  top: 0;
  background: #222;
  padding: 0.8rem;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 10;
  border-bottom: 1px solid #444;
  animation: fadeIn 0.8s ease-out;
}

.view-switch img {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease;
}

.view-switch label:hover img {
  transform: scale(1.1);
}

.participants-box {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 1.2rem;
  margin-top: 1rem;
  border: 1px solid #333;
  animation: fadeIn 1.6s ease-out;
}

.participant {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.participant:hover {
  transform: translateY(-3px);
  border-color: #9333ea;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.avatar {
  width: 24px;
  height: 24px;
  background: #999;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.participant:hover .avatar {
  transform: scale(1.2);
}

.name,
.email {
  flex: 1;
  transition: color 0.3s ease;
}

.participant:hover .name {
  color: #9333ea;
}

.more-options {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.more-options:hover {
  transform: scale(1.2);
}

.event-item {
  background: #2a2a2a;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.event-item:hover {
  transform: translateY(-3px);
  border-color: #9333ea;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.event-item.active {
  border: 1px solid #9333ea;
  background: #555;
  animation: pulse 2s infinite;
}

.create-btn {
  background: linear-gradient(to right, #3b82f6, #9333ea);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
  }
}
</style>