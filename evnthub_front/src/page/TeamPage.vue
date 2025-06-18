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
                <p v-if="isTeamCreated && teamEventName" class="team-event-name">
                    Мероприятие: <strong>{{ teamEventName }}</strong>
                </p>


                <div v-if="!isTeamCreated" class="form-group">
                    <label for="eventSelect">Выберите мероприятие</label>
                    <div class="event-search-container">
                        <div class="search-input-wrapper">
                            <input v-model="eventSearchQuery" @input="searchEvents" @focus="showEventDropdown = true"
                                placeholder="Введите название мероприятия или вставьте ссылку..."
                                class="event-search-input" :class="{ 'has-results': filteredEvents.length > 0 }" />
                            <div v-if="eventSearchQuery && !isSearching" class="search-actions">
                                <button @click="clearEventSearch" class="clear-search-btn" title="Очистить">
                                    ×
                                </button>
                            </div>
                            <div v-if="isSearching" class="search-loading">
                                <div class="search-spinner"></div>
                            </div>
                        </div>

                        <!-- Выпадающий список результатов поиска -->
                        <div v-if="showEventDropdown && (filteredEvents.length > 0 || eventSearchQuery)"
                            class="event-dropdown">
                            <div v-if="filteredEvents.length === 0 && eventSearchQuery && !isSearching"
                                class="no-results">
                                <p>Мероприятие не найдено</p>
                                <button @click="searchAllEvents" class="search-all-btn">
                                    Показать все доступные мероприятия
                                </button>
                            </div>
                            <div v-for="event in filteredEvents" :key="event.id" @click="selectEventFromSearch(event)"
                                class="event-option" :class="{ 'selected': selectedEventId === event.id }">
                                <div class="event-info">
                                    <h4>{{ event.eventName }}</h4>
                                    <p class="event-date">{{ formatEventDate(event.startDateAndTime) }}</p>
                                    <span class="event-type" :class="getEventTypeClass(event)">
                                        {{ getEventTypeText(event) }}
                                    </span>
                                </div>
                                <div class="event-status">
                                    <span class="participant-badge">✅ Доступно</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p v-if="route.query.eventId && selectedEventId === route.query.eventId"
                        class="auto-selected-notice">
                        ✅ Мероприятие автоматически выбрано
                    </p>
                    <p v-if="selectedEventId" class="event-type-info">
                        {{ getEventGroupingInfo(selectedEventId) }}
                    </p>
                    <p v-if="selectedEventId && !isEventSupportsTeams(selectedEventId)" class="event-warning">
                        ⚠️ Это мероприятие не поддерживает командную регистрацию
                    </p>
                </div>

                <!-- Кастомные поля команды -->
                <div v-if="!isTeamCreated && customFields.length > 0" class="form-group">
                    <label>Дополнительная информация о команде</label>
                    <div class="custom-fields-form">
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
                    </div>
                </div>

                <div class="button-group">
                    <button @click="submitTeam" class="create" :disabled="!isFormValid || loading">
                        <span v-if="loading" class="loading-spinner"></span>
                        {{ isTeamCreated ? 'Сохранить изменения' : 'Создать команду' }}
                    </button>
                </div>

                <!-- Кастомные поля команды для существующих команд -->
                <div v-if="isTeamCreated && customFields.length > 0" class="form-group">
                    <label>Дополнительная информация о команде</label>
                    <div class="custom-fields-form">
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
                    </div>
                </div>

                <div v-if="isTeamCreated" class="form-group">
                    <label>Пригласить участника</label>
                    <div class="invite-section">
                        <select v-model="selectedParticipantId" class="search-select">
                            <option disabled value="">Выберите участника</option>
                            <option v-for="participant in eventParticipants" :key="participant.id"
                                :value="participant.id">
                                {{ getParticipantDisplayName(participant) }}
                            </option>
                        </select>
                        <button @click="inviteSelectedUser" :disabled="!selectedParticipantId" class="invite-btn">
                            Пригласить
                        </button>
                    </div>
                    <p class="invite-hint">Выберите участника мероприятия, которого хотите пригласить в команду</p>
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
                        <button v-if="selectedTeam?.id === team.id" class="delete-btn"
                            @click.stop="confirmDeleteTeam(team)"
                            title="Удалить эту команду без возможности восстановления.">
                            Удалить
                        </button>
                    </div>
                </div>
                <button class="submit-btn" @click="resetForm" title="Очистить форму и начать создание новой команды.">
                    Создать новую команду
                </button>
            </div>

            <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import NavBar from '@/components/nav_bar.vue'
import api from '@/utils/axios'

const route = useRoute()
const toast = useToast()

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
const customFields = ref([])
const customFieldValues = ref({})
const fieldErrors = ref({})
const loading = ref(false)
const eventSearchQuery = ref('')
const showEventDropdown = ref(false)
const filteredEvents = ref([])
const isSearching = ref(false)

const getParticipantDisplayName = (participant) => {
    const user = participant.user || {}
    const nickname = user.nickname || user.name || 'Без имени'
    const email = user.email || 'без email'
    return `${nickname} (${email})`
}

const getEventGroupingInfo = (eventId) => {
    const event = availableEvents.value.find(ev => ev.id === eventId)
    if (!event) return ''

    // Используем qrCode, если есть, иначе fallback на grouping
    const groupingType = event.qrCode || event.grouping || 'both'

    let info = ''
    switch (groupingType) {
        case 'group':
            info = '📋 Это мероприятие поддерживает только командную регистрацию'
            break
        case 'both':
            info = '📋 Это мероприятие поддерживает как командную, так и индивидуальную регистрацию'
            break
        case 'solo':
            info = '📋 Это мероприятие поддерживает только индивидуальную регистрацию'
            break
        default:
            return ''
    }

    // Убираем информацию о правах пользователя - все могут создавать команды
    info += ' ✅ Вы можете создавать команды для этого мероприятия'

    return info
}

const isEventSupportsTeams = (eventId) => {
    const event = availableEvents.value.find(ev => ev.id === eventId)
    if (!event) return false

    // Используем qrCode, если есть, иначе fallback на grouping
    const groupingType = event.qrCode || event.grouping || 'both'
    return groupingType === 'group' || groupingType === 'both'
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
    console.log('[DEBUG] loadAvailableEvents: userId из токена:', userId)
    console.log('[DEBUG] loadAvailableEvents: document.cookie:', document.cookie)
    console.log('[DEBUG] loadAvailableEvents: window.location.href:', window.location.href)
    if (!userId) return

    try {
        // Загружаем все мероприятия (убираем ограничение по участникам/создателям)
        const allEventsRes = await api.get('/events')
        const allEvents = allEventsRes.data || []

        // Фильтруем мероприятия, которые поддерживают команды (qrCode === 'group' или 'both')
        const teamEvents = allEvents.filter(event =>
            (event.qrCode === 'group' || event.qrCode === 'both') ||
            (event.grouping === 'group' || event.grouping === 'both') // Fallback для совместимости
        )

        // Убираем дубликаты по ID
        const uniqueEvents = teamEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        )

        availableEvents.value = uniqueEvents
        console.log('🎯 Доступные мероприятия для команд:', availableEvents.value)

        // Проверяем eventId из URL после загрузки мероприятий
        const eventIdFromUrl = route.query.eventId
        if (eventIdFromUrl && availableEvents.value.length > 0) {
            const eventExists = availableEvents.value.find(ev => ev.id === eventIdFromUrl)
            if (eventExists) {
                selectedEventId.value = eventIdFromUrl
                eventSearchQuery.value = eventExists.eventName
                console.log('🎯 Автоматически выбрано мероприятие из URL:', eventIdFromUrl)
            } else {
                console.log('⚠️ Мероприятие из URL не найдено в доступных:', eventIdFromUrl)
                await loadEventById(eventIdFromUrl)
            }
        } else if (eventIdFromUrl) {
            await loadEventById(eventIdFromUrl)
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки мероприятий:', error)
        availableEvents.value = []
    }
}

const loadCustomFields = async (eventId) => {
    if (!eventId) return
    try {
        const res = await api.get(`/responses/custom-fields/team/${eventId}`)
        console.log('📝 Ответ от сервера кастомных полей команды:', res.data)

        // Проверяем структуру ответа
        if (res.data && Array.isArray(res.data.fields)) {
            customFields.value = res.data.fields
        } else if (res.data && Array.isArray(res.data)) {
            customFields.value = res.data
        } else {
            customFields.value = []
        }

        // Инициализируем значения полей
        customFields.value.forEach(field => {
            // Инициализируем только если значение еще не установлено
            if (customFieldValues.value[field.name] === undefined) {
                customFieldValues.value[field.name] = ''
            }
        })
        console.log('📝 Кастомные поля команды:', customFields.value)
    } catch (e) {
        console.error('Ошибка загрузки кастомных полей команды:', e)
        customFields.value = []
        // Не показываем ошибку, если полей просто нет
        if (e.response?.status !== 404) {
            console.warn('Предупреждение: не удалось загрузить кастомные поля команды')
        }
    }
}

const validateField = (field) => {
    const value = customFieldValues.value[field.name]

    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.value[field.name] = 'Это поле обязательно'
        return false
    } else if (field.type === 'number' && value && isNaN(Number(value))) {
        fieldErrors.value[field.name] = 'Введите число'
        return false
    } else {
        fieldErrors.value[field.name] = ''
        return true
    }
}

const isFormValid = computed(() => {
    if (!team.value.name || !team.value.name.trim()) return false
    if (!selectedEventId.value) return false

    // Проверяем, что выбранное мероприятие поддерживает команды
    const selectedEvent = availableEvents.value.find(ev => ev.id === selectedEventId.value)
    if (!selectedEvent) return false

    // Используем qrCode, если есть, иначе fallback на grouping
    const groupingType = selectedEvent.qrCode || selectedEvent.grouping || 'both'
    if (groupingType !== 'group' && groupingType !== 'both') {
        return false
    }

    // Проверяем все обязательные кастомные поля
    const requiredFields = customFields.value.filter(field => field.required)
    const hasErrors = Object.values(fieldErrors.value).some(error => error)

    const allRequiredFilled = requiredFields.every(field => {
        const value = customFieldValues.value[field.name]
        if (value === null || value === undefined) return false
        if (typeof value === 'string') {
            return value.trim() !== ''
        }
        // Для чисел и других типов считаем заполненным, если значение есть
        return value !== ''
    })

    return !hasErrors && allRequiredFilled
})



const teamEventName = computed(() => {
    if (!selectedTeam.value || !selectedTeam.value.event_id) return ''
    const event = availableEvents.value.find(ev => ev.id === selectedTeam.value.event_id)
    return event ? event.eventName : ''
})




const loadUserTeams = async () => {
    const userId = getUserIdFromToken()
    console.log('[DEBUG] loadUserTeams: userId из токена:', userId)
    console.log('[DEBUG] loadUserTeams: document.cookie:', document.cookie)

    if (!userId) return
    try {
        const asParticipant = await api.get(`/teams/user/${userId}`)
        const participantTeams = Array.isArray(asParticipant.data)
            ? asParticipant.data
            : (asParticipant.data === null ? [] : [asParticipant.data])


        console.log('[DEBUG] loadUserTeams: GET /teams/user/' + userId + ' response:', asParticipant)
        const eventsCreated = await api.get(`/events/creator/${userId}`)

        const eventsData = eventsCreated.data || []
        const teamPromises = eventsData.map(ev =>
            api.get(`/teams/${ev.id}`).then(res => res.data.teams || [])
        )
        const teamsByEvents = await Promise.all(teamPromises)
        const asLeader = teamsByEvents.flat()
        const combined = [...participantTeams, ...asLeader]
        const map = new Map()
        for (const team of combined) {
            map.set(team.id, team)
        }
        userTeams.value = Array.from(map.values())
        console.log('✅ Загрузка команд завершена:', userTeams.value)
    } catch (err) {
        console.error('[DEBUG] loadUserTeams: Ошибка:', err)
        userTeams.value = []
    }
}


const selectTeam = async (teamItem) => {

    console.log('📌 selectTeam:', teamItem)
    selectedTeam.value = teamItem
    selectedEventId.value = teamItem.event_id
    const resMembers = await api.get(`/teams/${teamItem.id}/members`)
    team.value = { ...teamItem, members: resMembers.data?.members || [] }

    // Загружаем изображение команды, если есть
    try {
        const imageRes = await api.get(`/storage/avatar/TEAM/${teamItem.id}`)
        if (imageRes.data && imageRes.data.s3_url) {
            imagePreview.value = imageRes.data.s3_url
        }
    } catch (imageErr) {
        console.log('ℹ️ У команды нет изображения или ошибка загрузки:', imageErr)
        imagePreview.value = null
    }

    // Загружаем кастомные поля команды
    try {
        const eventId = teamItem.event_id || selectedEventId.value

        if (!eventId) {
            console.warn('⚠️ Невозможно загрузить кастомные поля: eventId отсутствует')
            return
        }
        const customFieldsRes = await api.get(`/responses/team/${eventId}/${teamItem.id}`)
        console.log('📝 Существующие кастомные поля команды:', customFieldsRes.data)
        if (customFieldsRes.data && customFieldsRes.data.responses) {
            Object.keys(customFieldsRes.data.responses).forEach(key => {
                const value = customFieldsRes.data.responses[key]
                // Преобразуем значение в строку для input полей
                customFieldValues.value[key] = value !== null && value !== undefined ? String(value) : ''
            })
        }
    } catch (customFieldsErr) {
        console.log('ℹ️ У команды нет кастомных полей или ошибка загрузки:', customFieldsErr)
    }

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

const submitTeam = async () => {
    const userId = getUserIdFromToken()
    console.log('[DEBUG] submitTeam: userId из токена:', userId)
    console.log('[DEBUG] submitTeam: document.cookie:', document.cookie)
    console.log('[DEBUG] submitTeam: window.location.href:', window.location.href)
    if (api && api.defaults && api.defaults.baseURL) {
        console.log('[DEBUG] submitTeam: axios baseURL:', api.defaults.baseURL)
    }
    if (!userId) return alert('Не авторизован')
    if (!team.value.name) return alert('Введите название команды')
    if (!selectedEventId.value) return alert('Выберите мероприятие')

    // Валидируем все кастомные поля
    let isValid = true
    customFields.value.forEach(field => {
        if (!validateField(field)) {
            isValid = false
        }
    })

    if (!isValid) {
        alert('Пожалуйста, исправьте ошибки в форме')
        return
    }

    loading.value = true

    try {
        // 1. Создаём команду без image
        const res = await api.post('/teams', {
            event_id: selectedEventId.value,
            name: team.value.name,
            leader_id: userId,
            type: 'FIXED'
        })
        console.log('[DEBUG] submitTeam: response от POST /teams:', res)
        const createdId = res.data.team_id
        let imageUrl = ''

        // 2. Если есть картинка — загружаем её с entity_id = team_id
        if (imageFile.value) {
            const formData = new FormData()
            formData.append('file', imageFile.value)
            formData.append('uploaded_by', userId)
            formData.append('entity_type', 'TEAM')
            formData.append('entity_id', createdId)
            try {
                const uploadRes = await api.post('/storage/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (uploadRes.data && uploadRes.data.s3_url) {
                    imageUrl = uploadRes.data.s3_url
                    // 3. PATCH /teams/{team_id} с image
                    await api.patch(`/teams/${createdId}/update`, { image: imageUrl })
                }
            } catch (imageErr) {
                console.error('❌ Ошибка загрузки изображения:', imageErr)
                // Не прерываем создание команды из-за ошибки загрузки изображения
            }
        }

        // 4. Отправляем кастомные поля команды
        if (customFields.value.length > 0) {
            const filledFields = {}
            Object.keys(customFieldValues.value).forEach(key => {
                const value = customFieldValues.value[key]
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'string') {
                        if (value.trim() !== '') {
                            filledFields[key] = value
                        }
                    } else {
                        filledFields[key] = value
                    }
                }
            })

            if (Object.keys(filledFields).length > 0) {
                try {
                    console.log('📝 Отправка кастомных полей команды:', filledFields)
                    await api.post('/responses/team/submit', {
                        event_id: selectedEventId.value,
                        team_id: createdId,
                        responses: filledFields
                    })
                    console.log('✅ Кастомные поля команды отправлены')
                } catch (customFieldsErr) {
                    console.error('❌ Ошибка отправки кастомных полей:', customFieldsErr)
                }
            }
        }

        // 5. Регистрируем лидера как участника
        try {
            const checkRegistration = await api.get(`/participants/check/${userId}/${selectedEventId.value}`)
            const isAlreadyRegistered = checkRegistration.data && checkRegistration.data.isRegistered === true

            if (!isAlreadyRegistered) {
                console.log('📝 Регистрация лидера как участника...')
                await api.post('/participants/register', {
                    userId: userId,
                    eventId: selectedEventId.value,
                    teamId: createdId
                })
                console.log('✅ Лидер зарегистрирован как участник')
            } else {
                console.log('ℹ️ Лидер уже зарегистрирован на мероприятие')
                try {
                    const participantInfo = await api.get(`/participants/${userId}/${selectedEventId.value}/info`)
                    if (participantInfo.data && participantInfo.data.id) {
                        await api.patch(`/participants/${participantInfo.data.id}`, {
                            teamId: createdId
                        })
                        console.log('✅ Команда обновлена для существующего участника')
                    }
                } catch (updateErr) {
                    console.error('❌ Ошибка обновления команды участника:', updateErr)
                }
            }
        } catch (checkErr) {
            if (checkErr.response?.status === 409) {
                console.log('ℹ️ Участник уже зарегистрирован')
            } else {
                console.error('❌ Ошибка при регистрации участника:', checkErr)
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // подождать 1 секунду (чтобы team-service успел сохранить команду)
        await loadUserTeams()

        let newTeam = userTeams.value.find(t => t.id === createdId)

        if (!newTeam) {
            console.warn('⚠️ Команда не найдена в userTeams. Добавляем вручную.')
            newTeam = {
                id: createdId,
                name: team.value.name,
                event_id: selectedEventId.value,
                leader_id: userId,
                type: 'FIXED',
                members: [] // или добавь сюда себя, если хочешь отразить участника
            }
            userTeams.value.unshift(newTeam)
        }


        await selectTeam(newTeam)
        toast.success('Команда успешно создана! Теперь вы можете приглашать участников.')

    } catch (e) {
        console.error('[DEBUG] submitTeam: Ошибка:', e)
        if (e.response?.status === 409) {
            alert('Команда с таким названием уже существует')
        } else {
            alert('Ошибка при создании команды')
        }
    } finally {
        loading.value = false
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

const confirmDeleteTeam = async (teamToDelete) => {
    if (confirm(`Вы уверены, что хотите удалить команду "${teamToDelete.name}"? Это действие нельзя отменить.`)) {
        try {
            await api.delete(`/teams/${teamToDelete.id}`)
            toast.success('Команда успешно удалена')

            // Если удаляемая команда была выбрана, сбрасываем форму
            if (selectedTeam.value?.id === teamToDelete.id) {
                resetForm()
            }

            // Перезагружаем список команд
            await loadUserTeams()
        } catch (error) {
            console.error('❌ Ошибка при удалении команды:', error)
            toast.error('Ошибка при удалении команды')
        }
    }
}

const inviteSelectedUser = async () => {
    if (!selectedParticipantId.value || !team.value.id || !selectedEventId.value) return

    try {
        console.log('📨 Отправка инвайта участнику:', selectedParticipantId.value)
        await api.post(`/teams/${team.value.id}/invites`, {
            participant_id: selectedParticipantId.value,
            event_id: selectedEventId.value
        })
        selectedParticipantId.value = ''
        await selectTeam(team.value)
    } catch (err) {
        console.error('❌ Ошибка при приглашении участника:', err)
        alert('Ошибка при приглашении участника')
    }
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
    customFields.value = []
    customFieldValues.value = {}
    fieldErrors.value = {}
    isTeamCreated.value = false

    // Очищаем input файла
    const fileInput = document.getElementById('imageInput')
    if (fileInput) {
        fileInput.value = ''
    }
}

// Функция для перехода на страницу команд с выбранным мероприятием
const goToTeamPageWithEvent = (eventId) => {
    if (eventId) {
        window.location.href = `/team?eventId=${eventId}`
    } else {
        window.location.href = '/team'
    }
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
        // Загружаем участников мероприятия
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
        console.log('👥 Участники мероприятия:', detailed)

        // Загружаем кастомные поля команды для выбранного мероприятия
        await loadCustomFields(newVal)
    } catch (e) {
        console.error('Ошибка загрузки участников:', e)
    }
})

onMounted(async () => {
    const userId = getUserIdFromToken()
    console.log('[DEBUG] onMounted: userId из токена:', userId)
    console.log('[DEBUG] onMounted: document.cookie:', document.cookie)
    console.log('[DEBUG] onMounted: window.location.href:', window.location.href)
    if (api && api.defaults && api.defaults.baseURL) {
        console.log('[DEBUG] onMounted: axios baseURL:', api.defaults.baseURL)
    }
    await loadUserTeams()
    await loadAvailableEvents()

    // Проверяем, есть ли eventId в URL параметрах
    const eventIdFromUrl = route.query.eventId
    if (eventIdFromUrl && availableEvents.value.length > 0) {
        const eventExists = availableEvents.value.find(ev => ev.id === eventIdFromUrl)
        if (eventExists) {
            selectedEventId.value = eventIdFromUrl
            eventSearchQuery.value = eventExists.eventName
            console.log('🎯 Автоматически выбрано мероприятие из URL:', eventIdFromUrl)
        } else {
            console.log('⚠️ Мероприятие из URL не найдено в доступных:', eventIdFromUrl)
            await loadEventById(eventIdFromUrl)
        }
    } else if (eventIdFromUrl) {
        // Если есть eventId в URL, но список мероприятий еще не загружен
        await loadEventById(eventIdFromUrl)
    }

    // Добавляем обработчик клика вне выпадающего списка
    document.addEventListener('click', handleClickOutside)

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isSidebarOpen.value) {
            isSidebarOpen.value = false
            document.body.style.overflow = ''
        }
    })
})

onUnmounted(() => {
    // Очищаем обработчик клика при размонтировании компонента
    document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
    const searchContainer = document.querySelector('.event-search-container')
    if (searchContainer && !searchContainer.contains(event.target)) {
        showEventDropdown.value = false
    }
}

const searchEvents = async () => {
    const query = eventSearchQuery.value.trim()
    if (!query) {
        filteredEvents.value = []
        return
    }

    isSearching.value = true

    try {
        // Проверяем, является ли введенный текст ссылкой
        const eventIdFromUrl = extractEventIdFromUrl(query)
        if (eventIdFromUrl) {
            // Если это ссылка, пытаемся найти мероприятие по ID
            try {
                const eventRes = await api.get(`/event/${eventIdFromUrl}`)
                const event = eventRes.data

                // Проверяем, поддерживает ли мероприятие команды
                if (event.qrCode === 'group' || event.qrCode === 'both' ||
                    event.grouping === 'group' || event.grouping === 'both') {
                    // Убираем проверку доступа - все пользователи имеют доступ
                    filteredEvents.value = [event]
                    console.log('✅ Мероприятие найдено по ссылке:', event)
                } else {
                    filteredEvents.value = []
                    console.log('⚠️ Мероприятие не поддерживает команды')
                }
            } catch (eventErr) {
                console.log('⚠️ Мероприятие по ссылке не найдено')
                // Если мероприятие не найдено, выполняем обычный поиск
                await performTextSearch(query)
            }
        } else {
            // Обычный текстовый поиск
            await performTextSearch(query)
        }
    } catch (e) {
        console.error('❌ Ошибка поиска мероприятий:', e)
        filteredEvents.value = []
    } finally {
        isSearching.value = false
    }
}

const extractEventIdFromUrl = (url) => {
    // Поддерживаемые форматы ссылок:
    // https://event-hub.space/event/123
    // http://localhost:5173/event/123
    // /event/123

    const patterns = [
        /event-hub\.space\/event\/(\d+)/,
        /localhost:\d+\/event\/(\d+)/,
        /\/event\/(\d+)/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            return match[1]
        }
    }

    return null
}

const checkEventAccess = async (eventId, userId) => {
    // Убираем ограничение доступа - все пользователи имеют доступ ко всем мероприятиям
    return true

    // Старая логика проверки доступа (закомментирована):
    /*
    try {
        // Проверяем, является ли пользователь участником
        const participantRes = await api.get(`/participants/check/${userId}/${eventId}`)
        if (participantRes.data && participantRes.data.isRegistered) {
            return true
        }

        // Проверяем, является ли пользователь создателем
        const eventRes = await api.get(`/event/${eventId}`)
        if (eventRes.data && eventRes.data.creatorId === userId) {
            return true
        }

        return false
    } catch (e) {
        console.error('Ошибка проверки доступа к мероприятию:', e)
        return false
    }
    */
}

const performTextSearch = async (query) => {
    try {
        const res = await api.get(`/events/search?name=${encodeURIComponent(query)}`)
        const searchResults = res.data || []

        // Фильтруем только мероприятия, которые поддерживают команды
        const teamEvents = searchResults.filter(event =>
            (event.qrCode === 'group' || event.qrCode === 'both') ||
            (event.grouping === 'group' || event.grouping === 'both') // Fallback для совместимости
        )

        filteredEvents.value = teamEvents
        console.log('🔍 Результаты поиска:', teamEvents)
    } catch (e) {
        console.error('Ошибка текстового поиска:', e)
        filteredEvents.value = []
    }
}

const clearEventSearch = () => {
    eventSearchQuery.value = ''
    showEventDropdown.value = false
}

const searchAllEvents = async () => {
    await loadAvailableEvents()
    showEventSearchDropdown.value = false
}

const selectEventFromSearch = (event) => {
    selectedEventId.value = event.id
    showEventDropdown.value = false
}

const formatEventDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(date).toLocaleDateString(undefined, options)
}

const getEventTypeClass = (event) => {
    // Используем qrCode, если есть, иначе fallback на grouping
    const groupingType = event.qrCode || event.grouping || 'both'
    switch (groupingType) {
        case 'group':
            return 'group-event'
        case 'both':
            return 'both-event'
        case 'solo':
            return 'solo-event'
        default:
            return ''
    }
}

const getEventTypeText = (event) => {
    // Используем qrCode, если есть, иначе fallback на grouping
    const groupingType = event.qrCode || event.grouping || 'both'
    switch (groupingType) {
        case 'group':
            return 'Командное'
        case 'both':
            return 'Командное и Индивидуальное'
        case 'solo':
            return 'Индивидуальное'
        default:
            return 'Неизвестный тип'
    }
}

const loadEventById = async (eventId) => {
    try {
        console.log('🔍 Загрузка мероприятия по ID:', eventId)
        const eventRes = await api.get(`/event/${eventId}`)
        const event = eventRes.data

        // Проверяем, поддерживает ли мероприятие команды
        if (event.qrCode === 'group' || event.qrCode === 'both' ||
            event.grouping === 'group' || event.grouping === 'both') {

            // Убираем проверку доступа - все пользователи имеют доступ
            // Добавляем мероприятие в список доступных, если его там нет
            const existingEvent = availableEvents.value.find(ev => ev.id === eventId)
            if (!existingEvent) {
                availableEvents.value.push(event)
            }

            selectedEventId.value = eventId
            eventSearchQuery.value = event.eventName
            console.log('✅ Мероприятие загружено и выбрано:', event.eventName)
        } else {
            console.log('⚠️ Мероприятие не поддерживает команды:', eventId)
            toast.error('Это мероприятие не поддерживает командную регистрацию')
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки мероприятия по ID:', e)
        toast.error('Мероприятие не найдено')
    }
}
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
    min-width: 800px;
}

.team-form {
    background: #444;
    border-radius: 10px 0 10px 10px;
    padding: 2rem;
    flex: 2;
    animation: slideInLeft 0.6s ease-out;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
}

.header {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    align-items: center;
}


.team-event-name {
    margin-top: -1rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: #ccc;
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
    padding: 0.6rem 1.2rem;
    border: none;
    font-size: larger;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 300px;
}

.create:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.create:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
}

.create:disabled:hover {
    transform: none;
    box-shadow: none;
}

.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.custom-fields-form {
    background: #333;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #555;
    margin-top: 0.5rem;
}

.custom-field {
    margin-bottom: 1rem;
}

.custom-field:last-child {
    margin-bottom: 0;
}

.custom-field label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
}

.custom-field input {
    width: 100%;
    padding: 0.8rem;
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
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.custom-field input.error {
    border-color: #ef4444;
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
    display: block;
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.upcoming-event p {
    margin: 0;
    font-weight: 500;
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
        min-width: unset;
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
        font-size: 1.2rem;
        font-weight: 600;
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

    .invite-section {
        flex-direction: column;
        gap: 0.8rem;
    }

    .invite-btn {
        width: 100%;
        margin-left: 0;
        padding: 1rem;
    }

    .search-select {
        width: 100%;
    }

    .custom-fields-form {
        padding: 0.8rem;
    }

    .custom-field input {
        padding: 0.8rem;
        font-size: 1rem;
    }

    .auto-selected-notice {
        font-size: 0.8rem;
        margin: 0.3rem 0 0 0;
    }

    .event-type-info,
    .event-warning {
        font-size: 0.75rem;
        padding: 0.4rem;
        margin: 0.3rem 0 0 0;
    }

    .event-search-input {
        padding: 0.8rem 2rem 0.8rem 0.8rem;
        font-size: 1rem;
    }

    .event-dropdown {
        max-height: 250px;
    }

    .event-option {
        padding: 0.8rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .event-status {
        align-items: flex-start;
        width: 100%;
    }

    .event-info h4 {
        font-size: 0.9rem;
    }

    .event-date {
        font-size: 0.75rem;
    }

    .event-type {
        font-size: 0.7rem;
    }

    .creator-badge,
    .participant-badge {
        font-size: 0.7rem;
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

.invite-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.8rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 1rem;
}

.invite-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #16a34a, #15803d);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.invite-btn:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.invite-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.invite-hint {
    font-size: 0.8rem;
    color: #888;
    margin: 0;
    font-style: italic;
}

.auto-selected-notice {
    font-size: 0.9rem;
    color: #22c55e;
    margin: 0.5rem 0 0 0;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.event-type-info {
    font-size: 0.85rem;
    color: #3b82f6;
    margin: 0.5rem 0 0 0;
    font-style: italic;
    background: rgba(59, 130, 246, 0.1);
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
}

.event-warning {
    font-size: 0.85rem;
    color: #f59e0b;
    margin: 0.5rem 0 0 0;
    font-weight: 500;
    background: rgba(245, 158, 11, 0.1);
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #f59e0b;
}

.search-select {
    flex: 1;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #555;
    background: #333;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-select:focus {
    border-color: #9333ea;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
    outline: none;
}

.event-search-container {
    position: relative;
    width: 100%;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.event-search-input {
    width: 100%;
    padding: 0.8rem 2.5rem 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid #555;
    background: #333;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.event-search-input:focus {
    border-color: #9333ea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.event-search-input.has-results {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.search-actions {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
}

.clear-search-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.clear-search-btn:hover {
    background: #555;
    color: white;
}

.search-loading {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
}

.search-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #555;
    border-top: 2px solid #9333ea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.event-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #333;
    border: 1px solid #555;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.no-results {
    padding: 1rem;
    text-align: center;
    color: #888;
}

.search-all-btn {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.search-all-btn:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
}

.event-option {
    padding: 1rem;
    border-bottom: 1px solid #555;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.event-option:hover {
    background: #444;
}

.event-option.selected {
    background: #9333ea;
    color: white;
}

.event-option:last-child {
    border-bottom: none;
}

.event-info h4 {
    margin: 0 0 0.3rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.event-date {
    margin: 0 0 0.3rem 0;
    font-size: 0.8rem;
    color: #888;
}

.event-type {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
}

.event-type.group-event {
    background: #dc2626;
    color: white;
}

.event-type.both-event {
    background: #22c55e;
    color: white;
}

.event-type.solo-event {
    background: #3b82f6;
    color: white;
}

.event-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
}

.creator-badge,
.participant-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
}

.creator-badge {
    background: #f59e0b;
    color: white;
}

.participant-badge {
    background: #22c55e;
    color: white;
}

/* Добавляем стили для кнопки удаления */
.delete-btn {
    background: #dc2626;
    color: white;
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    transition: all 0.3s ease;
}

.delete-btn:hover {
    background: #b91c1c;
    transform: translateY(-2px);
}
</style>