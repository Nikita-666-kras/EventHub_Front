<template>
    <div>
        <NavBar />
        <div class="event-create-page">
            <div class="main-section">
                <div class="event-form">
                    <div class="header">
                        <div class="image-upload">
                            <label for="imageInput">
                                <div class="image-preview"
                                    :style="{ backgroundImage: imagePreview ? `url(${imagePreview})` : '' }">
                                    <span v-if="!imagePreview">+</span>
                                </div>
                            </label>
                            <input id="imageInput" type="file" accept="image/*" @change="handleImageUpload" hidden />
                        </div>

                        <div class="heade-title">
                            <input class="event-title" v-if="isEditing" v-model="editedEvent.title"
                                placeholder="Название Мероприятия" />
                            <input class="event-title" v-else :value="event.title" readonly
                                placeholder="Название Мероприятия" />
                            <textarea class="event-description" v-if="isEditing" v-model="editedEvent.description"
                                placeholder="Описание" />
                            <textarea class="event-description" v-else :value="event.description" readonly
                                placeholder="Описание" />
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Дата</label>
                            <div class="time-item">
                                <span class="time-label"> дата начала мероприятия</span>
                                <input type="date" v-if="isEditing" v-model="editedEvent.date" id="imp_date" />
                                <input type="date" v-else :value="event.date" readonly id="imp_date" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Время</label>
                            <div class="time-fields">
                                <div class="time-item">
                                    <span class="time-label">Начало</span>
                                    <input type="time" v-if="isEditing" v-model="editedEvent.time" />
                                    <input type="time" v-else :value="event.time" readonly />
                                </div>
                                <div class="time-item">
                                    <span class="time-label">Конец</span>
                                    <input type="time" v-if="isEditing" v-model="editedEvent.endTime" />
                                    <input type="time" v-else :value="event.endTime" readonly />
                                </div>
                            </div>
                            <p v-if="timeError" class="error-text">Время окончания должно быть позже начала</p>
                        </div>
                        <div class="form-group">
                            <label>Макс кол-во участников</label>
                            <input type="number" v-if="isEditing" v-model="editedEvent.maxParticipants" />
                            <input type="number" v-else :value="event.maxParticipants" readonly />
                        </div>
                        <div class="form-group location-wrapper">
                            <label>Место</label>
                            <input type="text" v-if="isEditing" v-model="editedEvent.location"
                                placeholder="Начните вводить адрес..." autocomplete="off" />
                            <input type="text" v-else :value="event.location" readonly
                                placeholder="Начните вводить адрес..." autocomplete="off" />
                            <ul v-if="suggestions.length" class="suggestions-list">
                                <li v-for="(s, i) in suggestions" :key="i" @click="selectSuggestion(s)">{{ s.value }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Формат мероприятия</label>
                        <div class="format-icons">
                            <div class="ww">
                                <div class="format-option"
                                    :class="{ active: isEditing ? editedEvent.format === 'offline' : event.format === 'offline' }"
                                    @click="isEditing ? editedEvent.format = 'offline' : event.format = 'offline'">
                                    <img src="@/assets/icons/offline.png" alt="Offline" />
                                </div>
                                <p>Оффлайн</p>
                            </div>
                            <div class="ww">
                                <div class="format-option"
                                    :class="{ active: isEditing ? editedEvent.format === 'online' : event.format === 'online' }"
                                    @click="isEditing ? editedEvent.format = 'online' : event.format = 'online'">
                                    <img src="@/assets/icons/online.png" alt="Online" />
                                </div>
                                <p>Онлайн</p>
                            </div>
                        </div>
                    </div>

                    <div class="group-section">
                        <label>Объединение в группу</label>
                        <div class="group_or_solo">
                            <div>
                                <select v-if="isEditing" v-model="editedEvent.grouping">
                                    <option>Группы и соло</option>
                                    <option>Только соло</option>
                                    <option>Только группы</option>
                                </select>
                                <select v-else :value="event.grouping" disabled>
                                    <option>Группы и соло</option>
                                    <option>Только соло</option>
                                    <option>Только группы</option>
                                </select>
                            </div>

                            <!-- СВИЧ ДЛЯ ПЕРЕКЛЮЧЕНИЯ МЕЖДУ ПОЛЯМИ ДЛЯ УЧАСТНИКОВ И ГРУПП -->
                            <transition-group name="fade" tag="div" class="view-switch">
                                <template v-if="visibleFieldModes.includes('participant')">
                                    <input type="radio" id="participant-fields" value="participant" v-model="fieldMode"
                                        key="participant" :readonly="!isEditing" />
                                    <label for="participant-fields" key="label-participant">
                                        <img src="@/assets/icons/user.png" alt="User" />
                                    </label>
                                </template>
                                <template v-if="visibleFieldModes.includes('group')">
                                    <input type="radio" id="group-fields" value="group" v-model="fieldMode" key="group"
                                        :readonly="!isEditing" />
                                    <label for="group-fields" key="label-group">
                                        <img src="@/assets/icons/stats.png" alt="Group" />
                                    </label>
                                </template>
                            </transition-group>

                        </div>
                    </div>
                    <div class="dynamic-fields">
                        <h3>Собираемые Данные — {{ fieldMode === 'group' ? 'Группа' : 'Участник' }}</h3>

                        <div class="field-item"
                            v-for="(field, index) in isEditing ? editedEvent.fields[fieldMode] : event.fields[fieldMode]"
                            :key="index">
                            <input v-model="field.label" placeholder="Название поля" :readonly="!isEditing" />
                            <select v-model="field.type" :readonly="!isEditing">
                                <option value="text">Текст</option>
                                <option value="number">Число</option>
                                <option value="date">Дата</option>
                                <option value="boolean">Да/Нет</option>
                                <option value="select">Выбор</option>
                            </select>

                            <template v-if="field.type === 'select'">
                                <input v-model="field.options" placeholder="Варианты через запятую"
                                    :readonly="!isEditing" />
                                <select :readonly="!isEditing">
                                    <option v-for="(opt, idx) in field.options.split(',')" :key="idx">{{ opt }}</option>
                                </select>
                            </template>

                            <template v-if="field.type === 'boolean'">
                                <select :disabled="!isEditing">
                                    <option>Да</option>
                                    <option>Нет</option>
                                </select>
                            </template>
                            <template v-if="field.type === 'text'">
                                <input :disabled="!isEditing" placeholder="Пример текста" />
                            </template>
                            <template v-if="field.type === 'number'">
                                <input :disabled="!isEditing" type="number" placeholder="123" />
                            </template>
                            <template v-if="field.type === 'date'">
                                <input :disabled="!isEditing" type="date" />
                            </template>

                            <input v-model="field.description" placeholder="Описание" :readonly="!isEditing" />
                            <button @click="removeField(index)" :disabled="!isEditing">×</button>
                        </div>

                        <button class="add-field" @click="addField" :disabled="!isEditing">Добавить новое поле</button>
                    </div>

                    <div v-if="isEditMode && isEditing" style="display:flex; gap:1rem; margin:1rem 0;">
                        <button class="create" @click="saveEdit">Сохранить</button>
                        <button class="create" style="background:#888;" @click="cancelEdit">Отмена</button>
                    </div>
                    <div v-else-if="selectedEventId && !isEditing">
                        <button class="create" @click="startEdit">Редактировать</button>
                    </div>
                </div>

                <div class="event-sidebar">
                    <h4 class="tile_sidebar">Мои мероприятия</h4>
                    <div class="event-sidebar-scroll">
                        <div class="upcoming-event" v-for="ev in upcomingEvents" :key="ev.id" @click="selectEvent(ev)"
                            :class="{ active: selectedEventId === ev.id }">
                            <p class="side_name">{{ ev.eventName }}</p>
                            <p class="side_name"> Дата начала: {{ formatDate(ev.startDateAndTime) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import api from '@/utils/axios'
import { computed } from 'vue'

const imageFile = ref(null)
const imagePreview = ref('')
const suggestions = ref([])
const fieldMode = ref('participant')
const isEditing = ref(false)
const isEditMode = ref(false)
const editedEvent = ref({})
const selectedEventId = ref(null)

const formatDate = dateStr => new Date(dateStr).toLocaleDateString()

const visibleFieldModes = computed(() => {
    if (event.value.grouping === 'Только соло') return ['participant']
    if (event.value.grouping === 'Только группы') return ['group']
    return ['participant', 'group']
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
const upcomingEvents = ref([])

const getUserIdFromToken = () => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))?.split('=')[1]
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
        const res = await api.get(`/events/creator/${userId}`)
        upcomingEvents.value = res.data || []
    } catch (e) {
        console.error('Ошибка при получении событий:', e)
    }
})

const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        imageFile.value = file
        const reader = new FileReader()
        reader.onload = () => {
            imagePreview.value = reader.result
        }
        reader.readAsDataURL(file)
    }
}

const addField = () => {
    event.value.fields[fieldMode.value].push({ label: '', type: 'text', options: '', description: '' })
}

const removeField = (index) => {
    event.value.fields[fieldMode.value].splice(index, 1)
}

const timeError = computed(() => {
    if (!event.value.time || !event.value.endTime) return false
    console.log(event.value.endTime)
    return event.value.endTime <= event.value.time
})

const prepareCustomFields = () => {
    const participantFields = event.value.fields.participant.map(f => ({
        name: f.label,
        type: f.type,
        require: true
    }))
    return [...participantFields]
}

const submitEvent = async () => {
    const userId = getUserIdFromToken()
    if (!userId) {
        console.error('JWT не найден или недействителен')
        return
    }

    const createDate = new Date()
    const startDateTime = new Date(`${event.value.date}T${event.value.time}`)
    const endDateTime = new Date(`${event.value.date}T${event.value.endTime}`)

    const payload = {
        eventName: event.value.title,
        creatorId: userId,
        description: event.value.description,
        image: imagePreview.value || '',
        online: event.value.format === 'online',
        createDate: createDate.toISOString().replace('Z', ''),
        startDateAndTime: startDateTime.toISOString().replace('Z', ''),
        endDateAndTime: endDateTime.toISOString().replace('Z', ''),
        maxParticipantNumber: Number(event.value.maxParticipants),
        currentParticipantQuantity: 0,
        eventAddress: event.value.location,
        isRecurring: false,
        qrCode: ''
    }

    try {
        const res = await api.post('/event', payload)
        const eventId = res.data.id
        console.log('Мероприятие создано', res.data)

        const customFieldsPayload = {
            event_id: eventId,
            fields: prepareCustomFields()
        }
        console.log(eventId, customFieldsPayload)
        await api.post('/responses/custom-fields', customFieldsPayload)
        console.log('Кастомные поля успешно добавлены')
    } catch (err) {
        console.error('Ошибка отправки:', err)
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
                    Authorization: 'Token b19db130def2050e565e36e7a7f6259dae6bb911'
                }
            }
        )
        suggestions.value = res.data.suggestions || []
    } catch (err) {
        console.error('Ошибка подсказки адреса:', err)
    }
}

const selectSuggestion = (suggestion) => {
    event.value.location = suggestion.value
    suggestions.value = []
}

const selectEvent = async (ev) => {
    selectedEventId.value = ev.id
    isEditMode.value = false
    isEditing.value = false
    try {
        const res = await api.get(`/event/${ev.id}`)
        const data = res.data
        event.value = {
            title: data.eventName,
            description: data.description,
            date: data.startDateAndTime?.split('T')[0] || '',
            time: data.startDateAndTime?.split('T')[1]?.slice(0, 5) || '',
            endTime: data.endDateAndTime?.split('T')[1]?.slice(0, 5) || '',
            maxParticipants: data.maxParticipantNumber,
            location: data.eventAddress,
            grouping: data.grouping || 'Группы и соло',
            format: data.online ? 'online' : 'offline',
            fields: data.fields || { participant: [], group: [] }
        }
        imagePreview.value = data.image || ''
    } catch (e) {
        console.error('Ошибка загрузки мероприятия:', e)
    }
}

const startEdit = () => {
    editedEvent.value = { ...event.value }
    isEditing.value = true
    isEditMode.value = true
}

const cancelEdit = () => {
    isEditing.value = false
    isEditMode.value = false
}

const saveEdit = async () => {
    if (!selectedEventId.value) return
    try {
        const payload = {
            event: {
                eventName: editedEvent.value.title,
                creatorId: getUserIdFromToken(),
                description: editedEvent.value.description,
                image: imagePreview.value || '',
                online: editedEvent.value.format === 'online',
                createDate: new Date().toISOString().replace('Z', ''),
                startDateAndTime: `${editedEvent.value.date}T${editedEvent.value.time}`,
                endDateAndTime: `${editedEvent.value.date}T${editedEvent.value.endTime}`,
                maxParticipantNumber: Number(editedEvent.value.maxParticipants),
                currentParticipantQuantity: 0,
                eventAddress: editedEvent.value.location,
                isRecurring: false,
                qrCode: ''
            }
        }
        await api.patch(`/event/${selectedEventId.value}`, payload)
        event.value = { ...editedEvent.value }
        isEditing.value = false
        isEditMode.value = false
    } catch (e) {
        alert('Ошибка при сохранении мероприятия')
    }
}
</script>

<style scoped>
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
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    animation: slideInRight 0.6s ease-out;
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



.event-sidebar {
    background: #222;
    border-radius: 0 10px 10px 0;
    padding: 1rem;
    width: 300px;
    height: fit-content;
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
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}

.upcoming-event:hover {
    transform: translateX(5px);
    background: #555;
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
    margin-top: 0.5rem;
    color: #f87171;
    font-size: 0.85rem;
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
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
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
</style>