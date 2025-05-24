<template>
    <div class="team-page">
        <NavBar />
        <main class="content">
            <section class="team-details">
                <div class="team-header">
                    <p class="section-title">Моя Команда</p>
                    <a href="#" class="edit-btn" @click.prevent="startEdit" v-if="!isEditing">
                        <img src="@/assets/login_icons/redact.png" alt="edit" />
                    </a>
                </div>

                <div class="info_team">
                    <div class="team-name">
                        <span v-if="!isEditing">{{ team.name }}</span>
                        <input v-else v-model="editedTeam.name" />
                    </div>

                    <div class="img_team">
                        <img v-if="!isEditing" :src="team.image" alt="Team Image" />
                        <input v-else v-model="editedTeam.image" placeholder="URL изображения" />
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

                <div v-if="isEditing" style="display:flex; gap:1rem; margin:1rem 0;">
                    <button class="create-btn" @click="saveEdit">Сохранить</button>
                    <button class="create-btn" style="background:#888;" @click="cancelEdit">Отмена</button>
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

const isEditing = ref(false)
const editedTeam = ref({})

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

const startEdit = () => {
    editedTeam.value = { ...team.value }
    isEditing.value = true
}

const cancelEdit = () => {
    isEditing.value = false
}

const saveEdit = async () => {
    if (!team.value.id) return
    try {
        await api.patch('/teams', { ...editedTeam.value, id: team.value.id })
        team.value = { ...editedTeam.value }
        isEditing.value = false
    } catch (e) {
        alert('Ошибка при сохранении данных команды')
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
.team-page {
    display: flex;
    background: #150a1e;
    min-height: 100vh;
    color: white;
   
    padding: 2rem 0;
    justify-content: center;
}

.content {
    display: flex;
    width: 80%;
    max-width: 1224px;
    margin: 0 auto;
    gap: 0;
}

.team-details {
    background: #444;
    border-radius: 16px 0 0 16px;
    padding: 2.5rem;
    /* width: calc(100% - 300px); */
    min-width: 47rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid #333;
    animation: fadeIn 0.5s ease-out;
}

.sidebar_2 {
    background: #222;
    border-radius: 0 16px 16px 0;
    padding: 1.5rem;
    color: white;
    height: fit-content;
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid #333;
    animation: slideIn 0.5s ease-out;
}

.info_team {
    background: #2a2a2a;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid #333;
}

.team-name {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    padding: 1rem;
    margin-bottom: 1rem;
    background: #333;
    border-radius: 8px;
}

.img_team {
    width: 100%;
    height: 200px;
    background-color: #333;
    border-radius: 8px;
    margin-bottom: 1rem;
    overflow: hidden;
}

.img_team img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.event-tag {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    border: 1px solid #333;
}

.event-tag h3 {
    background: #333;
    color: white;
    padding: 0.8rem 1rem;
    border-radius: 8px 8px 0 0;
    margin: 0;
}

.date-ivent {
    background: #2a2a2a;
    color: white;
    padding: 0.8rem 1rem;
    border-radius: 0 0 8px 8px;
    border: 1px solid #333;
    border-top: none;
}

.date-ivent p {
    margin: 0.5rem 0;
}

.team-card {
    background: #2a2a2a;
    border-radius: 12px;
    padding: 1.2rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    border: 1px solid #333;
}

.team-card:hover {
    transform: translateY(-3px);
    border-color: #9333ea;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.member-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid #333;
    background: #2a2a2a;
}

.member-item:hover {
    transform: translateY(-3px);
    border-color: #9333ea;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
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
    transition: all 0.3s ease;
    animation: fadeIn 0.7s ease-out;
}

.participant:hover {
    background: #444;
    transform: translateY(-3px) scale(1.02);
    border-color: #9333ea;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.08);
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
    transition: box-shadow 0.3s;
}

.switch input:focus+.slider {
    box-shadow: 0 0 0 2px #9333ea44;
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
    animation: pulse 1.2s;
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
    transition: transform 0.3s ease, color 0.3s ease;
}

.options:hover,
.remove:hover {
    transform: scale(1.2);
    color: #9333ea;
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

.sidebar_2 h4 {
    margin-bottom: 1rem;
}

.sidebar_2_scroll {
    flex-grow: 1;
    overflow-y: auto;
    text-align: center;
    padding: 0 1rem 1rem 1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.sidebar_2_scroll::-webkit-scrollbar {
    display: none;
}

.event-item {
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}

.event-item:hover {
    background: #555;
    transform: translateX(5px);
}

.event-item.active {
    background: #555;
    border: 1px solid #9333ea;
    animation: pulse 2s infinite;
}
</style>