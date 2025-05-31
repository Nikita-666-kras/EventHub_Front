<template>
    <div class="settings-container">
        <nav_bar />
        <h1>Настройки</h1>

        <div class="settings-section">
            <h2>Внешний вид</h2>
            <div class="setting-item">
                <span>Тема</span>
                <div class="theme-switch">
                    <input type="radio" id="light" name="theme" value="light" v-model="settings.theme"
                        @change="settings.setTheme('light')">
                    <label for="light">Светлая</label>
                    <input type="radio" id="dark" name="theme" value="dark" v-model="settings.theme"
                        @change="settings.setTheme('dark')">
                    <label for="dark">Тёмная</label>
                </div>
            </div>
            <div class="setting-item">
                <span>Компактный режим</span>
                <div class="mode-switch">
                    <input type="radio" id="full" name="compact" :value="false" v-model="settings.isCompactMode"
                        @change="settings.setCompactMode(false)">
                    <label for="full">Полный</label>
                    <input type="radio" id="compact" name="compact" :value="true" v-model="settings.isCompactMode"
                        @change="settings.setCompactMode(true)">
                    <label for="compact">Компактный</label>
                </div>
            </div>
        </div>

        <div class="settings-section" v-if="settings.isCompactMode">
            <h2>Режим работы</h2>
            <div class="setting-item">
                <span>Тип пользователя</span>
                <div class="mode-switch">
                    <input type="radio" id="participant" name="mode" value="participant" v-model="settings.userMode"
                        @change="settings.setUserMode('participant')">
                    <label for="participant">Участник</label>
                    <input type="radio" id="creator" name="mode" value="creator" v-model="settings.userMode"
                        @change="settings.setUserMode('creator')">
                    <label for="creator">Создатель мероприятий</label>
                </div>
            </div>
        </div>

        <div class="settings-section">
            <h2>Аккаунт</h2>
            <div class="setting-item">
                <button class="logout-button" @click="logout">Выйти из аккаунта</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import nav_bar from '@/components/nav_bar.vue'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const settings = useSettingsStore()

const logout = () => {
    settings.resetSettings()
    localStorage.removeItem('token')
    router.push('/login')
}
</script>

<style scoped>
.settings-container {
    width: 90%;
    max-width: 1200px;
    margin: 2rem auto;
    padding: 2rem;
    background: #1a1a1a;
    border-radius: 16px;
    color: white;
}

h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 2rem;
    color: white;
}

.settings-section {
    background: #222;
    border-radius: 12px;
    padding: clamp(1rem, 3vw, 1.5rem);
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
}

h2 {
    font-size: clamp(1rem, 3vw, 1.2rem);
    margin-bottom: 1rem;
    color: #ddd;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: clamp(0.8rem, 2vw, 1rem) 0;
    border-bottom: 1px solid #333;
    flex-wrap: wrap;
    gap: 1rem;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-item span {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.theme-switch,
.mode-switch {
    display: flex;
    background: #333;
    border-radius: 20px;
    overflow: hidden;
    width: fit-content;
    
}

.theme-switch input[type="radio"],
.mode-switch input[type="radio"] {
    display: none;
}

.theme-switch label,
.mode-switch label {
    padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem);
    cursor: pointer;
    background: #333;
    transition: all 0.3s ease;
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    white-space: nowrap;
}

.theme-switch label:hover,
.mode-switch label:hover {
    background: #444;
}

.theme-switch input[type="radio"]:checked+label,
.mode-switch input[type="radio"]:checked+label {
    background: #150a1e;
}

.logout-button {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 3vw, 1.5rem);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.logout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

@media (max-width: 768px) {
    .settings-container {
        width: 95%;
        margin: 1rem auto;
        padding: 1rem;
    }

    .setting-item {
        flex-direction: column;
        align-items: stretch;
    }

    .theme-switch,
    .mode-switch {
        width: 100%;
        justify-content: center;
    }
}
</style>