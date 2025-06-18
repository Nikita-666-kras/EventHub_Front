<template>
    <div class="event-details-wrapper">
        <NavBar />

        <button class="back-button" @click="$router.back()">

            Назад
        </button>

        <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
        </div>

        <div v-else class="event-details fade-in">
            <div class="event-header slide-in">
                <div class="left">
                    <div class="banner-container">
                        <img class="banner" :src="event.image" alt="Event image" />
                    </div>
                    <div class="right">
                        <h2 class="title">{{ event.eventName }}</h2>
                        <div class="event-status" :class="getEventStatusClass()">
                            {{ getEventStatus() }}
                        </div>
                        <div class="creator">
                            <img class="creator-avatar" src="@/assets/icons/user_black.png" />
                            <p>{{ creator.name }}</p>
                        </div>
                    </div>

                    <div class="participants-progress">
                        <div class="progress-bar"
                            :style="{ width: (event.currentParticipantQuantity / event.maxParticipantNumber * 100) + '%' }">
                        </div>
                        <span class="progress-text">
                            {{ event.currentParticipantQuantity }} / {{ event.maxParticipantNumber }} участников
                        </span>
                    </div>

                    <div class="date-location">
                        <div class="date">
                            <img src="@/assets/login_icons/calendar_white.png" alt="calendar icon" />
                            <p><strong>Начало:</strong> {{ formatDate(event.startDateAndTime) }}</p>
                            <p class="relative-time">{{ getRelativeTime(event.startDateAndTime) }}</p>
                            <p><strong>Конец:</strong> {{ formatDate(event.endDateAndTime) }}</p>
                        </div>

                        <div class="location">
                            <img src="@/assets/login_icons/location_white.png" alt="location icon" />
                            <p>{{ event.eventAddress }}</p>
                        </div>
                    </div>

                    <p class="description">{{ event.description }}</p>

                    <div class="event-extra-info">
                        <p><strong>Максимальное количество участников:</strong> {{ event.maxParticipantNumber }}</p>
                        <p><strong>Текущее количество участников:</strong> {{ event.currentParticipantQuantity }}</p>
                        <p><strong>Формат:</strong> {{ event.online ? 'Онлайн' : 'Оффлайн' }}</p>
                        <p v-if="event.isRecurring"><strong>Повторяемое мероприятие</strong></p>
                        <div v-if="event.fields && event.fields.length">
                            <strong>Дополнительные поля:</strong>
                            <ul>
                                <li v-for="(field, idx) in event.fields" :key="idx">
                                    {{ field.name }} ({{ field.type }})
                                </li>
                            </ul>
                        </div>
                    </div>

                    <form class="custom-fields-form" @submit.prevent="register"
                        v-if="!isRegistered && !isCreator && event && (event.qrCode === 'solo' || event.qrCode === 'both')">
                        <div v-for="field in customFields" :key="field.name" class="custom-field">
                            <label :for="field.name">
                                {{ field.name }}
                                <span v-if="field.required">*</span>
                                <span class="field-hint" v-if="field.hint">{{ field.hint }}</span>
                            </label>
                            <input v-model="customFieldValues[field.name]" :id="field.name"
                                :type="field.type === 'number' ? 'number' : 'text'" :required="field.required"
                                @input="validateField(field)" :class="{ 'error': fieldErrors[field.name] }" />
                            <span class="error-message" v-if="fieldErrors[field.name]">
                                {{ fieldErrors[field.name] }}
                            </span>
                        </div>
                        <button class="register-btn" type="submit" :disabled="!isFormValid">
                            Зарегистрироваться
                        </button>
                    </form>




                    <div v-if="canShowTeamRegistrationAfterSolo" class="team-registration-section">
                        <div class="team-option-notice">
                            <h4>Хотите создать команду?</h4>
                            <p>Вы можете создать или присоединиться к команде для этого мероприятия</p>
                        </div>
                        <div class="team-buttons">
                            <button class="team-btn create-team"
                                @click="$router.push(`/team?eventId=${route.params.id}`)">
                                Создать команду
                            </button>
                            <button class="team-btn join-team"
                                @click="$router.push(`/team?eventId=${route.params.id}`)">
                                Присоединиться к команде
                            </button>
                        </div>
                    </div>

                    <div v-if="isCreator" class="creator-preview">
                        <h4>Предварительный просмотр формы регистрации</h4>
                        <p class="creator-note">Как создатель мероприятия, вы видите форму регистрации, которую увидят
                            участники</p>
                        <div class="custom-fields-form creator-form">
                            <div v-for="field in customFields" :key="field.name" class="custom-field">
                                <label :for="field.name">
                                    {{ field.label || field.name }}
                                    <span v-if="field.required">*</span>
                                    <span class="field-hint" v-if="field.hint">{{ field.hint }}</span>
                                </label>
                                <input v-model="customFieldValues[field.name]" :id="field.name"
                                    :type="field.type === 'number' ? 'number' : 'text'" :required="field.required"
                                    disabled :class="{ 'error': fieldErrors[field.name] }" />
                                <span class="error-message" v-if="fieldErrors[field.name]">
                                    {{ fieldErrors[field.name] }}
                                </span>
                            </div>
                            <button class="register-btn" type="button" disabled>
                                Зарегистрироваться (недоступно для создателя)
                            </button>
                        </div>
                    </div>

                    <div v-else-if="isRegistered" class="already-registered">
                        <p>Вы уже зарегистрированы на это мероприятие</p>
                        <div class="registered-actions">
                            <button class="view-stats-btn" @click="$router.push('/lenta')">
                                Лента
                            </button>
                            <button class="cancel-registration-btn" @click="cancelRegistration">
                                Отменить участие
                            </button>
                        </div>
                    </div>

                    <div class="share-buttons">
                        <button @click="shareEvent('vk')" class="share-btn vk">
                            <i class="fab fa-vk"></i> ВКонтакте
                        </button>
                        <button @click="shareEvent('telegram')" class="share-btn telegram">
                            <i class="fab fa-telegram"></i> Telegram
                        </button>
                    </div>
                </div>
            </div>

            <div class="event-content">
                <div class="event-info hover-lift">
                    <!-- Существующий контент -->
                </div>
                <div class="event-description hover-lift">
                    <!-- Существующий контент -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/axios'
import NavBar from '@/components/nav_bar.vue'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()

const event = ref({})
const creator = ref({})
const customFields = ref([])
const customFieldValues = ref({})
const fieldErrors = ref({})
const loading = ref(true)
const isRegistered = ref(false)
const isCreator = ref(false)
const isInTeam = ref(false)
const eventGrouping = ref('both')

onMounted(async () => {
  const eventId = route.params.id
  try {
    const { data: ev } = await api.get(`/event/${eventId}`)
    event.value = ev
    eventGrouping.value = ev.qrCode || ev.grouping || 'both'

    const { data: usr } = await api.get(`/users/${ev.creatorId}`)
    creator.value = usr

    const userId = getUserIdFromToken()
    isCreator.value = userId === ev.creatorId

    if (userId && !isCreator.value) {
      try {
        const { data: chk } = await api.get(`/participants/check/${userId}/${eventId}`)
        isRegistered.value = chk.isRegistered === true
      } catch {
        isRegistered.value = false
      }
    }

    try {
      const { data: res } = await api.get(`/responses/custom-fields/participant/${eventId}`)
      customFields.value = Array.isArray(res) ? res : res.fields || []
      customFields.value.forEach(f => customFieldValues.value[f.name] = '')
    } catch (e) {
      if (e.response?.status !== 404) toast.error('Ошибка загрузки дополнительных полей')
    }

    await checkIfInTeam()
  } catch (e) {
    console.error(e)
    toast.error('Ошибка загрузки события')
  } finally {
    loading.value = false
  }
})

const getEventStatus = () => {
  const now = new Date()
  const start = new Date(event.value.startDateAndTime)
  const end = new Date(event.value.endDateAndTime)
  if (now < start) return 'Предстоящее'
  if (now > end) return 'Завершенное'
  return 'Активное'
}

const getEventStatusClass = () => {
  const s = getEventStatus()
  return {
    upcoming: s === 'Предстоящее',
    active: s === 'Активное',
    ended: s === 'Завершенное'
  }
}

const getRelativeTime = dateStr => {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = date - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `через ${days} ${days === 1 ? 'день' : 'дня'}`
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'день' : 'дня'} назад`
  return 'сегодня'
}

const validateField = field => {
  const val = customFieldValues.value[field.name]
  if (field.required && (!val || val.toString().trim() === '')) {
    fieldErrors.value[field.name] = 'Это поле обязательно'
    return false
  }
  if (field.type === 'number' && val !== '' && isNaN(Number(val))) {
    fieldErrors.value[field.name] = 'Введите число'
    return false
  }
  fieldErrors.value[field.name] = ''
  return true
}

const isFormValid = computed(() => {
  return customFields.value.filter(f => f.required).every(f => validateField(f))
})

const checkIfInTeam = async () => {
  const userId = getUserIdFromToken()
  const eventId = route.params.id
  if (!userId || !eventId) {
    isInTeam.value = false
    return
  }
  try {
    const { data } = await api.get(`/teams/user-team/${userId}/${eventId}`)
    isInTeam.value = !!data && !!data.id
  } catch {
    isInTeam.value = false
  }
}

const shareEvent = (platform) => {
  const url = encodeURIComponent(`https://event-hub.space/event/${route.params.id}`)
  const title = encodeURIComponent(event.value.eventName)
  const link = platform === 'vk'
    ? `https://vk.com/share.php?url=${url}&title=${title}`
    : `https://t.me/share/url?url=${url}&text=${title}`
  window.open(link, '_blank')
}

const formatDate = iso => new Date(iso).toLocaleString()

const getUserIdFromToken = () => {
  try {
    const token = document.cookie.split('; ').find(r => r.startsWith('jwt='))?.split('=')[1]
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || payload.userId
  } catch {
    return null
  }
}

const register = async () => {
  const userId = getUserIdFromToken()
  const eventId = route.params.id
  if (!userId) return toast.error('Необходимо войти в систему')
  if (isCreator.value) return toast.error('Создатель не может регистрироваться')

  let participantId
  try {
    const { data } = await api.post('/participants/register', {
      userId,
      eventId,
      teamId: null
    })
    participantId = data.id || data.participantId
  } catch (e) {
    toast.error(e.response?.status === 409 ? 'Вы уже зарегистрированы' : 'Ошибка регистрации')
    return
  }

  if (customFields.value.length) {
    const responses = {}
    let allOk = true

    customFields.value.forEach(f => {
      const val = customFieldValues.value[f.name]
      if (f.required && (!val || val.toString().trim() === '')) {
        fieldErrors.value[f.name] = 'Это поле обязательно'
        allOk = false
      } else {
        fieldErrors.value[f.name] = ''
      }
      if (val !== undefined && val !== null && val !== '') {
        responses[f.name] = val.toString()
      }
    })

    if (!allOk) return toast.error('Заполните обязательные поля')

    try {
      await api.post('/responses/participant/submit', {
        event_id: eventId,
        participant_id: participantId,
        responses
      })
    } catch (e) {
      toast.error('Ошибка при отправке кастомных полей')
      return
    }
  }

  toast.success('Вы успешно зарегистрированы!')
  isRegistered.value = true
  event.value.currentParticipantQuantity += 1
  await checkIfInTeam()
}

const canShowTeamRegistrationAfterSolo = computed(() => {
  return event.value.qrCode === 'both' && isRegistered.value && !isInTeam.value
})

const cancelRegistration = async () => {
  const userId = getUserIdFromToken()
  const eventId = route.params.id
  if (!confirm('Отменить участие?')) return
  if (!userId) return toast.error('Необходимо войти в систему')

  try {
    await api.delete(`/participants/${userId}/${eventId}`)
    toast.success('Участие отменено')
    isRegistered.value = false
    event.value.currentParticipantQuantity -= 1
  } catch {
    toast.error('Ошибка при отмене регистрации')
  }
}
</script>


<style scoped>
.event-details-wrapper {
    background: #150a1e;
    color: white;
    min-height: 100vh;
    padding: 1rem;
    margin-left: 80px;
    animation: fadeIn 0.5s ease-out;
    position: relative;
}

.event-details {
    display: flex;
    justify-content: space-between;

    max-width: 1400px;
    margin: auto;
    background: #1a1a1a;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.6s ease-out;
    border: 1px solid #333;
}

.left {
    align-items: center;
    justify-content: center;
    flex: 2;
    animation: slideInLeft 0.6s ease-out;
}

.right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background: #222;
    padding: 2rem;
    margin: 1rem 0;
    border-radius: 12px;
    border: 1px solid #333;
    height: fit-content;
    animation: slideInRight 0.6s ease-out;
}

.banner-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.banner {
    max-width: 80%;
    min-width: 300px;
    min-height: 200px;
    height: auto;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
}

.banner:hover {
    transform: scale(1.02);
}

.date-location {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
}

.date,
.location {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.95rem;
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    flex: 1;
    border: 1px solid #333;
    transition: all 0.3s ease;
}

.date:hover,
.location:hover {
    transform: translateY(-2px);
    border-color: #9333ea;
}

.date img,
.location img {
    width: 24px;
    height: 24px;
    opacity: 0.8;
    transition: transform 0.3s ease;
}

.date:hover img,
.location:hover img {
    transform: scale(1.1);
    opacity: 1;
}

.description {
    background: #2a2a2a;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
    border: 1px solid #333;
    transition: all 0.3s ease;

}

.description:hover {
    transform: translateY(-2px);
    border-color: #9333ea;
}

.title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #fff;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.8s ease-out;
}

.creator {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    justify-content: center;
    border: 1px solid #333;
    transition: all 0.3s ease;
}

.creator:hover {
    transform: translateY(-2px);
    border-color: #9333ea;
}

.creator-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #9333ea;
    padding: 2px;
    transition: transform 0.3s ease;
}

.creator:hover .creator-avatar {
    transform: scale(1.1);
}

.register-btn {
    background: linear-gradient(135deg, #9333ea, #3b82f6);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
    animation: pulse 2s infinite;
}

.register-btn:hover {
    background: linear-gradient(135deg, #7e22ce, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
}

.register-btn:active {
    transform: translateY(0);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
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
        box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
    }

    50% {
        box-shadow: 0 4px 25px rgba(147, 51, 234, 0.5);
    }

    100% {
        box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
    }
}

@media (max-width: 1024px) {
    .event-details {
        flex-direction: column;
    }

    .right {
        width: 100%;
    }

    .date-location {
        flex-direction: column;
    }
}

.qr-code {
    width: 80px;
    height: 80px;
    margin-top: 0.5rem;
    border-radius: 8px;
    background: #fff;
    padding: 4px;
}

.event-extra-info {
    background: #232323;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    border: 1px solid #333;
    color: #eee;
    transition: all 0.3s ease;
    animation: fadeIn 0.7s;
}

.event-extra-info p,
.event-extra-info ul {
    margin: 0.3rem 0;
}

.event-extra-info ul {
    padding-left: 1.2rem;
}

.custom-fields-form {
    background: #232323;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #333;
    color: #eee;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.custom-field label {
    font-weight: 500;
    margin-bottom: 0.3rem;
    display: block;
}

.custom-field input {
    width: 100%;
    padding: 0.7rem;
    border-radius: 6px;
    border: 1px solid #555;
    background: #181818;
    color: #fff;
    font-size: 1rem;
    margin-top: 0.2rem;
}

.custom-field input:focus {
    border-color: #9333ea;
    outline: none;
}

.custom-field input:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
    border-color: #555;
}

.register-btn:disabled {
    background: #666;
    cursor: not-allowed;
    animation: none;
    transform: none;
}

.register-btn:disabled:hover {
    background: #666;
    transform: none;
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
}

.back-button {
    background: #2a2a2a;
    border: 1px solid #333;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.back-button:hover {
    background: #333;
    transform: translateX(-2px);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #9333ea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.event-status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    margin-bottom: 1rem;
    text-align: center;
}

.event-status.upcoming {
    background: #3b82f6;
}

.event-status.active {
    background: #22c55e;
}

.event-status.ended {
    background: #ef4444;
}

.participants-progress {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.progress-bar {
    height: 8px;
    background: linear-gradient(90deg, #9333ea, #3b82f6);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #888;
}

.relative-time {
    font-size: 0.9rem;
    color: #888;
    margin-top: 0.2rem;
}

.field-hint {
    font-size: 0.8rem;
    color: #888;
    margin-left: 0.5rem;
}

.error-message {
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 0.2rem;
}

.custom-field input.error {
    border-color: #ef4444;
}

.share-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.share-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.share-btn.vk {
    background: #4C75A3;
}

.share-btn.telegram {
    background: #0088cc;
}

.share-btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .event-details-wrapper {
        padding: 1rem 1rem 1rem 1rem;
        margin-left: 0;
    }

    .back-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        margin-bottom: 0;
        z-index: 10;
    }

    .event-details {
        padding: 1rem;
        margin-top: 3rem;
    }

    .date-location {
        flex-direction: column;
    }

    .share-buttons {
        flex-direction: column;
    }

    .share-btn {
        width: 100%;
        justify-content: center;
    }

    .team-registration-section {
        padding: 1.5rem;
        margin-top: 1.5rem;
    }

    .team-buttons {
        flex-direction: column;
        gap: 0.8rem;
    }

    .team-btn {
        width: 100%;
        padding: 1rem;
        font-size: 1rem;
    }

    .team-only-notice h4,
    .team-option-notice h4 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
    }

    .team-only-notice p,
    .team-option-notice p {
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .registered-actions {
        flex-direction: column;
        gap: 0.8rem;
    }

    .view-stats-btn,
    .cancel-registration-btn {
        width: 100%;
        padding: 1rem;
        font-size: 1rem;
    }
}

.qr-section {
    text-align: center;
    margin-top: 2rem;
    padding: 1rem;
    background: #333;
    border-radius: 8px;
}

.qr-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}

.qr-actions button {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.qr-actions button:hover {
    background: #2563eb;
}

.custom-qr {
    border: 8px solid #8a879f;
    border-radius: 16px;
    padding: 8px;
    background: #8a879f;
    display: inline-block;
    border-radius: 8px;
    margin: 1rem 0;
}

.already-registered {
    text-align: center;
    margin-top: 1rem;
    padding: 1rem;
    background: #232323;
    border-radius: 8px;
    border: 1px solid #333;
}

.already-registered p {
    margin-bottom: 1rem;
}

.view-stats-btn {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.view-stats-btn:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.creator-preview {
    margin-top: 1rem;
    padding: 1rem;
    background: #232323;
    border-radius: 8px;
    border: 1px solid #333;
}

.creator-preview h4 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.creator-note {
    font-size: 0.9rem;
    color: #888;
    margin-bottom: 1rem;
}

.creator-form {
    margin-top: 1rem;
}

.team-registration-section {
    margin-top: 1rem;
    padding: 1rem;
    background: #232323;
    border-radius: 8px;
    border: 1px solid #333;
}

.team-only-notice,
.team-option-notice {
    margin-bottom: 1rem;
}

.team-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.team-btn {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.team-btn:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.registered-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.cancel-registration-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cancel-registration-btn:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(239, 70, 70, 0.4);
}
</style>