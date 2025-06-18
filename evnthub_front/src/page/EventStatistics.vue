<template>
  <div class="statistics-wrapper">
    <NavBar />
    <div class="burger-menu-wrapper">
      <button class="burger-menu" @click="toggleSidebar" :class="{ active: isSidebarOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="statistics-page">
      <div class="main-content">
        <div class="stats-header">
          <h3>Статистика мероприятий</h3>
        </div>

        <input class="event-title" :value="eventTitle" disabled />

        <div class="chart-field-selector">
          <label>Показать статистику по полю:</label>
          <select v-model="selectedField">
            <option v-for="field in availableFields" :key="field.label" :value="field">
              {{ field.label }}
            </option>
          </select>
        </div>

        <div class="view-switch">
          <input type="radio" id="view-single" value="single" v-model="viewMode" />
          <label for="view-single"><img src="@/assets/icons/user.png" alt="User" /></label>
          <input type="radio" id="view-group" value="group" v-model="viewMode" />
          <label for="view-group"><img src="@/assets/icons/stats.png" alt="Group" /></label>
        </div>

        <div class="analytics-section" v-if="answers.length && selectedField">
          <h4>Аналитика по полю "{{ selectedField.label }}"</h4>
          <canvas ref="chartRef" style="max-width: 100%; margin-top: 2rem;"></canvas>

          <div class="stats-container">
            <div class="stats-list">
              <div v-for="(value, i) in aggregatedAnswers" :key="i" class="stat-item">
                <span class="stat-label">{{ value.option }}</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${(value.count / answers.length) * 100}%` }"></div>
                </div>
                <span class="stat-count">{{ value.count }} ({{ Math.round((value.count / answers.length) * 100)
                  }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="participants-box">
          <h3>Участвуют</h3>
          <template v-if="viewMode === 'single'">
  <div class="participant" v-for="(p, i) in singleParticipants" :key="i">
              <div class="avatar"></div>
              <span class="name">{{ p.name }}</span>
              <span class="email">{{ p.email }}</span>
              <button @click="removeParticipant(p.participantId)">Удалить</button>
            </div>
          </template>

          <template v-else>
            <div v-if="groupedParticipants.length === 0" class="no-teams">
              <p>Команды не найдены для этого мероприятия</p>
            </div>
            <div v-else class="teams-container">
              <div class="team" v-for="(team, index) in groupedParticipants" :key="index">
                <div class="team-header">
                  <div class="team-info">
                    <h4 class="team-name">{{ team.name }}</h4>
                    <span class="team-member-count">{{ team.members?.length || 0 }} участников</span>
                  </div>
                  <div class="team-actions">
                    <button class="team-action-btn" @click="viewTeamDetails(team)" title="Просмотр деталей команды">
                      👁️
                    </button>
                  </div>
                </div>
                <div class="team-members">
                  <div class="team-member" v-for="(member, i) in team.members" :key="i">
                    <div class="member-avatar"></div>
                    <div class="member-info">
                      <span class="member-name">{{ member.name || member.nickname || 'Без имени' }}</span>
                      <span class="member-email">{{ member.email || 'Email не указан' }}</span>
                    </div>
                    <span v-if="member.isLeader" class="leader-badge">Лидер</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="sidebar_2" :class="{ 'mobile-open': isSidebarOpen }">
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
      <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, watch, onMounted, computed } from 'vue'
import api from '@/utils/axios'
import { useToast } from 'vue-toastification'

import { Chart, registerables } from 'chart.js'
import { onBeforeUnmount } from 'vue'
Chart.register(...registerables)

const toast = useToast()
// для отображения одиночных участников
const singleParticipants = ref([])

const viewMode = ref('single')
const selectedField = ref(null)
const availableFields = ref([])
const answers = ref([])
const participants = ref([])
const groupedParticipants = ref([])
const selectedEvent = ref(null)
const eventTitle = ref('')
const userEvents = ref([])
const isSidebarOpen = ref(false)

const chartRef = ref(null)
let chartInstance = null

const aggregatedAnswers = computed(() => {
  if (!selectedField.value || !answers.value.length) return []

  const fieldKey = selectedField.value.label
  const map = new Map()

  answers.value.forEach(resp => {
    const val = resp.responses?.[fieldKey]
    if (val === undefined || val === null) return

    if (selectedField.value.type === 'number') {
      const numVal = Number(val)
      if (isNaN(numVal)) return
      const range = Math.floor(numVal / 10) * 10
      const rangeKey = `${range}-${range + 9}`
      map.set(rangeKey, (map.get(rangeKey) || 0) + 1)
    } else {
      map.set(val, (map.get(val) || 0) + 1)
    }
  })

  return Array.from(map.entries())
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count)
})
const renderChart = () => {
  if (!chartRef.value || !selectedField.value || !aggregatedAnswers.value.length) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: aggregatedAnswers.value.map(item => item.option),
      datasets: [{
        label: `Статистика по полю "${selectedField.value.label}"`,
        data: aggregatedAnswers.value.map(item => item.count),
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

watch(aggregatedAnswers, () => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})

const getUserIdFromToken = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.userId
  } catch (e) {
    console.error('JWT decode error', e)
    return null
  }
}

const formatDateSafe = (val) => {
  const date = new Date(val)
  return isNaN(date) ? 'Дата недоступна' : date.toLocaleDateString()
}

const loadCustomFields = async (eventId) => {
  try {
    const participantFieldsRes = await api.get(`/responses/custom-fields/participant/${eventId}`)
    const teamFieldsRes = await api.get(`/responses/custom-fields/team/${eventId}`)

    // Проверяем структуру ответов
    const participantFields = Array.isArray(participantFieldsRes.data) ? participantFieldsRes.data :
      (participantFieldsRes.data?.fields ? participantFieldsRes.data.fields : [])
    const teamFields = Array.isArray(teamFieldsRes.data) ? teamFieldsRes.data :
      (teamFieldsRes.data?.fields ? teamFieldsRes.data.fields : [])

    availableFields.value = [
      ...participantFields.map(field => ({
        label: field.name,
        type: field.type,
        required: field.required,
        source: 'participant'
      })),
      ...teamFields.map(field => ({
        label: field.name,
        type: field.type,
        required: field.required,
        source: 'team'
      }))
    ]
  } catch (e) {
    console.error('Ошибка загрузки кастомных полей:', e)
  }
}

const selectEvent = async (event) => {
  selectedEvent.value = event
  eventTitle.value = event.eventName
  await loadCustomFields(event.id)
  await loadParticipants(event.id)
  await loadTeams(event.id)
  // Сбрасываем выбранное поле
  selectedField.value = null
}

const loadParticipants = async (eventId) => {
  try {
    const res = await api.get(`/participants/${eventId}`)
    const participants = res.data || []

    const processedParticipants = await Promise.all(
      participants.map(async (participant) => {
        try {
          if (participant.userId) {
            const userRes = await api.get(`/users/${participant.userId}`)
            return {
              ...participant,
              name: userRes.data.name || participant.nickname || 'Без имени',
              email: userRes.data.email || 'Email не указан'
            }
          }
          return {
            ...participant,
            name: participant.name || participant.nickname || 'Без имени',
            email: participant.email || 'Email не указан'
          }
        } catch (e) {
          console.error(`Ошибка получения данных участника ${participant.userId || participant.id}:`, e)
          return {
            ...participant,
            name: participant.name || participant.nickname || 'Ошибка загрузки',
            email: participant.email || 'Email не указан'
          }
        }
      })
    )

    singleParticipants.value = processedParticipants
  } catch (e) {
    console.error('Ошибка загрузки участников:', e)
    singleParticipants.value = []
  }
}


const loadTeams = async (eventId) => {
  try {
    const res = await api.get(`/teams/${eventId}`)
    const teams = Array.isArray(res.data) ? res.data : []

    const processedTeams = await Promise.all(
      teams.map(async (team) => {
        const processedMembers = await Promise.all(
          (team.members || []).map(async (member) => {
            try {
              if (member.userId) {
                const userRes = await api.get(`/users/${member.userId}`)
                return {
                  ...member,
                  name: userRes.data.name || member.nickname || 'Без имени',
                  email: userRes.data.email || 'Email не указан',
                }
              }
              return {
                ...member,
                name: member.name || member.nickname || 'Без имени',
                email: member.email || 'Email не указан',
              }
            } catch (e) {
              console.error(`Ошибка получения данных участника ${member.userId || member.id}:`, e)
              return {
                ...member,
                name: member.name || member.nickname || 'Ошибка загрузки',
                email: member.email || 'Email не указан',
              }
            }
          })
        )
        return { ...team, members: processedMembers }
      })
    )

    groupedParticipants.value = processedTeams
  } catch (e) {
    console.error('Ошибка загрузки команд:', e)
    groupedParticipants.value = []
  }
}



const viewTeamDetails = (team) => {
  // Показываем информацию о команде в toast или можно добавить модальное окно
  const memberNames = team.members?.map(m => m.name || m.nickname || 'Без имени').join(', ') || 'Нет участников'
  toast.info(`Команда "${team.name}": ${memberNames}`)
}

const loadAnswers = async (eventId) => {
  if (!selectedField.value) return

  try {
    let responses = []

    if (selectedField.value.source === 'participant') {
      // Загружаем участников и их ответы
      const participantsRes = await api.get(`/participants/${eventId}`)
      const participants = participantsRes.data || []

      // Получаем ответы для каждого участника
      for (const participant of participants) {
        try {
          const responseRes = await api.get(`/responses/participant/${eventId}/${participant.id}`)
          if (responseRes.data && responseRes.data.responses) {
            responses.push({
              participantId: participant.id,
              responses: responseRes.data.responses
            })
          }
        } catch (e) {
          console.error(`Ошибка получения ответов для участника ${participant.id}:`, e)
        }
      }
    } else {
      // Загружаем команды и их ответы
      const teamsRes = await api.get(`/teams/${eventId}`)
      const teams = teamsRes.data || []

      // Получаем ответы для каждой команды
      for (const team of teams) {
        try {
          const responseRes = await api.get(`/responses/team/${eventId}/${team.id}`)
          if (responseRes.data && responseRes.data.responses) {
            responses.push({
              teamId: team.id,
              responses: responseRes.data.responses
            })
          }
        } catch (e) {
          console.error(`Ошибка получения ответов для команды ${team.id}:`, e)
        }
      }
    }

    answers.value = responses
  } catch (e) {
    console.error('Ошибка при получении ответов:', e)
  }
}

const removeParticipant = async (participantId) => {
  if (!confirm('Удалить участника?')) return
  try {
    // Получаем userId из participantId
    const participant = participants.value.find(p => p.participantId === participantId)
    if (!participant) {
      toast.error('Участник не найден')
      return
    }

    // Используем userId из данных участника
    await api.delete(`/participants/${participant.userId}/${selectedEvent.value.id}`)
    participants.value = participants.value.filter(p => p.participantId !== participantId)
    toast.success('Участник удален')
  } catch (e) {
    console.error('Ошибка при удалении:', e)
    toast.error('Ошибка при удалении участника')
  }
}

watch(viewMode, async (val) => {
  if (val === 'group' && selectedEvent.value) {
    try {
      const res = await api.get(`/teams/${selectedEvent.value.id}`)
      groupedParticipants.value = res.data || []
    } catch (e) {
      console.error('Ошибка загрузки команд:', e)
    }
  }
})

watch(selectedField, async (field) => {
  if (!field || !selectedEvent.value) return
  await loadAnswers(selectedEvent.value.id)
})
watch(aggregatedAnswers, () => {
  renderChart()
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return

  try {
    const res = await api.get(`/events/creator/${userId}`)
    userEvents.value = res.data || []
    if (userEvents.value.length) await selectEvent(userEvents.value[0])
  } catch (e) {
    console.error('Ошибка инициализации:', e)
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isSidebarOpen.value) {
      isSidebarOpen.value = false
      document.body.style.overflow = ''
    }
  })
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
}

.burger-menu-wrapper {
  display: none;
}

.statistics-page {
  display: flex;
  width: 80%;
  max-width: 1224px;
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
  padding: 0;
  color: white;
  height: fit-content;
  width: 30%;
  min-width: 300px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: slideIn 0.5s ease-out;
  max-height: 90vh;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
}

.sidebar_2_scroll {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar_2_scroll::-webkit-scrollbar {
  display: none;
}

.tile_sidebar {
  position: sticky;
  top: 0;
  background: #222;
  padding: 1rem;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 10;
  border-bottom: 1px solid #444;
  margin: 0;
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

.analytics-section {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #333;
}

.stats-container {
  margin-top: 1rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-label {
  min-width: 150px;
  color: #fff;
}

.stat-bar {
  flex: 1;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #9333ea);
  transition: width 0.3s ease;
}

.stat-count {
  min-width: 100px;
  text-align: right;
  color: #888;
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

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .statistics-wrapper {
    padding: 0;
  }

  .statistics-page {
    width: 100%;
    flex-direction: column;
  }

  .main-content {
    width: 100%;
    min-width: unset;
    border-radius: 0;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .stats-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-header h3 {
    font-size: 1.5rem;
    margin: 0;
  }

  .event-title {
    font-size: 1.2rem;
    padding: 0.8rem;
  }

  .chart-field-selector {
    margin: 1rem 0;
  }

  .chart-field-selector select {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
  }

  .view-switch {
    width: 100%;
    justify-content: center;
    margin: 1rem 0;
  }

  .view-switch label {
    padding: 0.8rem;
  }

  .view-switch img {
    width: 24px;
    height: 24px;
  }

  .analytics-section {
    padding: 1rem;
  }

  .analytics-section h4 {
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
  }

  .stats-list {
    gap: 1rem;
  }

  .stat-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .stat-label {
    min-width: unset;
    width: 100%;
  }

  .stat-bar {
    width: 100%;
  }

  .stat-count {
    min-width: unset;
    width: 100%;
    text-align: left;
  }

  .participants-box {
    padding: 1rem;
  }

  .participants-box h3 {
    font-size: 1.2rem;
    margin: 0 0 1rem 0;
  }

  .participant {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.8rem;
  }

  .participant button {
    width: 100%;
    padding: 0.8rem;
    margin-top: 0.5rem;
  }

  .group {
    margin-bottom: 1.5rem;
  }

  .group-title {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  .group-member {
    padding: 0.8rem;
    margin-bottom: 0.5rem;
  }

  .sidebar_2 {
    width: 100%;
    min-width: unset;
    max-width: none;
    border-radius: 0;
    position: fixed;
    top: 60px;
    right: -100%;
    bottom: 0;
    z-index: 999;
    transition: right 0.3s ease;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  }

  .sidebar_2.mobile-open {
    right: 0;
  }

  .sidebar_2_scroll {
    height: calc(100vh - 120px);
    padding: 1rem;
  }

  .tile_sidebar {
    padding: 1.2rem;
    font-size: 1.2rem;
  }

  .event-item {
    padding: 1rem;
  }

  .event-item p {
    margin: 0.5rem 0;
    font-size: 1rem;
  }

  .create-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    margin: 0;
    border-radius: 0;
  }

  .burger-menu-wrapper {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 60px;
    background: rgba(34, 34, 34, 0.95);
    backdrop-filter: blur(8px);
    z-index: 999;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .burger-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 36px;
    height: 28px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    position: fixed;
    right: 16px;
    top: 16px;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .burger-menu span {
    width: 100%;
    height: 3px;
    background: #fff;
    border-radius: 3px;
    transition: all 0.3s ease;
  }

  .burger-menu.active span:nth-child(1) {
    transform: translateY(12px) rotate(45deg);
  }

  .burger-menu.active span:nth-child(2) {
    opacity: 0;
  }

  .burger-menu.active span:nth-child(3) {
    transform: translateY(-12px) rotate(-45deg);
  }

  .burger-menu:active {
    transform: scale(0.95);
  }

  .burger-menu:focus {
    outline: none;
  }

  .burger-menu:focus-visible {
    outline: 2px solid #9333ea;
    outline-offset: 2px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 998;
  }

  /* Мобильные стили для команд */
  .team {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .team-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .team-name {
    font-size: 1.1rem;
  }

  .team-member-count {
    font-size: 0.85rem;
  }

  .team-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .team-action-btn {
    padding: 0.8rem;
    font-size: 1.2rem;
  }

  .team-member {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 1rem;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
  }

  .member-info {
    width: 100%;
  }

  .member-name {
    font-size: 1rem;
  }

  .member-email {
    font-size: 0.9rem;
  }

  .leader-badge {
    align-self: flex-start;
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
}

/* Стили для команд */
.no-teams {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
}

.teams-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team {
  background: #333;
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid #444;
  transition: all 0.3s ease;
}

.team:hover {
  transform: translateY(-2px);
  border-color: #9333ea;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #444;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.team-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.team-member-count {
  font-size: 0.9rem;
  color: #888;
}

.team-actions {
  display: flex;
  gap: 0.5rem;
}

.team-action-btn {
  background: #444;
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.team-action-btn:hover {
  background: #555;
  transform: scale(1.1);
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.team-member:hover {
  border-color: #9333ea;
  background: #333;
}

.member-avatar {
  width: 32px;
  height: 32px;
  background: #666;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.team-member:hover .member-avatar {
  transform: scale(1.1);
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #fff;
  font-size: 0.95rem;
}

.member-email {
  font-size: 0.85rem;
  color: #888;
}

.leader-badge {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
</style>