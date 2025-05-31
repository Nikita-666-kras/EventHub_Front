<template>
  <div class="profile-layout">
    <NavBar />
    <div v-if="toast.visible" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>

    <div v-if="isLoading" class="loading-state">
      Загрузка данных...
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
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
              <span v-if="!isEditing">{{ user.age }} лет</span>
              <span v-else>{{ calculatedAge }} {{ calculatedAge ? 'лет' : '' }}</span>
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
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'

const user = ref({})
const soloEvents = ref([])
const groupEvents = ref([])
const upcomingEvents = ref([])
const isLoading = ref(false)
const error = ref(null)

const isEditing = ref(false)
const editedUser = ref({})
const invitesPopupVisible = ref(false)
const teamInvites = ref([])

// Computed property to calculate age from birthDate
const calculatedAge = computed(() => {
  const birthDateStr = editedUser.value.birthDate;
  if (!birthDateStr) return '';
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : ''; // Return age or empty string for invalid dates/future dates
})

const avatarFile = ref(null)
const avatarPreview = ref('')

const refreshToken = async () => {
  try {
    const refreshToken = document.cookie.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1]
    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
    if (res.data?.access_token) {
      document.cookie = `jwt=${res.data.access_token}; path=/`
      return res.data.access_token
    }
    throw new Error('No access token in response')
  } catch (err) {
    console.error('Error refreshing token:', err)
    window.location.href = '/login'
    throw err
  }
}

const getValidToken = async () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
  if (!token) {
    return await refreshToken()
  }
  return token
}

const isValidImageFormat = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

const handleAvatarUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('Размер файла не должен превышать 5MB', 'error')
    return
  }

  if (!isValidImageFormat(file)) {
    showToast('Пожалуйста, загрузите изображение в формате JPG, PNG, GIF или WebP', 'error')
    return
  }

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = reader.result
  }
  reader.onerror = () => {
    showToast('Ошибка при чтении файла', 'error')
    avatarPreview.value = ''
  }
  reader.readAsDataURL(file)
}

const uploadAvatarToS3 = async (userId) => {
  if (!avatarFile.value) return null

  try {
    const token = await getValidToken()
    if (!token) {
      showToast('Необходимо авторизоваться', 'error')
      window.location.href = '/login'
      return null
    }

    if (!(avatarFile.value instanceof File)) {
      console.error('Некорректный файл для загрузки аватара')
      return null
    }

    const formData = new FormData()
    formData.append('file', avatarFile.value)
    formData.append('uploaded_by', userId)
    formData.append('entity_type', 'USER')
    formData.append('entity_id', userId)

    const headers = {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    console.log('Отправка запроса на загрузку аватара...')
    const res = await api.post('/storage/upload', formData, {
      headers,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Загрузка аватара: ${percentCompleted}%`)
      },
      timeout: 30000
    })

    if (!res.data?.s3_url) {
      console.error('URL изображения не получен в ответе S3:', res.data)
      showToast('Ошибка: URL аватара не получен', 'error')
      return null
    }

    const s3Url = res.data.s3_url
    console.log('Аватар успешно загружен в S3, URL:', s3Url)

    showToast('Аватар успешно загружен', 'success')
    return s3Url

  } catch (err) {
    console.error('Ошибка загрузки в S3:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })

    if (err.response?.status === 401) {
      try {
        await refreshToken()
        return await uploadAvatarToS3(userId)
      } catch (refreshErr) {
        showToast('Сессия истекла. Перенаправление на страницу входа...', 'error')
        window.location.href = '/login'
        throw refreshErr
      }
    } else if (err.response?.status === 413) {
      showToast('Файл слишком большой (макс. 5MB)', 'error')
    } else if (err.response?.status === 415) {
      showToast('Неподдерживаемый формат файла. Используйте JPG, PNG, GIF или WebP.', 'error')
    } else {
      showToast('Ошибка при загрузке аватара. Пожалуйста, попробуйте еще раз.', 'error')
    }
    throw err
  }
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
  if (!userId) {
    showToast('Пользователь не авторизован', 'error')
    return
  }

  try {
    // Upload avatar first if a new file is selected
    let avatarUrl = user.value.image // Start with current avatar URL
    if (avatarFile.value) {
      console.log('Обнаружен новый файл аватара, загружаем в S3...')
      try {
        avatarUrl = await uploadAvatarToS3(userId)
      } catch (uploadErr) {
        console.error('Ошибка при загрузке нового аватара в S3, отменяем сохранение профиля:', uploadErr)
        // If avatar upload fails, stop the profile save process
        // The uploadAvatarToS3 function already shows a toast
        return
      }
    }

    // Calculate age before preparing the payload
    let ageToSend = null;
    const birthDateStr = editedUser.value.birthDate;
    if (birthDateStr) {
      const birthDate = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0) {
        ageToSend = age;
      }
    }

    // Prepare payload for patching user data, including the (potentially new) avatar URL and calculated age
    const updatePayload = {
      ...editedUser.value,
      id: userId,
      image: avatarUrl,
      age: ageToSend // Include the calculated age in the payload
    }
    // Removed: delete updatePayload.age; // No longer deleting age

    console.log('Сохраняем данные профиля с URL аватара и возрастом:', updatePayload)

    // Patch user data on the backend
    await api.patch('/users', updatePayload)

    user.value = { ...user.value, ...editedUser.value, image: avatarUrl }
    isEditing.value = false

    showToast('Профиль успешно сохранён', 'success')

  } catch (e) {
    console.error('Ошибка при сохранении профиля:', e)
    if (e.response?.status !== 401) {
      showToast('Ошибка при сохранении профиля', 'error')
    }
  }
}

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return

  isLoading.value = true
  error.value = null

  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data

    if (user.value.image) {
      avatarPreview.value = user.value.image
    } else {
      avatarPreview.value = ''
    }

    const eventsRes = await api.get(`/events/participant/${userId}`)
    const allEvents = eventsRes.data || []

    const now = new Date()

    const parseDate = (dateStr) => {
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? null : date
    }

    soloEvents.value = allEvents.filter(e => {
      const endDate = parseDate(e.endDateAndTime)
      return endDate && endDate < now && e.grouping === 'solo'
    })

    groupEvents.value = allEvents.filter(e => {
      const endDate = parseDate(e.endDateAndTime)
      return endDate && endDate < now && e.grouping === 'group'
    })

    upcomingEvents.value = allEvents.filter(e => {
      const startDate = parseDate(e.startDateAndTime)
      return startDate && startDate >= now
    })

    await loadTeamInvites(userId)
  } catch (e) {
    console.error('Ошибка загрузки данных:', e)
    error.value = 'Не удалось загрузить данные. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
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
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
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
  padding: 0.5rem;
  color: white;
  height: fit-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  animation: slideIn 0.5s ease-out;
  flex: 1;
  max-height: 90vh;
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
}

.upcoming h4 {
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

.upcoming .event-upcoming {
  padding: 1rem;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.upcoming .event-upcoming::-webkit-scrollbar {
  display: none;
}

.event-upcoming {
  background: #2a2a2a;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.event-upcoming:hover {
  transform: translateY(-3px);
  border-color: #9333ea;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.2);
}

.event-upcoming.active {
  border: 1px solid #9333ea;
  background: #555;
  animation: pulse 2s infinite;
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

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: white;
  font-size: 1.2rem;
}

.error-state {
  color: #ef4444;
}
</style>