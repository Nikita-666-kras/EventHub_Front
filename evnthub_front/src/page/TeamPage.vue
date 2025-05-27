<template>
    <div class="team-page">
        <NavBar />
        <div class="main-section">
            <div class="team-form">
                <div class="header">
                    <input v-model="team.name" placeholder="Название команды" class="team-title" />
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

                <div v-if="team.members.length" class="form-group">
                    <label>Участники команды</label>
                    <div class="participants-list">
                        <div class="participant-item" v-for="member in team.members" :key="member.id">
                            <span>{{ member.nickname }} ({{ member.email }})</span>
                            <span v-if="member.isLeader" class="badge">Лидер</span>
                            <button v-if="!member.isLeader" class="remove-btn"
                                @click="removeMember(member.id)">×</button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="eventSelect">Выберите мероприятие</label>
                    <select v-model="selectedEventId" id="eventSelect">
                        <option v-for="ev in availableEvents" :key="ev.id" :value="ev.id">
                            {{ ev.eventName }}
                        </option>
                    </select>
                </div>

                <div v-if="selectedTeam" class="form-group">
                    <label>Пригласить участника</label>
                    <input type="text" v-model="userSearch" @input="searchUsers"
                        placeholder="Начните вводить имя или email" class="search-input" />
                    <ul v-if="searchResults.length" class="search-results">
                        <li v-for="user in searchResults" :key="user.id" @click="inviteUser(user)">
                            {{ user.nickname }} ({{ user.email }})
                        </li>
                    </ul>
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

                <div class="button-group">
                    <button @click="submitTeam" class="create">{{ selectedTeam ? 'Сохранить' : 'Создать' }}</button>
                    <button @click="resetForm" class="secondary">Новая команда</button>
                </div>
            </div>

            <div class="event-sidebar">
                <h4>Мои команды</h4>
                <div class="event-sidebar-scroll">
                    <div class="upcoming-event" v-for="team in userTeams" :key="team.id" @click="selectTeam(team)"
                        :class="{ active: selectedTeam?.id === team.id }">
                        <p>{{ team.name }}</p>
                    </div>
                </div>
                <button @click="resetForm" class="submit-btn">Создать команду</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/nav_bar.vue'
import api from '@/utils/axios'

const team = ref({ id: null, name: '', event: null, members: [] })
const userTeams = ref([])
const selectedTeam = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const joinRequests = ref([])
const invites = ref([])
const userSearch = ref('')
const searchResults = ref([])

const selectedEventId = ref(null)
const availableEvents = ref([])

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
  console.log(userId)
  userTeams.value = (await api.get(`/teams/user/${userId}`)).data || []
}

const selectTeam = async (teamItem) => {
  selectedTeam.value = teamItem
  const resMembers = await api.get(`/teams/${teamItem.id}/members`)
  team.value = { ...teamItem, members: resMembers.data || [] }

  // Загрузить заявки и приглашения для выбранной команды
  const resJoinRequests = await api.get('/teams/join-requests')
  joinRequests.value = resJoinRequests.data.filter(r => r.teamId === teamItem.id)

  const resInvites = await api.get('/teams/invites')
  invites.value = resInvites.data.filter(i => i.teamId === teamItem.id)
}

const submitTeam = async () => {
  const userId = getUserIdFromToken()
  if (!userId) {
    alert('Не авторизован')
    return
  }
  if (!team.value.name) {
    alert('Введите название команды')
    return
  }
  if (!selectedEventId.value) {
    alert('Выберите мероприятие')
    return
  }

  const payload = {
    event_id: selectedEventId.value,
    name: team.value.name,
    leader_id: userId,
    type: team.value.type || 'FIXED',
  }

  try {
    if (selectedTeam.value) {
      await api.patch(`/teams/${team.value.id}/update`, payload)
      alert('Команда обновлена')
    } else {
      const res = await api.post('/teams', payload)
      alert('Команда создана')
      // После создания команды сразу обновляем список
      await loadUserTeams()
    }
    await loadUserTeams()
  } catch (e) {
    alert('Ошибка при сохранении команды')
    console.error(e)
  }
}

const addMember = async () => {
  if (!team.value.id) {
    alert('Выберите команду')
    return
  }
  if (!userSearch.value.trim()) {
    alert('Введите имя или email участника для поиска')
    return
  }
  try {
    // Найдём пользователя (поиск в поисковых результатах)
    const userToAdd = searchResults.value.find(u => u.nickname === userSearch.value || u.email === userSearch.value)
    if (!userToAdd) {
      alert('Пользователь не найден')
      return
    }
    await api.post(`/teams/${team.value.id}/add-member`, {
      participant_id: userToAdd.id,
      role: 'MEMBER',
    })
    alert('Участник добавлен')
    userSearch.value = ''
    searchResults.value = []
    await selectTeam(team.value) // Обновим участников
  } catch (e) {
    alert('Ошибка при добавлении участника')
    console.error(e)
  }
}

const searchUsers = async () => {
  if (!userSearch.value.trim()) {
    searchResults.value = []
    return
  }
  try {
    const res = await api.get(`/users/search?query=${encodeURIComponent(userSearch.value)}`)
    searchResults.value = res.data || []
  } catch (e) {
    console.error('Ошибка поиска пользователей', e)
    searchResults.value = []
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
  userSearch.value = ''
  searchResults.value = []
  selectedEventId.value = null
}

onMounted(() => {
  loadUserTeams()
  loadAvailableEvents()
})
</script>





<<style scoped>
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
    padding: 0.6rem 1rem;
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
    margin-bottom: 0.5rem;
}

input,
select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
    background: #333;
    color: white;
    transition: all 0.3s ease;
}

input:focus,
select:focus {
    border: 1px solid #9333ea;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
    outline: none;
}

.create {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.create:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.secondary {
    background: #555;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 1rem;
    margin-left: 1rem;
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
    margin-bottom: 0.5rem;
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
}

.remove-btn {
    background: #a00;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-weight: bold;
    cursor: pointer;
}

.remove-btn:hover {
    background: #c00;
}

.badge {
    background: #9333ea;
    color: white;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    margin-left: 1rem;
}

.button-group {
    display: flex;
    justify-content: center;
}

.event-sidebar {
    background: #222;
    border-radius: 0 10px 10px 0;
    width: 300px;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 100vh;
}

.event-sidebar-scroll {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;
}

.upcoming-event {
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.upcoming-event:hover {
    background: #555;
}

.upcoming-event.active {
    background: #555;
    border: 1px solid #9333ea;
}

.submit-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    font-size: 1rem;
    border-radius: 8px;
    margin: 1rem;
    cursor: pointer;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
    }

    @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
    }

    @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
    }
    
</style>