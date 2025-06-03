<template>
    <div>
        <NavBar />
        <div class="event-create-page">
            <!-- Добавляем шапку для бургер-меню -->
            <div class="burger-menu-wrapper">
                <button class="burger-menu" @click="toggleSidebar" :class="{ active: isSidebarOpen }">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <div class="main-section">
                <div class="event-form">
                    <div class="header">
                        <div class="image-upload">
                            <label for="imageInput">
                                <div class="image-preview"
                                    :style="{ backgroundImage: imagePreview ? `url(${imagePreview})` : '' }"
                                    title="Нажмите, чтобы загрузить изображение мероприятия (до 5MB, JPG, PNG, GIF, WebP)">
                                    <span v-if="!imagePreview">+</span>
                                </div>
                            </label>
                            <input id="imageInput" type="file" accept="image/*" @change="handleImageUpload" hidden />
                        </div>

                        <div class="heade-title">
                            <input class="event-title" v-model="event.title" placeholder="Название Мероприятия"
                                title="Введите краткое и понятное название мероприятия" />
                            <textarea class="event-description" v-model="event.description" placeholder="Описание"
                                title="Подробное описание мероприятия: что, где, когда, зачем" />
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Дата <span class="info-icon"
                                    title="Выберите дату проведения мероприятия. Не может быть в прошлом.">?</span></label>
                            <div class="time-item">
                                <span class="time-label">дата начала мероприятия</span>
                                <input type="date" v-model="event.date" :min="minDate" :max="maxDate"
                                    @input="validateDate" />
                                <p v-if="dateError" class="error-text">{{ dateError }}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Время <span class="info-icon"
                                    title="Укажите время начала и окончания мероприятия.">?</span></label>
                            <div class="time-fields">
                                <div class="time-item">
                                    <span class="time-label">Начало</span>
                                    <input type="time" v-model="event.time" />
                                </div>
                                <div class="time-item">
                                    <span class="time-label">Конец</span>
                                    <input type="time" v-model="event.endTime" />
                                </div>
                            </div>
                            <p v-if="timeError" class="error-text">Время окончания должно быть позже начала</p>
                        </div>
                        <div class="form-group">
                            <label>Макс кол-во участников <span class="info-icon"
                                    title="Укажите максимальное количество человек, которое может принять участие.">?</span></label>
                            <input type="number" v-model="event.maxParticipants"
                                title="Введите число, 0 - без ограничений" />
                        </div>
                        <div class="form-group location-wrapper">
                            <label>Место <span class="info-icon"
                                    title="Введите адрес или место проведения мероприятия. Для онлайн-мероприятий можно указать платформу.">?</span></label>
                            <input type="text" v-model="event.location" @input="handleAddressInput"
                                placeholder="Адрес..." title="Начните вводить адрес для подсказок" />
                            <ul v-if="suggestions.length" class="suggestions-list">
                                <li v-for="(s, i) in suggestions" :key="i" @click="selectSuggestion(s)">
                                    {{ s.value }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Формат мероприятия <span class="info-icon"
                                title="Выберите, будет мероприятие проходить оффлайн или онлайн.">?</span></label>
                        <div class="format-icons">
                            <div class="ww">
                                <div class="format-option" :class="{ active: event.format === 'offline' }"
                                    @click="event.format = 'offline'">
                                    <img src="@/assets/icons/offline.png" alt="Offline" />
                                </div>
                                <p>Оффлайн</p>
                            </div>
                            <div class="ww">
                                <div class="format-option" :class="{ active: event.format === 'online' }"
                                    @click="event.format = 'online'">
                                    <img src="@/assets/icons/online.png" alt="Online" />
                                </div>
                                <p>Онлайн</p>
                            </div>
                        </div>
                        <div v-if="selectedEventId" class="qr-section">
                            <h3>QR-код мероприятия</h3>
                            <qrcode-vue :value="`https://event-hub.space/event/${selectedEventId}`" :size="160"
                                :background="'#150A1E'" :foreground="'#BDAEFF'" :level="'H'" :margin="2"
                                :image-settings='imageSettings' ref="qrRef" class="custom-qr" />
                            <div class="qr-actions">
                                <button @click="downloadQR">Скачать QR</button>
                                <button @click="copyLink">Скопировать ссылку</button>
                            </div>
                        </div>
                    </div>

                    <div class="group-section">
                        <label>Объединение в группу <span class="info-icon"
                                title="Определите, будут ли участники регистрироваться индивидуально, в группах, или возможны оба варианта.">?</span></label>
                        <div class="group_or_solo">
                            <div>
                                <select v-model="event.grouping">
                                    <option>Группы и соло</option>
                                    <option>Только соло</option>
                                    <option>Только группы</option>
                                </select>
                            </div>

                            <div class="view-switch">
                                <template v-if="visibleFieldModes.includes('participant')">
                                    <input type="radio" id="participant-fields" value="participant"
                                        v-model="fieldMode" />
                                    <label for="participant-fields"><img src="@/assets/icons/user.png" /></label>
                                </template>
                                <template v-if="visibleFieldModes.includes('group')">
                                    <input type="radio" id="group-fields" value="group" v-model="fieldMode" />
                                    <label for="group-fields"><img src="@/assets/icons/stats.png" /></label>
                                </template>
                            </div>
                        </div>
                    </div>

                    <div class="dynamic-fields">
                        <h3>Собираемые Данные — {{ fieldMode === 'group' ? 'Группа' : 'Участник' }}</h3>
                        <p class="section-description">Добавьте поля для сбора дополнительной информации об участниках
                            или группах.</p>

                        <div class="field-templates">
                            <h4>Шаблоны полей</h4>
                            <div class="template-buttons">
                                <button v-for="(template, index) in fieldTemplates[fieldMode]" :key="index"
                                    @click="addFieldFromTemplate(template)" class="template-btn">
                                    {{ template.label }}
                                </button>
                            </div>
                        </div>

                        <div class="field-item" v-for="(field, index) in event.fields[fieldMode]" :key="index">
                            <div class="field-header">
                                <input v-model="field.label" placeholder="Название поля" />
                                <select v-model="field.type">
                                    <option value="text">Текст</option>
                                    <option value="number">Число</option>
                                    <option value="date">Дата</option>
                                    <option value="boolean">Да/Нет</option>
                                    <option value="select">Выбор</option>
                                </select>
                                <button @click="removeField(index)" class="remove-btn">×</button>
                            </div>

                            <div class="field-body">
                                <input v-if="field.type === 'select'" v-model="field.options"
                                    placeholder="Варианты через запятую" />
                                <input v-if="field.type === 'text'" disabled placeholder="Текст..." />
                                <input v-if="field.type === 'number'" disabled type="number" placeholder="123" />
                                <input v-if="field.type === 'date'" disabled type="date" />
                                <select v-if="field.type === 'boolean'" disabled>
                                    <option>Да</option>
                                    <option>Нет</option>
                                </select>
                            </div>

                            <div class="field-footer">
                                <input v-model="field.description" placeholder="Описание поля" />
                                <input v-model="field.hint" placeholder="Подсказка для заполнения" class="hint-input" />
                            </div>
                        </div>

                        <button class="add-field" @click="addField">Добавить поле</button>
                    </div>

                    <div class="create_event">
                        <button class="create" @click="submitEvent" :disabled="timeError">
                            {{ selectedEventId ? 'Обновить' : 'Создать' }}
                        </button>
                    </div>
                </div>

                <div class="event-sidebar" :class="{ 'mobile-open': isSidebarOpen }">
                    <div class="sidebar-header">
                        <h4>Мои мероприятия</h4>
                    </div>
                    <div class="event-sidebar-scroll">
                        <div class="upcoming-event" v-for="ev in upcomingEvents" :key="ev.id" @click="selectEvent(ev)"
                            :class="{ active: selectedEventId === ev.id }">
                            <p>{{ ev.eventName }}</p>
                            <p>Дата: {{ formatDate(ev.startDateAndTime) }}</p>
                            <button v-if="selectedEventId === ev.id" class="delete-btn" @click.stop="confirmDelete(ev)">
                                Удалить
                            </button>
                        </div>
                    </div>
                    <button class="submit-btn" @click="resetForm">Новое мероприятие</button>
                </div>

                <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import api from '@/utils/axios'
import NavBar from '@/components/nav_bar.vue'
import QrcodeVue from 'qrcode.vue'

const qrRef = ref(null)
const selectedEventId = ref(null)

const imageFile = ref(null)
const imagePreview = ref('')
const suggestions = ref([])
const fieldMode = ref('participant')

const upcomingEvents = ref([])

const imageSettings = ref({
    src: new URL('@/assets/logo.svg', import.meta.url).href,
    width: 30,
    height: 30,
    excavate: true
})

const event = ref({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    maxParticipants: '',
    location: '',
    grouping: 'Группы и соло',
    format: 'offline',
    fields: {
        participant: [],
        group: []
    }
})

const visibleFieldModes = computed(() => {
    if (event.value.grouping === 'Только соло') return ['participant']
    if (event.value.grouping === 'Только группы') return ['group']
    return ['participant', 'group']
})

const getUserIdFromToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
    if (!token) return null
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.sub || payload.userId
    } catch {
        return null
    }
}

const formatDate = str => new Date(str).toLocaleDateString()

const loadEvents = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return
    try {
        const res = await api.get(`/events/creator/${userId}`)
        upcomingEvents.value = res.data || []
    } catch (err) {
        console.error('Ошибка загрузки мероприятий', err)
    }
}

onMounted(loadEvents)

const isValidImageFormat = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type)
}

// Добавляем функцию для оптимизации изображения
const optimizeImage = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Максимальные размеры
                const MAX_WIDTH = 1200
                const MAX_HEIGHT = 1200

                // Изменяем размеры, сохраняя пропорции
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Конвертируем в WebP с качеством 0.8
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                        type: 'image/webp'
                    }))
                }, 'image/webp', 0.8)
            }
            img.onerror = reject
            img.src = e.target.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Модифицируем handleImageUpload
const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB')
        return
    }

    if (!isValidImageFormat(file)) {
        alert('Пожалуйста, загрузите изображение в формате JPG, PNG, GIF или WebP')
        return
    }

    try {
        // Показываем превью оригинального изображения
        const reader = new FileReader()
        reader.onload = () => {
            imagePreview.value = reader.result
        }
        reader.readAsDataURL(file)

        // Оптимизируем изображение
        imageFile.value = await optimizeImage(file)
    } catch (err) {
        console.error('Ошибка при обработке изображения:', err)
        alert('Ошибка при обработке изображения')
        imagePreview.value = ''
    }
}

const handleAddressInput = async () => {
    if (!event.value.location) return
    try {
        const res = await axios.post(
            'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
            { query: event.value.location },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Token b19db130def2050e565e36e7a7f6259dae6bb911'// сохранить в .env
                }
            }
        )
        suggestions.value = res.data.suggestions || []
    } catch (err) {
        console.error('Ошибка при получении подсказок', err)
    }
}

const selectSuggestion = suggestion => {
    event.value.location = suggestion.value
    suggestions.value = []
}

const addField = () => {
    event.value.fields[fieldMode.value].push({ label: '', type: 'text', options: '', description: '' })
}

const removeField = index => {
    event.value.fields[fieldMode.value].splice(index, 1)
}

const timeError = computed(() => {
    const start = event.value.time
    const end = event.value.endTime
    if (!start || !end) return false
    return end <= start
})

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

const uploadToS3 = async (eventId) => {
    if (!imageFile.value) return

    try {
        const token = await getValidToken()
        if (!token) {
            alert('Необходимо авторизоваться')
            window.location.href = '/login'
            return
        }

        if (!(imageFile.value instanceof File)) {
            throw new Error('Некорректный файл')
        }

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
            throw new Error('Некорректный ID события')
        }

        // Создаем FormData для загрузки файла
        const formData = new FormData()
        formData.append('file', imageFile.value)
        formData.append('uploaded_by', getUserIdFromToken())
        formData.append('entity_type', 'EVENT')
        formData.append('entity_id', eventId)

        console.log('FormData содержимое:')
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]))
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }

        console.log('Отправка запроса с заголовками:', headers)

        // Загружаем файл
        const res = await api.post('/storage/upload', formData, {
            headers,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                console.log(`Загрузка: ${percentCompleted}%`)
            },
            timeout: 30000
        })

        console.log('Ответ сервера:', res.data)

        if (!res.data?.s3_url) {
            console.error('Неверный формат ответа:', res.data)
            throw new Error('URL изображения не получен')
        }

        const s3Url = res.data.s3_url
        imagePreview.value = s3Url
        event.value.image = s3Url

        // Получаем информацию о загруженном файле
        const fileInfoRes = await api.get(`/storage/file-info/${res.data.file_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log('Информация о файле:', fileInfoRes.data)

        // Получаем текущие данные события
        const eventRes = await api.get(`/event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log('Текущие данные события:', eventRes.data)

        // Обновляем событие с новым URL изображения
        const updateRes = await api.patch(`/event/${eventId}`, {
            event: {
                ...eventRes.data,
                image: s3Url
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        console.log('Обновление события:', updateRes.data)
        return s3Url
    } catch (err) {
        console.error('Ошибка загрузки в S3:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers,
            config: {
                url: err.config?.url,
                method: err.config?.method,
                headers: err.config?.headers,
                data: err.config?.data instanceof FormData ? 'FormData' : err.config?.data
            }
        })

        if (err.response?.status === 401) {
            try {
                await refreshToken()
                return await uploadToS3(eventId)
            } catch (refreshErr) {
                alert('Сессия истекла. Перенаправление на страницу входа...')
                window.location.href = '/login'
                throw refreshErr
            }
        } else if (err.response?.status === 413) {
            alert('Файл слишком большой. Максимальный размер: 5MB')
        } else if (err.response?.status === 415) {
            alert('Неподдерживаемый формат файла. Пожалуйста, используйте JPG, PNG или GIF')
        } else if (err.response?.status === 500) {
            alert('Ошибка сервера при загрузке изображения. Пожалуйста, попробуйте загрузить изображение меньшего размера или в другом формате.')
        } else {
            alert('Ошибка при загрузке изображения. Пожалуйста, попробуйте еще раз или выберите другое изображение.')
        }
        throw err
    }
}

const minDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 1) // Максимум на год вперед
    return maxDate.toISOString().split('T')[0]
})

const dateError = ref('')

const validateDate = () => {
    const selectedDate = new Date(event.value.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
        dateError.value = 'Дата не может быть в прошлом'
        event.value.date = minDate.value
    } else if (selectedDate > new Date(maxDate.value)) {
        dateError.value = 'Дата не может быть позже чем через год'
        event.value.date = maxDate.value
    } else {
        dateError.value = ''
    }
}

const hasUnsavedChanges = ref(false)
const autosaveInterval = ref(null)

// Функция для сохранения черновика
const saveDraft = () => {
    if (!hasUnsavedChanges.value) return

    const draft = {
        event: event.value,
        imagePreview: imagePreview.value,
        fieldMode: fieldMode.value,
        timestamp: new Date().toISOString()
    }

    localStorage.setItem('eventDraft', JSON.stringify(draft))
    hasUnsavedChanges.value = false
}

// Функция для загрузки черновика
const loadDraft = () => {
    const draft = localStorage.getItem('eventDraft')
    if (!draft) return

    try {
        const { event: draftEvent, imagePreview: draftImage, fieldMode: draftMode, timestamp } = JSON.parse(draft)

        // Проверяем, не устарел ли черновик (старше 24 часов)
        const draftDate = new Date(timestamp)
        const now = new Date()
        if (now - draftDate > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('eventDraft')
            return
        }

        if (confirm('Найден черновик мероприятия. Хотите загрузить его?')) {
            event.value = draftEvent
            imagePreview.value = draftImage
            fieldMode.value = draftMode
            hasUnsavedChanges.value = true
        } else {
            localStorage.removeItem('eventDraft')
        }
    } catch (err) {
        console.error('Ошибка при загрузке черновика:', err)
        localStorage.removeItem('eventDraft')
    }
}

// Следим за изменениями в форме
watch([event, imagePreview, fieldMode], () => {
    hasUnsavedChanges.value = true
}, { deep: true })

// Автосохранение каждые 30 секунд
onMounted(() => {
    loadDraft()
    autosaveInterval.value = setInterval(saveDraft, 30000)
})

// Очистка при размонтировании
onBeforeUnmount(() => {
    if (autosaveInterval.value) {
        clearInterval(autosaveInterval.value)
    }
    saveDraft()
})

// Обработчик перед уходом со страницы
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges.value) {
        e.preventDefault()
        e.returnValue = ''
    }
})

// Модифицируем функцию resetForm
const resetForm = () => {
    if (hasUnsavedChanges.value) {
        if (!confirm('У вас есть несохраненные изменения. Вы уверены, что хотите сбросить форму?')) {
            return
        }
    }

    selectedEventId.value = null
    imageFile.value = null
    imagePreview.value = ''
    suggestions.value = []
    event.value = {
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        maxParticipants: '',
        location: '',
        grouping: 'Группы и соло',
        format: 'offline',
        fields: {
            participant: [],
            group: []
        }
    }
    fieldMode.value = 'participant'
    hasUnsavedChanges.value = false
    localStorage.removeItem('eventDraft')
}

// Модифицируем функцию submitEvent
const submitEvent = async () => {
    try {
        validateDate()
        if (dateError.value) {
            alert('Пожалуйста, выберите корректную дату')
            return
        }

        const token = await getValidToken()
        if (!token) {
            alert('Необходимо авторизоваться')
            window.location.href = '/login'
            return
        }

        const now = new Date().toISOString().slice(0, 19)

        // Создаем/обновляем событие
        const payload = {
            eventName: event.value.title,
            creatorId: getUserIdFromToken(),
            description: event.value.description || '',
            image: '',
            online: event.value.format === 'online',
            createDate: now,
            startDateAndTime: `${event.value.date}T${event.value.time}:00`,
            endDateAndTime: `${event.value.date}T${event.value.endTime}:00`,
            maxParticipantNumber: Number(event.value.maxParticipants) || 0,
            currentParticipantQuantity: 0,
            eventAddress: event.value.location,
            isRecurring: false,
            qrCode: 'string',
            grouping: event.value.grouping === 'Группы и соло' ? 'both' :
                event.value.grouping === 'Только соло' ? 'solo' : 'group'
        }

        console.log('Отправка события:', payload)

        let eventId
        if (selectedEventId.value) {
            const updateRes = await api.patch(`/event/${selectedEventId.value}`, { event: payload }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Обновление события:', updateRes.data)
            eventId = selectedEventId.value
        } else {
            const createRes = await api.post('/event', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Создание события:', createRes.data)
            eventId = createRes.data?.id
        }

        // После создания события загружаем изображение, если оно есть
        if (imageFile.value && eventId) {
            try {
                const imageUrl = await uploadToS3(eventId)
                if (imageUrl) {
                    // Обновляем событие с URL изображения
                    const updatePayload = {
                        ...payload,
                        image: imageUrl
                    }
                    await api.patch(`/event/${eventId}`, { event: updatePayload }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                }
            } catch (uploadErr) {
                console.error('Ошибка при загрузке изображения:', uploadErr)
                alert('Мероприятие создано, но возникла ошибка при загрузке изображения')
            }
        }

        // После создания события добавляем поля, если они есть
        if (eventId && (event.value.fields.participant.length > 0 || event.value.fields.group.length > 0)) {
            try {
                // Добавляем поля для участников
                if (event.value.fields.participant.length > 0) {
                    const participantFieldsPayload = {
                        event_id: eventId,
                        fields: event.value.fields.participant.map(f => ({
                            name: f.label,
                            type: f.type,
                            require: true
                        }))
                    }
                    console.log('Отправка полей участников:', participantFieldsPayload)
                    const participantRes = await api.post('/responses/custom-fields/participant', participantFieldsPayload, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    console.log('Ответ на создание полей участников:', participantRes.data)
                }

                // Добавляем поля для групп
                if (event.value.fields.group.length > 0) {
                    const teamFieldsPayload = {
                        event_id: eventId,
                        fields: event.value.fields.group.map(f => ({
                            name: f.label,
                            type: f.type,
                            require: true
                        }))
                    }
                    console.log('Отправка полей команд:', teamFieldsPayload)
                    const teamRes = await api.post('/responses/custom-fields/team', teamFieldsPayload, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    console.log('Ответ на создание полей команд:', teamRes.data)
                }
            } catch (fieldsErr) {
                console.error('Ошибка при добавлении полей:', {
                    error: fieldsErr,
                    response: fieldsErr.response?.data,
                    status: fieldsErr.response?.status,
                    headers: fieldsErr.response?.headers,
                    request: {
                        url: fieldsErr.config?.url,
                        method: fieldsErr.config?.method,
                        data: fieldsErr.config?.data
                    }
                })
                alert('Мероприятие создано, но возникла ошибка при добавлении полей')
            }
        }

        // После успешного сохранения
        hasUnsavedChanges.value = false
        localStorage.removeItem('eventDraft')

        alert(selectedEventId.value ? 'Мероприятие успешно обновлено!' : 'Мероприятие успешно создано!')
        await loadEvents()
        resetForm()
    } catch (err) {
        console.error('Ошибка при сохранении мероприятия:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers,
            request: {
                url: err.config?.url,
                method: err.config?.method,
                data: err.config?.data
            },
            payload: event.value
        })

        if (err.response?.status === 401) {
            try {
                await refreshToken()
                return await submitEvent()
            } catch (refreshErr) {
                alert('Сессия истекла. Перенаправление на страницу входа...')
                window.location.href = '/login'
                throw refreshErr
            }
        } else {
            alert('Ошибка при создании или обновлении мероприятия. Пожалуйста, проверьте все поля и попробуйте снова.')
        }
    }
}

const selectEvent = async (ev) => {
    if (selectedEventId.value === ev.id) return
    selectedEventId.value = ev.id
    try {
        const res = await api.get(`/event/${ev.id}`)
        const data = res.data
        const fields = {
            participant: [],
            group: []
        }

        for (const f of data.fields || []) {
            if (f.forTeam) {
                fields.group.push(f)
            } else {
                fields.participant.push(f)
            }
        }

        event.value = {
            title: data.eventName,
            description: data.description,
            date: data.startDateAndTime.split('T')[0],
            time: data.startDateAndTime.split('T')[1].slice(0, 5),
            endTime: data.endDateAndTime.split('T')[1].slice(0, 5),
            maxParticipants: data.maxParticipantNumber,
            location: data.eventAddress,
            grouping: data.grouping,
            format: data.online ? 'online' : 'offline',
            fields
        }

        imagePreview.value = data.image || ''
    } catch (err) {
        console.error('Ошибка загрузки события', err)
    }
}

const confirmDelete = async (event) => {
    if (!confirm(`Вы уверены, что хотите удалить мероприятие "${event.eventName}"?`)) {
        return
    }

    try {
        const token = await getValidToken()
        if (!token) {
            alert('Необходимо авторизоваться')
            window.location.href = '/login'
            return
        }

        await api.delete(`/event/${event.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        alert('Мероприятие успешно удалено!')
        await loadEvents()
        resetForm()
    } catch (err) {
        console.error('Ошибка при удалении мероприятия:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers,
            request: {
                url: err.config?.url,
                method: err.config?.method
            }
        })

        if (err.response?.status === 401) {
            try {
                await refreshToken()
                return await confirmDelete(event)
            } catch (refreshErr) {
                alert('Сессия истекла. Перенаправление на страницу входа...')
                window.location.href = '/login'
                throw refreshErr
            }
        } else {
            alert('Ошибка при удалении мероприятия. Пожалуйста, попробуйте снова.')
        }
    }
}

const downloadQR = () => {
    const canvas = document.querySelector('.qr-section canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'qr-code.png'
    link.click()
}

const copyLink = () => {
    const link = `https://event-hub.space/event/${selectedEventId.value}`
    navigator.clipboard.writeText(link).then(() => alert('Ссылка скопирована!'))
}

const fieldTemplates = {
    participant: [
        {
            label: 'Имя',
            type: 'text',
            description: 'Введите ваше полное имя',
            hint: 'Например: Иван Иванов'
        },
        {
            label: 'Email',
            type: 'text',
            description: 'Ваш email для связи',
            hint: 'Например: example@mail.com'
        },
        {
            label: 'Телефон',
            type: 'text',
            description: 'Контактный номер телефона',
            hint: 'Например: +7 (999) 123-45-67'
        },
        {
            label: 'Возраст',
            type: 'number',
            description: 'Ваш возраст',
            hint: 'Введите число от 18 до 100'
        }
    ],
    group: [
        {
            label: 'Название команды',
            type: 'text',
            description: 'Название вашей команды',
            hint: 'Например: Команда Победителей'
        },
        {
            label: 'Количество участников',
            type: 'number',
            description: 'Сколько человек в команде',
            hint: 'Введите число от 2 до 10'
        },
        {
            label: 'Уровень подготовки',
            type: 'select',
            options: 'Начинающий,Средний,Продвинутый',
            description: 'Общий уровень подготовки команды',
            hint: 'Выберите один из вариантов'
        }
    ]
}

const addFieldFromTemplate = (template) => {
    event.value.fields[fieldMode.value].push({ ...template })
}

// Добавляем состояние для бургер-меню
const isSidebarOpen = ref(false)

// Функция для переключения сайдбара
const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    // Блокируем скролл body когда сайдбар открыт
    document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

// Закрываем сайдбар при изменении размера окна
onMounted(() => {
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isSidebarOpen.value) {
            isSidebarOpen.value = false
            document.body.style.overflow = ''
        }
    })
})
</script>

<style scoped>
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
}

.group_or_solo {
    width: 30rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.view-switch {
    display: flex;
    background: #333;
    border-radius: 20px;
    overflow: hidden;
    width: auto;
    align-items: center;
    gap: 2px;
    margin-left: 2rem;
    transition: width 0.5s ease;
}

.view-switch input[type="radio"] {
    display: none;
}

.view-switch label {
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
}

.view-switch input[type="radio"]:checked+label {
    background: #150a1e;
}

.view-switch img {
    width: 32px;
    height: 32px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

.format-icons {
    justify-content: center;
    display: flex;
    gap: 3rem;
    margin-top: 0.5rem;
}

.format-option {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.format-option img {
    width: 30px;
    height: 30px;
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
}

.create_event {
    display: flex;
    justify-content: center;
}

.format-option.active {
    border-color: #9333ea;
    background: #555;
}

.ww {
    display: grid;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
}

.event-create-page {
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

.event-form {
    background: #444;
    border-radius: 10px 0 10px 10px;
    padding: 2rem;
    flex: 2;
    animation: slideInLeft 0.6s ease-out;
}

.group-section select {
    width: 12rem;
}

.side_name {
    text-align: center;
}

.suggestions-list {
    background: #333;
    list-style: none;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #555;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
    position: absolute;
    z-index: 10;
    width: 100%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.suggestions-list li {
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.suggestions-list li:hover {
    background: #444;
}

.location-wrapper {
    position: relative;
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
    padding: 1rem;
    text-align: center;
    font-weight: bold;
    font-size: 1.1rem;
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

.event-title,
.event-description {
    width: 100%;
    background: #333;
    border: 1px solid #777;
    color: white;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.event-title:focus,
.event-description:focus {
    border-color: #9333ea;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
    animation: fadeIn 1s ease-out;
}

.form-group {
    text-align: center;
    transition: transform 0.3s ease;
}

.form-group:hover {
    transform: translateY(-2px);
}

input,
select {
    width: 100%;
    padding: 0.4rem;
    border-radius: 6px;
    border: none;
    background: #333;
    color: white;
    transition: all 0.3s ease;
}

input:focus,
select:focus {
    border-color: #9333ea;
    box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.group-section {
    align-items: center;
    display: grid;
    justify-content: center;
    margin: 1rem 0;
    text-align: center;
}

.group-section label {
    font-size: larger;
    font-weight: bold;
    padding: 0.6rem;
}

.dynamic-fields {
    background: #333;
    border-radius: 10px;
    padding: 1rem;
    margin-top: 2rem;
}

.image-upload {
    margin-right: 1rem;
}

.header {
    display: flex;
    margin-bottom: 1.5rem;
    animation: fadeIn 0.8s ease-out;
}

.image-preview {
    width: 12rem;
    height: 12rem;
    background-color: #555;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 2rem;
    cursor: pointer;
    border: 2px dashed #888;
    transition: all 0.3s ease;
}

.image-preview:hover {
    transform: scale(1.02);
    border-color: #9333ea;
}

.heade-title {
    flex: 1;
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
    border-bottom: 1px solid #222;
}

.field-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
    flex-wrap: wrap;
    animation: fadeIn 0.5s ease-out;
    transition: all 0.3s ease;
}

.field-item:hover {
    transform: translateX(5px);
}

.field-item input,
.field-item select {
    flex: 1;
    min-width: 180px;
}

.field-item button {
    background: #a00;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.field-item button:hover {
    transform: scale(1.1);
    background: #c00;
}

.add-field,
.submit-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-field:hover,
.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.upcoming-event {
    background: #2a2a2a;
    padding: 1.2rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    border: 1px solid #333;
    position: relative;
    padding-bottom: 2.5rem;
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

.time-fields {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.time-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.time-label {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    color: #ccc;
}

.time-item.error .time-input {
    border: 1px solid #f87171;
    background-color: #3a1a1a;
}

.error-text {
    color: #ff4444;
    font-size: 0.8rem;
    margin-top: 0.3rem;
    text-align: center;
}

button.create:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.6;
}

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

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }

    to {
        transform: translateY(0);
    }
}

.view-mode-field {
    border: 1px solid #555 !important;
    background: #333 !important;
    cursor: default !important;
    color: #ccc !important;
}

.view-mode-field:focus {
    box-shadow: none !important;
    border-color: #555 !important;
}

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

.field-templates {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #2a2a2a;
    border-radius: 8px;
}

.field-templates h4 {
    margin: 0 0 0.8rem 0;
    color: #ccc;
}

.template-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.template-btn {
    background: #444;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.template-btn:hover {
    background: #555;
    transform: translateY(-2px);
}

.field-item {
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.field-header {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
}

.field-body {
    margin-bottom: 0.8rem;
}

.field-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.hint-input {
    font-size: 0.9rem;
    color: #999;
}

.remove-btn {
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-btn:hover {
    background: #b91c1c;
    transform: scale(1.1);
}

@media (max-width: 768px) {
    .event-create-page {
        padding: 0.5rem;
        margin-left: 0;
    }

    .main-section {
        flex-direction: column;
        position: relative;
        width: 100%;
        max-width: 100%;
    }

    .event-form {
        width: 100%;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-size: 16px;
        /* Базовый размер шрифта для лучшей читаемости */
    }

    .event-sidebar {
        width: 100%;
        max-width: none;
        position: fixed;
        right: -100%;
        top: 60px;
        bottom: 0;
        z-index: 999;
        transition: right 0.3s ease;
        border-radius: 0;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
        background: #222;
    }

    .event-sidebar.mobile-open {
        right: 0;
    }

    .sidebar-header {
        padding: 1.2rem;
        background: #222;
        border-bottom: 1px solid #444;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .sidebar-header h4 {
        font-size: 1.3rem;
        font-weight: 600;
        color: #fff;
        margin: 0;
        text-align: center;
    }

    .event-sidebar-scroll {
        padding: 1rem;
        height: calc(100vh - 120px);
        /* Учитываем высоту шапки и заголовка сайдбара */
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .upcoming-event {
        padding: 1.2rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        background: #2a2a2a;
        border: 1px solid #444;
        transition: all 0.3s ease;
    }

    .upcoming-event p {
        margin: 0.5rem 0;
        font-size: 1.1rem;
        line-height: 1.4;
    }

    .upcoming-event p:first-child {
        font-weight: 600;
        font-size: 1.2rem;
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

    .form-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .header {
        flex-direction: column;
        align-items: center;
    }

    .image-upload {
        margin-right: 0;
        margin-bottom: 1.5rem;
        width: 100%;
    }

    .image-preview {
        width: 100%;
        height: 200px;
        margin: 0 auto;
    }

    .heade-title {
        width: 100%;
    }

    .event-title {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.4;
        padding: 0.8rem;
    }

    .event-description {
        font-size: 1rem;
        line-height: 1.5;
        min-height: 120px;
        padding: 0.8rem;
    }

    .format-icons {
        flex-direction: row;
        gap: 2rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .group_or_solo {
        flex-direction: column;
        width: 100%;
        align-items: center;
    }

    .view-switch {
        margin: 1rem 0;
        width: 100%;
        justify-content: center;
    }

    .field-header {
        flex-direction: column;
        gap: 0.8rem;
    }

    .field-body {
        flex-direction: column;
        gap: 0.8rem;
    }

    .field-footer {
        flex-direction: column;
        gap: 0.8rem;
    }

    .template-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.8rem;
    }

    .template-btn {
        width: 100%;
        text-align: center;
        padding: 0.8rem;
        font-size: 1rem;
        font-weight: 500;
    }

    .time-fields {
        flex-direction: column;
        gap: 1rem;
    }

    .time-item {
        width: 100%;
    }

    .time-item input {
        font-size: 1rem;
        padding: 0.8rem;
    }

    .suggestions-list {
        width: 100%;
        max-height: 150px;
    }

    .section-description {
        text-align: left;
        margin-bottom: 1rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #ddd;
    }

    .create_event {
        position: sticky;
        bottom: 0;
        background: #444;
        padding: 1rem;
        margin: 0 -1rem -1rem -1rem;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2);
    }

    .create {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .field-item {
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #444;
        background: #2a2a2a;
    }

    .field-item input,
    .field-item select {
        font-size: 1rem;
        padding: 0.8rem;
        background: #333;
        border: 1px solid #444;
        border-radius: 6px;
    }

    .field-item input:focus,
    .field-item select:focus {
        border-color: #9333ea;
        box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
    }

    .remove-btn {
        width: 36px;
        height: 36px;
        font-size: 1.2rem;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .remove-btn:active {
        transform: scale(0.95);
        background: #b91c1c;
    }

    .qr-section {
        margin: 1rem -1rem -1rem -1rem;
        border-radius: 0 0 10px 10px;
        padding: 1.5rem;
    }

    .qr-actions {
        flex-direction: column;
        gap: 0.8rem;
    }

    .qr-actions button {
        width: 100%;
        padding: 1rem;
        font-size: 1rem;
        font-weight: 500;
    }
}

/* Улучшенные стили для бургер-меню */
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

@media (max-width: 768px) {
    .burger-menu {
        display: flex;
    }

    .burger-menu-wrapper {
        display: block;
    }

    .event-create-page {
        padding-top: 76px;
        /* Добавляем отступ для шапки */
    }

    .event-form {
        margin-top: 0;
    }
}

/* Обновляем стили для сайдбара */
.event-sidebar {
    top: 60px;
    /* Учитываем высоту шапки */
}

.sidebar-overlay {
    top: 60px;
    /* Учитываем высоту шапки */
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
</style>