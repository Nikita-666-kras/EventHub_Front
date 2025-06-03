<template>
    <div class="settings-container">
        <nav_bar />
        <div class="burger-menu-wrapper">
            <button class="burger-menu" @click="toggleSidebar" :class="{ active: isSidebarOpen }">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>

        <div class="settings-content">
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

        <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import nav_bar from '@/components/nav_bar.vue'
import { useSettingsStore } from '@/stores/settings'
import { ref, onMounted } from 'vue'

const router = useRouter()
const settings = useSettingsStore()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

onMounted(() => {
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isSidebarOpen.value) {
            isSidebarOpen.value = false
            document.body.style.overflow = ''
        }
    })
})

const logout = () => {
    settings.resetSettings()
    localStorage.removeItem('token')
    router.push('/login')
}
</script>

<style scoped>
.settings-container {
    min-height: 100vh;
    background: #150a1e;
    padding: 2rem;
    margin-left: 80px;
    animation: fadeIn 0.5s ease-out;
}

.settings-content {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: #1a1a1a;
    border-radius: 16px;
    color: white;
    animation: slideIn 0.5s ease-out;
}

h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 2rem;
    color: white;
    text-align: center;
}

.settings-section {
    background: #222;
    border-radius: 12px;
    padding: clamp(1rem, 3vw, 1.5rem);
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
    border: 1px solid #333;
}

.settings-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
    color: #fff;
}

.theme-switch,
.mode-switch {
    display: flex;
    background: #333;
    border-radius: 20px;
    overflow: hidden;
    width: fit-content;
    transition: all 0.3s ease;
}

.theme-switch:hover,
.mode-switch:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.2);
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
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
}

.logout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

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

@media (max-width: 768px) {
    .settings-container {
        margin-left: 0;
        padding: 0;
        padding-top: 76px;
    }

    .settings-content {
        width: 100%;
        border-radius: 0;
        padding: 1rem;
    }

    .burger-menu {
        display: flex;
    }

    .burger-menu-wrapper {
        display: block;
    }

    .setting-item {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .theme-switch,
    .mode-switch {
        width: 100%;
        justify-content: center;
    }

    .sidebar-overlay {
        display: block;
    }

    .settings-section {
        margin: 1rem 0;
    }

    .logout-button {
        width: 100%;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {

    .settings-section,
    .theme-switch,
    .mode-switch,
    .logout-button,
    .burger-menu {
        transition: none;
        animation: none;
    }

    .settings-section:hover,
    .theme-switch:hover,
    .mode-switch:hover,
    .logout-button:hover {
        transform: none;
    }
}

@media (min-width: 1025px) {
    .settings-content {
        max-width: 1000px;
    }

    .settings-section {
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>