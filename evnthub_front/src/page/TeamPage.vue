<template>
    <div class="team-page">
        <NavBar />
        <div class="burger-menu-wrapper">
            <button class="burger-menu" @click="toggleSidebar" :class="{ active: isSidebarOpen }">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        <div class="main-section">
            <div class="team-form">
                <div class="header">
                    <input v-model="team.name" placeholder="Название команды" class="team-title"
                        :disabled="isTeamCreated" />
                    <div class="image-upload">
                        <label for="imageInput">
                            <div class="image-preview"
                                :style="{ backgroundImage: imagePreview ? `url(${imagePreview})` : '' }">
                                <span v-if="!imagePreview">+</span>
                            </div>
                        </label>
                        <input id="imageInput" type="file" accept="image/*" @change="handleImageUpload" hidden />
                    </div>
                </div>

                <div v-if="!isTeamCreated" class="form-group">
                    <label for="eventSelect">Выберите мероприятие</label>
                    <select v-model="selectedEventId" id="eventSelect">
                        <option v-for="ev in availableEvents" :key="ev.id" :value="ev.id">
                            {{ ev.eventName }}
                        </option>
                    </select>
                </div>

                <div class="button-group">
                    <button @click="submitTeam" class="create">
                        {{ isTeamCreated ? 'Сохранить изменения' : 'Создать' }}
                    </button>
                </div>

                <div v-if="isTeamCreated" class="form-group">
                    <label>Пригласить участника</label>
                    <select v-model="selectedParticipantId" class="search-select">
                        <option disabled value="">Выберите участника</option>
                        <option v-for="participant in eventParticipants" :key="participant.id" :value="participant.id">
                            {{ getParticipantDisplayName(participant) }}
                        </option>
                    </select>
                    <button @click="inviteSelectedUser" :disabled="!selectedParticipantId" class="invite-btn">
                        Пригласить
                    </button>
                </div>

                <div v-if="team.members.length" class="form-group">
                    <label>Участники команды</label>
                    <div class="participants-list">
                        <div class="participant-item" v-for="member in team.members" :key="member.id">
                            <span>{{ member.nickname }} ({{ member.email }})</span>
                            <span v-if="member.isLeader" class="badge">Лидер</span>
                            <button v-if="!member.isLeader" class="remove-btn" @click="removeMember(member.id)">
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="joinRequests.length" class="form-group">
                    <label>Заявки на вступление</label>
                    <div class="request-item" v-for="req in joinRequests" :key="req.id">
                        <span>{{ req.participantId }}</span>
                        <button @click="approveRequest(req.id)">Принять</button>
                        <button @click="rejectRequest(req.id)">Отклонить</button>
                    </div>
                </div>

                <div v-if="invites.length" class="form-group">
                    <label>Приглашения</label>
                    <div class="invite-item" v-for="inv in invites" :key="inv.id">
                        <span>{{ inv.participantId }}</span>
                        <button @click="cancelInvite(inv.id)">Отозвать</button>
                    </div>
                </div>
            </div>

            <div class="event-sidebar" :class="{ 'mobile-open': isSidebarOpen }">
                <h4>Мои команды</h4>
                <div class="event-sidebar-scroll">
                    <div class="upcoming-event" v-for="team in userTeams" :key="team.id" @click="selectTeam(team)"
                        :class="{ active: selectedTeam?.id === team.id }">
                        <p>{{ team.name || 'Без названия' }}</p>
                        <button @click.stop="editTeam(team)">Редактировать</button>
                    </div>
                </div>
                <button @click="resetForm" class="submit-btn">Создать команду</button>
            </div>

            <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NavBar from '@/components/nav_bar.vue'
import api from '@/utils/axios'

const team = ref({ id: null, name: '', event: null, members: [] })
const userTeams = ref([])
const selectedTeam = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const joinRequests = ref([])
const invites = ref([])
const selectedEventId = ref(null)
const availableEvents = ref([])
const eventParticipants = ref([])
const selectedParticipantId = ref('')
const isTeamCreated = ref(false)
const isSidebarOpen = ref(false)

const getParticipantDisplayName = (participant) => {
    const user = participant.user || {}
    const nickname = user.nickname || user.name || 'Без имени'
    const email = user.email || 'без email'
    return `${nickname} (${email})`
}

const getUserIdFromToken = () => {
    const token = document.cookie.split('; ').find(r => r.startsWith('jwt='))?.split('=')[1]
    if (!token) return null
    try {
        return JSON.parse(atob(token.split('.')[1])).sub || null
    } catch {
        return null
    }
}

const loadAvailableEvents = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return
    const res = await api.get(`/events/participant/${userId}`)
    availableEvents.value = res.data || []
    if (availableEvents.value.length > 0 && !selectedEventId.value) {
        selectedEventId.value = availableEvents.value[0].id
    }
}

const loadUserTeams = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return
    try {
        const asParticipant = await api.get(`/teams/user/${userId}`)
        const eventsCreated = await api.get(`/events/creator/${userId}`)
        const teamPromises = eventsCreated.data.map(ev =>
            api.get(`/teams/${ev.id}`).then(res => res.data.teams || [])
        )
        const teamsByEvents = await Promise.all(teamPromises)
        const asLeader = teamsByEvents.flat()
        const combined = [...asParticipant.data || [], ...asLeader]
        const map = new Map()
        for (const team of combined) {
            map.set(team.id, team)
        }
        userTeams.value = Array.from(map.values())
    } catch (err) {
        console.error('❌ Ошибка при загрузке команд:', err)
    }
}

const selectTeam = async (teamItem) => {
    selectedTeam.value = teamItem
    const resMembers = await api.get(`/teams/${teamItem.id}/members`)
    team.value = { ...teamItem, members: resMembers.data?.members || [] }
    try {
        const resJoinRequests = await api.get(`/teams/${teamItem.id}/join-requests`)
        joinRequests.value = resJoinRequests.data || []
    } catch (e) {
        joinRequests.value = []
    }
    try {
        const resInvites = await api.get(`/teams/${teamItem.id}/invites`)
        invites.value = resInvites.data || []
    } catch (e) {
        invites.value = []
    }
    isTeamCreated.value = true
}

const editTeam = async (teamItem) => {
    await selectTeam(teamItem)
    isTeamCreated.value = true
}

const submitTeam = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return alert('Не авторизован')
    if (!team.value.name) return alert('Введите название команды')
    if (!selectedEventId.value) return alert('Выберите мероприятие')
    const payload = {
        event_id: selectedEventId.value,
        name: team.value.name,
        leader_id: userId,
        type: 'FIXED',
    }
    try {
        if (selectedTeam.value) {
            await api.patch(`/teams/${team.value.id}/update`, {
                team_id: team.value.id,
                new_name: team.value.name,
            })
            alert('Команда обновлена')
        } else {
            const res = await api.post('/teams', payload)
            const createdId = res.data.team_id
            try {
                const checkRes = await api.get(`/participants/check/${userId}/${selectedEventId.value}`)
                if (!checkRes.data?.is_registered) {
                    await api.post('/participants/register', {
                        userId: userId,
                        eventId: selectedEventId.value,
                    })
                }
            } catch (checkErr) {
                console.error('❌ Ошибка при проверке участника:', checkErr)
            }
            await loadUserTeams()
            const newTeam = userTeams.value.find(t => t.id === createdId)
            if (newTeam) await selectTeam(newTeam)
        }
    } catch (e) {
        alert('Ошибка при создании команды')
        console.error('❌ Ошибка submitTeam:', e)
    }
}

const approveRequest = async (id) => {
    await api.patch(`/teams/join-requests/${id}/status`, { status: 'APPROVED' })
    await selectTeam(team.value)
}

const rejectRequest = async (id) => {
    await api.patch(`/teams/join-requests/${id}/status`, { status: 'REJECTED' })
    await selectTeam(team.value)
}

const cancelInvite = async (id) => {
    await api.patch(`/teams/invites/${id}/status`, { status: 'CANCELLED' })
    await selectTeam(team.value)
}

const removeMember = async (id) => {
    await api.delete(`/teams/${team.value.id}/remove-member/${id}`)
    await selectTeam(team.value)
}

const resetForm = () => {
    selectedTeam.value = null
    team.value = { id: null, name: '', event: null, members: [] }
    imageFile.value = null
    imagePreview.value = null
    selectedEventId.value = null
    selectedParticipantId.value = ''
    joinRequests.value = []
    invites.value = []
    isTeamCreated.value = false
}

const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        imageFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
            imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

watch(selectedEventId, async (newVal) => {
    if (!newVal) return
    try {
        const res = await api.get(`/participants/${newVal}`)
        const rawParticipants = res.data || []
        const detailed = await Promise.all(
            rawParticipants.map(async (p) => {
                try {
                    const userRes = await api.get(`/users/${p.userId}`)
                    return { ...p, user: userRes.data }
                } catch {
                    return p
                }
            })
        )
        eventParticipants.value = detailed
    } catch (e) {
        console.error('Ошибка загрузки участников:', e)
    }
})

onMounted(async () => {
    await loadUserTeams()
    await loadAvailableEvents()
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isSidebarOpen.value) {
            isSidebarOpen.value = false
            document.body.style.overflow = ''
        }
    })
})
</script>

<style scoped>
.team-page {
    display: flex;
    justify-content: center;
    background: #150a1e;
    min-height: 100vh;
    padding: 2rem;
    color: white;
    margin-left: 80px;
    animation: fadeIn 0.5s ease-out;
}

.main-section {
    display: flex;
    width: 100%;
    max-width: 1400px;
    
}

.team-form {
    background: #444;
    border-radius: 10px 0 10px 10px;
    padding: 2rem;
    flex: 2;
    animation: slideInLeft 0.6s ease-out;
}

.header {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    align-items: center;
}

.team-title {
    flex: 1;
    padding: 0.8rem 1rem;
    font-size: 1.1rem;
    border-radius: 8px;
    border: 1px solid #777;
    background: #333;
    color: white;
}

.image-upload {
    width: 12rem;
    height: 12rem;
}

.image-preview {
    width: 100%;
    height: 100%;
    background-color: #555;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 2rem;
    border: 2px dashed #888;
    transition: all 0.3s ease;
    cursor: pointer;
}

.image-preview:hover {
    transform: scale(1.02);
    border-color: #9333ea;
}

.form-group {
    margin-bottom: 2rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
}

input,
select {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #555;
    background: #333;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
}

input:focus,
select:focus {
    border-color: #9333ea;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
    outline: none;
}

.create {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    font-size: 1.1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    width: 100%;
    max-width: 300px;
}

.create:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.participants-list,
.request-list,
.invite-list {
    background: #333;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #555;
}

.participant-item,
.request-item,
.invite-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
    background: #444;
    padding: 0.8rem;
    border-radius: 8px;
    font-size: 1rem;
}

.remove-btn {
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.remove-btn:hover {
    background: #b91c1c;
    transform: scale(1.1);
}

.badge {
    background: #9333ea;
    color: white;
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    margin-left: 1rem;
}

.button-group {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
}

.event-sidebar {
    background: #222;
    border-radius: 0 10px 10px 0;
    width: 300px;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    position: sticky;
    top: 2rem;
}

.event-sidebar h4 {
    position: sticky;
    top: 0;
    background: #222;
    padding: 1.2rem;
    text-align: center;
    font-weight: bold;
    font-size: 1.2rem;
    z-index: 10;
    border-bottom: 1px solid #444;
    margin: 0;
}

.event-sidebar-scroll {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.event-sidebar-scroll::-webkit-scrollbar {
    display: none;
}

.upcoming-event {
    background: #2a2a2a;
    padding: 1.2rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    border: 1px solid #333;
    cursor: pointer;
}

.upcoming-event:hover {
    transform: translateY(-3px);
    border-color: #9333ea;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.upcoming-event.active {
    border: 1px solid #9333ea;
    background: #555;
    animation: pulse 2s infinite;
}

.submit-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.8rem 1.2rem;
    border: none;
    font-size: 1.1rem;
    border-radius: 8px;
    margin: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

/* Добавляем стили для мобильных устройств */
@media (max-width: 768px) {
    .team-page {
        padding: 0;
        margin-left: 0;
    }

    .main-section {
        flex-direction: column;
        gap: 0;
    }

    .team-form {
        border-radius: 0;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .header {
        flex-direction: column;
        gap: 1rem;
    }

    .image-upload {
        width: 100%;
        height: 200px;
    }

    .team-title {
        width: 100%;
        font-size: 1rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        font-size: 1rem;
    }

    input,
    select {
        padding: 0.8rem;
        font-size: 1rem;
    }

    .create {
        width: 100%;
        max-width: none;
        padding: 1rem;
    }

    .participant-item,
    .request-item,
    .invite-item {
        flex-direction: column;
        gap: 0.8rem;
        text-align: center;
    }

    .badge {
        margin: 0.5rem 0;
    }

    .event-sidebar {
        width: 100%;
        border-radius: 0;
        position: fixed;
        right: -100%;
        top: 60px;
        bottom: 0;
        z-index: 999;
        transition: right 0.3s ease;
    }

    .event-sidebar.mobile-open {
        right: 0;
    }

    .event-sidebar h4 {
        padding: 1rem;
    }

    .upcoming-event {
        padding: 1rem;
    }

    .upcoming-event:hover {
        transform: none;
    }

    .submit-btn {
        width: 100%;
        margin: 0;
        border-radius: 0;
        padding: 1rem;
    }
}

/* Добавляем стили для планшетов */
@media (min-width: 769px) and (max-width: 1024px) {
    .team-page {
        padding: 1rem;
    }

    .main-section {
        gap: 1rem;
    }

    .team-form {
        padding: 1.5rem;
    }

    .image-upload {
        width: 10rem;
        height: 10rem;
    }
}

/* Добавляем анимации */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
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

/* Добавляем поддержку prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {

    .team-page,
    .team-form,
    .upcoming-event,
    .create,
    .submit-btn,
    .remove-btn {
        animation: none;
        transition: none;
    }

    .upcoming-event:hover {
        transform: none;
    }
}

/* Добавляем стили для бургер-меню */
.burger-menu {
    display: none;
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

.burger-menu-wrapper {
    display: none;
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

/* Добавляем стили для оверлея */
.sidebar-overlay {
    display: none;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
}

/* Добавляем анимацию для шапки */
@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }

    to {
        transform: translateY(0);
    }
}

.burger-menu-wrapper {
    animation: slideDown 0.3s ease-out;
}

/* Добавляем стили для активного состояния бургер-меню */
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

/* Обновляем медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
    .burger-menu {
        display: flex;
    }

    .burger-menu-wrapper {
        display: block;
    }

    .team-page {
        padding-top: 76px;
        /* Добавляем отступ для шапки */
    }

    .sidebar-overlay {
        display: block;
    }

    .event-sidebar {
        width: 100%;
        border-radius: 0;
        position: fixed;
        right: -100%;
        top: 60px;
        bottom: 0;
        z-index: 999;
        transition: right 0.3s ease;
        background: #222;
    }

    .event-sidebar.mobile-open {
        right: 0;
    }

    .event-sidebar h4 {
        padding: 1.2rem;
        background: #222;
        border-bottom: 1px solid #444;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .event-sidebar-scroll {
        height: calc(100vh - 120px);
        /* Учитываем высоту шапки и заголовка сайдбара */
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .submit-btn {
        position: sticky;
        bottom: 0;
        width: 100%;
        padding: 1.2rem;
        background: linear-gradient(to right, #3b82f6, #9333ea);
        color: white;
        border: none;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
}
</style>