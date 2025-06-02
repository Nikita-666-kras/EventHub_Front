<template>
    <div class="event-details-wrapper">
        <NavBar />

        <div class="event-details fade-in">
            <div class="event-header slide-in">
                <div class="left">
                    <div class="banner-container">
                        <img class="banner" :src="event.image" alt="Event image" />
                    </div>
                    <div class="right">
                        <h2 class="title">{{ event.eventName }}</h2>
                        <div class="creator">
                            <img class="creator-avatar" src="@/assets/icons/user_black.png" />
                            <p>{{ creator.name }}</p>
                        </div>
                    </div>

                    <div class="date-location">
                        <div class="date">
                            <img src="@/assets/login_icons/calendar_white.png" alt="calendar icon" />
                            <p><strong>Начало:</strong> {{ formatDate(event.startDateAndTime) }}</p>
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
                        <p v-if="event.qrCode"><strong>QR-код:</strong> <img :src="event.qrCode" alt="QR code"
                                class="qr-code" /></p>
                        <div v-if="event.fields && event.fields.length">
                            <strong>Дополнительные поля:</strong>
                            <ul>
                                <li v-for="(field, idx) in event.fields" :key="idx">
                                    {{ field.name }} ({{ field.type }})
                                </li>
                            </ul>
                        </div>
                    </div>

                    <form class="custom-fields-form" @submit.prevent="register">
                        <div v-for="field in customFields" :key="field.name" class="custom-field">
                            <label :for="field.name">{{ field.name }} <span v-if="field.required">*</span></label>
                            <input v-model="customFieldValues[field.name]" :id="field.name"
                                :type="field.type === 'number' ? 'number' : 'text'" :required="field.required" />
                        </div>
                        <button class="register-btn" type="submit">Зарегистрироваться</button>
                    </form>
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/axios'
import NavBar from '@/components/nav_bar.vue'

const route = useRoute()
const event = ref({})
const creator = ref({})
const customFields = ref([])
const customFieldValues = ref({})

console.log(event)

onMounted(async () => {
    const eventId = route.params.id
    try {
        const res = await api.get(`/event/${eventId}`)
        event.value = res.data

        const userRes = await api.get(`/users/${res.data.creatorId}`)
        creator.value = userRes.data
        // Получаем кастомные поля для участника
        try {
            const customRes = await api.get(`/responses/custom-fields/participant/${res.data.id || eventId}`)
            customFields.value = customRes.data.fields || []
            customFields.value.forEach(field => {
                customFieldValues.value[field.name] = ''
            })
        } catch (e) {
            console.error('Ошибка загрузки кастомных полей:', e)
        }
    } catch (e) {
        console.error('Ошибка загрузки данных:', e)
    }
})

const formatDate = (iso) => {
    const date = new Date(iso)
    return date.toLocaleString()
}

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

const register = async () => {
    const eventId = route.params.id
    try {
        const userId = getUserIdFromToken()
        // 1. Основная регистрация
        await api.post('/participants/register', {
            userId: userId,
            eventId: eventId,
            teamId: null
        })
        // 2. Отправка кастомных полей
        await api.post('/responses/participant/submit', {
            event_id: eventId,
            participant_id: userId,
            responses: customFieldValues.value
        })
        alert('Вы успешно зарегистрированы!')
    } catch (e) {
        console.error('Ошибка при регистрации:', e)
        alert('Ошибка при регистрации')
    }
}
</script>

<style scoped>
.event-details-wrapper {
    background: #150a1e;
    color: white;
    min-height: 100vh;
    padding: 2rem;
    margin-left: 80px;
    animation: fadeIn 0.5s ease-out;
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
</style>