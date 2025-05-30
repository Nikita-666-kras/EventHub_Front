<template>
  <div class="profile-layout">
    <NavBar />
    <div v-if="toast.visible" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <div class="content">
      <div class="profile-card">
        <div class="profile-header">
          <p class="section-title">Профиль</p>
          <div class="actions">
            <img src="@/assets/login_icons/push.png" alt="Уведомления" class="imge" @click="toggleInvitesPopup" />
            <img src="@/assets/login_icons/redact.png" alt="Редактировать" class="imge" @click="startEdit"
              v-if="!isEditing" />
            <div v-if="invitesPopupVisible" class="invites-popup">
              <h4>Приглашения в команды</h4>
              <div v-if="teamInvites.length === 0">Нет приглашений</div>
              <div v-for="invite in teamInvites" :key="invite.id" class="invite-card">
                <p>Команда: {{ invite.teamName || invite.teamId }}</p>
                <div class="buttons">
                  <button @click="respondToInvite(invite.id, 'APPROVED')">Принять</button>
                  <button @click="respondToInvite(invite.id, 'REJECTED')">Отклонить</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-info">
          <div class="left">
            <label v-if="isEditing" for="avatarInput">
              <div class="avatar clickable" :style="avatarPreview ? { backgroundImage: `url('${avatarPreview}')` } : {}"
                title="Нажмите, чтобы выбрать изображение"></div>
            </label>
            <div v-else class="avatar" :style="avatarPreview ? { backgroundImage: `url('${avatarPreview}')` } : {}">
            </div>
            <input id="avatarInput" type="file" accept="image/*" hidden @change="handleAvatarUpload" />
          </div>
          <div class="right">
            <div class="field-row"><span class="label">Фамилия:</span>
              <span v-if="!isEditing">{{ user.lastName }}</span>
              <input v-else v-model="editedUser.lastName" />
            </div>
            <div class="field-row"><span class="label">Имя:</span>
              <span v-if="!isEditing">{{ user.name }}</span>
              <input v-else v-model="editedUser.name" />
            </div>
            <div class="field-row"><span class="label">Отчество:</span>
              <span v-if="!isEditing">{{ user.middleName }}</span>
              <input v-else v-model="editedUser.middleName" />
            </div>
            <div class="field-row"><span class="label">Email:</span>
              <span v-if="!isEditing">{{ user.email }}</span>
              <input v-else v-model="editedUser.email" />
            </div>
            <div class="field-row"><span class="label">Телефон:</span>
              <span v-if="!isEditing">{{ user.phoneNumber }}</span>
              <input v-else v-model="editedUser.phoneNumber" />
            </div>
            <div class="field-row"><span class="label">Telegram:</span>
              <span v-if="!isEditing">{{ user.telegram }}</span>
              <input v-else v-model="editedUser.telegram" />
            </div>
            <div class="field-row"><span class="label">Дата рождения:</span>
              <span v-if="!isEditing">{{ user.birthDate }}</span>
              <input v-else v-model="editedUser.birthDate" type="date" />
            </div>
            <div class="field-row"><span class="label">Возраст:</span>
              <span>{{ user.age }} лет</span>
            </div>
          </div>
        </div>

        <div v-if="isEditing" style="display:flex; gap:1rem; margin-top:1rem;">
          <button class="create" @click="saveEdit">Сохранить</button>
          <button class="create" style="background:#888;" @click="cancelEdit">Отмена</button>
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

const isEditing = ref(false)
const editedUser = ref({})
const invitesPopupVisible = ref(false)
const teamInvites = ref([])


const avatarFile = ref(null)
const avatarPreview = ref('')

const handleAvatarUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => (avatarPreview.value = reader.result)
  reader.readAsDataURL(file)
}

const uploadAvatarToS3 = async (userId) => {
  if (!avatarFile.value) return

  const formData = new FormData()
  formData.append('file', avatarFile.value)
  formData.append('uploaded_by', userId)
  formData.append('entity_type', 'USER')
  formData.append('entity_id', userId)

  try {
    await api.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    showToast('Аватар обновлён', 'success')
  } catch (err) {
    console.error('Ошибка загрузки аватара:', err)
    showToast('Ошибка загрузки аватара', 'error')
  }
}

const updateAvatarPreview = (userId) => {
  avatarPreview.value = `${import.meta.env.VITE_API_URL}/api/files/avatar/user/${userId}`
}


const formatDate = (iso) => new Date(iso).toLocaleString()

const toast = ref({ visible: false, message: '', type: 'info' })

const showToast = (msg, type = 'info') => {
  toast.value = { visible: true, message: msg, type }
  setTimeout(() => {
    toast.value.visible = false
  }, 4000)
}

const respondToInvite = async (inviteId, status) => {
  try {
    await api.patch(`/teams/invites/${inviteId}/status`, { status })
    teamInvites.value = teamInvites.value.filter(i => i.id !== inviteId)
    showToast(`Приглашение ${status === 'APPROVED' ? 'принято' : 'отклонено'}`, 'success')
  } catch (e) {
    showToast('Ошибка при ответе на приглашение', 'error')
  }
}


const toggleInvitesPopup = () => {
  invitesPopupVisible.value = !invitesPopupVisible.value
}

const loadTeamInvites = async (userId) => {
  try {
    const res = await api.get(`/teams/invites/by-participant/${userId}`)
    teamInvites.value = res.data || []
  } catch (e) {
    console.error('Ошибка загрузки приглашений:', e)
  }
}


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

const startEdit = () => {
  editedUser.value = { ...user.value }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveEdit = async () => {
  const userId = getUserIdFromToken()
  if (!userId) return

  try {
    await api.patch('/users', { ...editedUser.value, id: userId })
    user.value = { ...editedUser.value }
    isEditing.value = false
    showToast('Профиль успешно сохранён', 'success')

    await uploadAvatarToS3(userId)
  } catch (e) {
    showToast('Ошибка при сохранении профиля', 'error')
  }
}




onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return

  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data
    updateAvatarPreview(userId)

    const eventsRes = await api.get(`/events/participant/${userId}`)
    const allEvents = eventsRes.data || []

    const now = new Date()
    soloEvents.value = allEvents.filter(e => new Date(e.endDateAndTime) < now && e.grouping === 'solo')
    groupEvents.value = allEvents.filter(e => new Date(e.endDateAndTime) < now && e.grouping === 'group')
    upcomingEvents.value = allEvents.filter(e => new Date(e.startDateAndTime) >= now)

    await loadTeamInvites(userId) // <== вот сюда передай userId
  } catch (e) {
    console.error('Ошибка загрузки данных:', e)
  }
})

</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 30px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: fadeInOut 0.4s ease;
}

.toast.success {
  background-color: #10b981;
  /* зелёный */
}

.toast.error {
  background-color: #ef4444;
  /* красный */
}

.toast.info {
  background-color: #3b82f6;
  /* синий */
}

@keyframes fadeInOut {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.avatar.clickable {
  cursor: pointer;
  border-color: #3b82f6;
}


.invites-popup {
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  background: #333;
  border: 1px solid #555;
  padding: 1rem;
  border-radius: 12px;
  width: 300px;
  z-index: 1000;
  color: white;
}

.invite-card {
  background: #444;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 0.8rem;
}

.invite-card .buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 0.6rem;
}

.invite-card button {
  background: #9333ea;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.invite-card button:hover {
  background: #7e22ce;
}



.profile-layout {
  min-height: 100vh;
  margin-left: 80px;
  display: flex;
  width: 100%;
  background: #150a1e;
  padding: 2rem 0;
  justify-content: center;
}

.content {
  display: flex;
  justify-content: space-between;
  width: 80%;
  max-width: 1224px;
  margin: 0 auto;

}

.profile-card {
  background: #444;
  border-radius: 16px 0 16px 16px;
  color: white;
  padding: 2.5rem;
  flex: 2;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: fadeIn 0.5s ease-out;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.actions {
  display: flex;
  position: relative;
  gap: 1rem;
}

.imge {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.imge:hover {
  transform: scale(1.1);
  opacity: 1;
}

.profile-info {
  display: flex;
  gap: 3rem;
  margin-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333;
}

.avatar {
  width: 224px;
  height: 200px;
  border-radius: 12px;
  background: #2a2a2a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  border: 2px solid #9333ea;
}

.avatar:hover {
  transform: scale(1.02);
}

.right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.field-row {
  display: flex;
  justify-content: space-between;
  background: #2a2a2a;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.field-row:hover {
  transform: translateX(5px);
  border-color: #9333ea;
}

.field-row .label {
  font-weight: 600;
  color: #fff;
}

.section-subtitle {
  margin: 3rem 0 2rem;
  font-size: 1.8rem;
  color: #fff;
  text-align: center;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.events-columns {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  margin-top: 2rem;
}

.column h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
}

.line {
  background: linear-gradient(to right, transparent, #9333ea, transparent);
  height: 2px;
  width: 13rem;
  margin: 1rem auto;
}

.event-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  color: white;
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-3px);
  border-color: #9333ea;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.event-title {
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #fff;
}

.calendar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.icons {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.event-card:hover .icons {
  transform: scale(1.1);
  opacity: 1;
}

.event-date,
.event-location {
  font-size: 0.9rem;
  color: #888;
}

.upcoming {
  background: #222;
  border-radius: 0 16px 16px 0;
  padding: 1.5rem;
  color: white;
  height: fit-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: slideIn 0.5s ease-out;
  flex: 1;
}

.upcoming h4 {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.event-upcoming {
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  background: #444;
  transition: all 0.3s ease;
}

.event-upcoming:hover {
  transform: translateX(5px);
  border-color: #9333ea;
}

.event-upcoming p {
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.5rem;
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

@media (max-width: 1024px) {
  .profile-layout {
    margin-left: 0;
    width: 100%;
  }

  .content {
    flex-direction: column;
  }

  .profile-card,
  .upcoming {
    width: 100%;
  }

  .profile-info {
    flex-direction: column;
    align-items: center;
  }

  .avatar {
    width: 180px;
    height: 160px;
  }
}
</style>