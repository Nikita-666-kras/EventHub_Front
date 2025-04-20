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
        <h4>Мои мероприятия</h4>
        <div class="event-item" v-for="i in 3" :key="i">
          <p>название мероприятия</p>
          <p>Дата начала: 20.03.2024</p>
        </div>
        <button class="create-btn">Создать мероприятие</button>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import NavBar from '@/components/nav_bar.vue'
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const viewMode = ref('single')
const selectedField = ref('')
const availableFields = ref([])
const eventTitle = ref('')

const participants = ref([])
const groupedParticipants = ref([])

watch(viewMode, async (val) => {
  if (val === 'group') {
    const res = await axios.get('/api/groups')
    groupedParticipants.value = res.data
  }
})

watch(selectedField, async (val) => {
  if (val) {
    const res = await axios.get(`/api/statistics?field=${val}`)
    // Здесь ты можешь обработать данные и отрисовать график
    console.log('Статистика по полю', val, res.data)
  }
})

onMounted(async () => {
  const eventRes = await axios.get('/api/event-info')
  eventTitle.value = eventRes.data.title
  availableFields.value = eventRes.data.fields

  const participantsRes = await axios.get('/api/participants')
  participants.value = participantsRes.data
})
</script>
  
  <style scoped>


.chart-field-selector {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  }
  
  .statistics-page {
    display: flex;
    flex-grow: 1;
    padding: 2rem;
  }
  
  .main-content {
    flex: 2;
    background: #444;
    width: 40vw;
    padding: 2rem;
    border-radius: 10px 0 10px 10px;
  }
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .edit-button button {
    background: #333;
  }
  
  .imge {
    width: 40px;
    height: 40px;
    margin-left: 1.5rem;
  }
  
  .event-title {
    background: #333;
    border: 1px solid #666;
    color: white;
    padding: 0.5rem;
    width: 100%;
    margin: 1rem 0;
    border-radius: 8px;
  }
  
  .chart-section {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }
  
  .donut-chart {
    width: 200px;
    height: 200px;
    background: conic-gradient(#f87171 0% 32%, #4ade80 32% 55%, #fbbf24 55% 73%, #60a5fa 73% 100%);
    border-radius: 50%;
    position: relative;
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
  }
  
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
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
  }
  
  .view-switch input[type="radio"] {
    display: none;
  }
  
  .view-switch label {
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    background: #333;
  }
  
  .view-switch input[type="radio"]:checked + label {
    background: #150a1e;
  }
  
  .view-switch img {
    width: 32px;
    height: 32px;
  }
  
  .participants-box {
    margin-top: 1rem;
    background: #333;
    padding: 1rem;
    border-radius: 12px;
  }
  
  .participant {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
  }
  
  .avatar {
    width: 24px;
    height: 24px;
    background: #999;
    border-radius: 50%;
  }
  
  .name,
  .email {
    flex: 1;
  }
  
  .more-options {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .sidebar_2 {
    width: 300px;
    background: #222;
    padding: 1rem;
    border-radius: 0 10px 10px 0;
  }
  
  .event-item {
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }
  
  .create-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
  }
  </style>
  