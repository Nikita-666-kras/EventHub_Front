<template>
    <div class="team-page">
        <NavBar />
        <main class="content">
            <section class="team-details">
                <div class="team-header">
                    <p class="section-title">Моя Команда</p>
                    <a href="#" class="edit-btn">
                        <img src="@/assets/login_icons/redact.png" alt="edit" />
                    </a>
                </div>

                <div class="info_team">
                    <div class="team-name">{{ team.name }}</div>

                    <div class="img_team">
                        <img :src="team.image" alt="Team Image" />
                    </div>

                    <div class="event-tag" v-if="selectedEvent">
                        <h3>{{ selectedEvent.eventName }}</h3>
                        <div class="date-ivent">
                            <p>Дата: {{ formatDate(selectedEvent.startDateAndTime) }} – {{
                                formatDate(selectedEvent.endDateAndTime) }}</p>
                            <p>Время: {{ formatTime(selectedEvent.startDateAndTime) }} – {{
                                formatTime(selectedEvent.endDateAndTime) }}</p>
                        </div>
                    </div>
                </div>

                <div class="grid-table">
                    <div class="row" v-for="(row, rowIndex) in team.structure" :key="rowIndex">
                        <div v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell">{{ cell }}</div>
                    </div>
                </div>

                <div class="participant" v-for="user in team.members" :key="user.id">
                    <div class="switch-nickname">
                        <label class="switch">
                            <input type="checkbox" :checked="user.active" />
                            <span class="slider"></span>
                        </label>
                        <span>{{ user.nickname }}</span>
                    </div>

                    <span class="email">{{ user.email }}</span>
                    <span v-if="user.isLeader" class="leader">Лидер</span>
                    <button class="options">...</button>
                    <button class="remove">✕</button>
                </div>

            </section>

            <div class="sidebar_2">

                <h4 class="tile_sidebar">Мои команды</h4>
                <div class="sidebar_2_scroll">
                    <div class="event-item" v-for="event in events" :key="event.id" @click="selectEvent(event)"
                        :class="{ active: selectedEvent && selectedEvent.id === event.id }">
                        <p>{{ event.eventName }}</p>
                        <p>Дата начала: {{ formatDate(event.startDateAndTime) }}</p>
                    </div>
                </div>
                <button class="create-btn">Создать мероприятие</button>
            </div>

        </main>
    </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

const events = ref([])
const selectedEvent = ref([])
const team = ref({ name: '', image: '', members: [], structure: [] })

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

onMounted(async () => {
    const userId = getUserIdFromToken()
    if (!userId) return

    try {
        const res = await api.get(`/teams/${userId}`)
        console.log(res.data)
        events.value = res.data
        if (events.value.length > 0) {
            selectedEvent.value = events.value[0]
            await loadTeamData(selectedEvent.value.id)
        }
    } catch (err) {
        console.error('Ошибка загрузки мероприятий:', err)
    }
})

const loadTeamData = async (eventId) => {
    try {
        const res = await api.get(`/teams/by-event/${userId}`)
        team.value = res.data
    } catch (err) {
        console.error('Ошибка загрузки команды:', err)
    }
}

const selectEvent = async (event) => {
    selectedEvent.value = event
    await loadTeamData(event.id)
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>



<style scoped>
.create-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
}

.team-page {
    display: flex;
    height: 100vh;
    background: #150A1E;
    color: white;
}

.content {
    display: flex;
    flex: 1;
    padding: 2rem;

}

.sidebar_2 h4 {
    margin-bottom: 1rem;
}

.sidebar_2_scroll {
  flex-grow: 1;
  overflow-y: auto;
  text-align: center;
  padding:0 1rem 1rem  1rem ;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar_2_scroll::-webkit-scrollbar {
  display: none;
}

.sidebar_2 {

    height: fit-content;
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

.info_team {
    display: flex;
    gap: 3rem;
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
}





.team-details {
    width: 40vw;
    background: #3f3f3f;
    border-radius: 12px 0 12px 12px;
    ;
    padding: 1.5rem;
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.team-header {
    display: flex;
    justify-content: space-between;
}

.section-title {
    font-size: 1.2rem;
    font-weight: bold;
}

.edit-btn img {
    width: 20px;
}

.team-overview {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;

    border-radius: 10px;
}

.img_team {
    width: 12rem;
    height: 7rem;
    background-color: #aaa;
}

.event-tag h3 {
    background: #2b2b2b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 9px 9px 0 0;
}

.date-ivent {
    background: #f2f2f2;
    color: rgb(0, 0, 0);
    padding: 0.5rem 1rem;
    border-radius: 0 0 9px 9px;
}

.event-item.active {
    background: #555;
    border: 1px solid #9333ea;
}

.team-name {
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    padding: 0 1rem;
}

.event-tag {

    color: black;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    text-align: center;
}

.grid-table .row {
    display: flex;
    justify-content: space-evenly;
    margin-top: 1rem;
}

.cell {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #aaa;
}

.participants {
    background: #2b2b2b;
    padding: 1rem;
    border-radius: 8px;
}

.participant {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem;
    align-items: center;
    align-content: center;
    border-radius: 10px;
    border: 0.1rem solid #eee;
    margin: 0.5rem 0;
}

.switch-nickname {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: gray;
    border-radius: 20px;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #9333ea;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

.leader {
    margin: 0 1rem;
    font-weight: bold;
    color: gold;
}

.email {
    flex: 1;
    text-align: left;
    margin-left: 1rem;
}

.options,
.remove {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 0.5rem;
}

.invite-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.invite {
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, #4e00c2, #e700b3);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.team-list {
    flex: 1;
    background: #1e1e1e;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.team-item {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
}

.circle {
    width: 12px;
    height: 12px;
    background: red;
    border-radius: 50%;
    margin-right: 1rem;
}

.create-team {
    background: linear-gradient(to right, #4e00c2, #e700b3);
    color: white;
    padding: 0.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
</style>