<template>
  <div>
    <button class="burger" @click="toggleMenu">
      <img src="@/assets/icons/home.svg" alt="home" />
    </button>
    <div v-if="isOpen" class="overlay" @click="closeMenu"></div>
    <aside :class="['sidebar', { open: isOpen }]">
      <div class="logo">
        <router-link to="/lenta"><img src="/src/assets/logo.svg" alt="Logo" class="logo_img" /></router-link>
        <div class="iconss">
          <nav class="nav-icons">
            <template v-if="!settings.isCompactMode">
              <router-link to="/lenta" class="nav-item">
                <img src="@/assets/icons/waves.png" alt="Waves" />
                <span class="nav-label">Лента</span>
              </router-link>
              <router-link to="/user" class="nav-item">
                <img src="@/assets/icons/user.png" alt="User" />
                <span class="nav-label">Профиль</span>
              </router-link>
              <router-link to="/event_create" class="nav-item">
                <img src="@/assets/icons/calendar.png" alt="Calendar" />
                <span class="nav-label">Создать </span>
              </router-link>
              <router-link to="/stats" class="nav-item">
                <img src="@/assets/icons/star.png" alt="Star" />
                <span class="nav-label">Статистика</span>
              </router-link>
              <router-link to="/team" class="nav-item">
                <img src="@/assets/icons/stats.png" alt="Stats" />
                <span class="nav-label">Команда</span>
              </router-link>
            </template>

            <template v-else>
              <template v-if="settings.userMode === 'participant'">
                <router-link to="/lenta" class="nav-item">
                  <img src="@/assets/icons/waves.png" alt="Waves" />
                  <span class="nav-label">Лента</span>
                </router-link>
                <router-link to="/user" class="nav-item">
                  <img src="@/assets/icons/user.png" alt="User" />
                  <span class="nav-label">Профиль</span>
                </router-link>
                <router-link to="/team" class="nav-item">
                  <img src="@/assets/icons/stats.png" alt="Stats" />
                  <span class="nav-label">Команда</span>
                </router-link>
              </template>

              <template v-else>
                <router-link to="/user" class="nav-item">
                  <img src="@/assets/icons/user.png" alt="User" />
                  <span class="nav-label">Профиль</span>
                </router-link>
                <router-link to="/event_create" class="nav-item">
                  <img src="@/assets/icons/calendar.png" alt="Calendar" />
                  <span class="nav-label">Создать</span>
                </router-link>
                <router-link to="/stats" class="nav-item">
                  <img src="@/assets/icons/star.png" alt="Star" />
                  <span class="nav-label">Статистика</span>
                </router-link>
              </template>
            </template>
          </nav>
        </div>
      </div>
      <div class="bottom-icon">
        <router-link to="/settings" class="nav-item">
          <img src="@/assets/icons/settings.png" alt="Settings" />
          <span class="nav-label">Настройки</span>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const settings = useSettingsStore()

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}

const handleEscape = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.burger {
  display: none;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  border-right: 1px solid #333;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: visible;
}

.sidebar:hover {
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}

.sidebar.open {
  left: 0;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.logo_img {
  width: 50px;
  margin-bottom: 5rem;
  transition: transform 0.3s ease;
}

.logo_img:hover {
  transform: scale(1.1);
}

.nav-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.nav-icons a {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
  text-decoration: none;
  color: #888;
  transition: all 0.3s ease;
  position: relative;
}

.nav-icons a:hover {
  color: #9333ea;
  transform: translateX(5px);
}

.nav-icons a.router-link-active {
  color: #9333ea;
}

.nav-icons a.router-link-active::before {
  display: none;
}

.nav-icons img {
  width: 45px;
  height: 45px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-icons img:hover {
  transform: scale(1.1);
}

.nav-icons img.active {
  transform: scale(1.1);
}

.nav-label {
  position: absolute;
  left: 95px;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  opacity: 0;
  pointer-events: none;
  font-size: 1.1rem;
  color: #888;
  white-space: nowrap;
  background-color: #2c2c2c;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 1001;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-item:hover .nav-label {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.nav-item:hover .nav-label,
.nav-item.router-link-active .nav-label {
  color: #9333ea;
}

.bottom-icon {
  margin-top: auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0;
}

.bottom-icon .nav-item {
  display: flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
  color: #888;
  transition: all 0.3s ease;
  position: relative;
}

.bottom-icon img {
  width: 45px;
  height: 45px;
  cursor: pointer;
  transition: all 0.3s ease;
  filter: brightness(0.9);
}

.bottom-icon img:hover {
  transform: scale(1.1);
  filter: brightness(1.3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #888;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-label,
.nav-item.router-link-active .nav-label {
  color: #9333ea;
}

@keyframes slideIn {
  from {
    transform: translateY(-50%) translateX(-10px);
    opacity: 0;
  }

  to {
    transform: translateY(-50%) translateX(0);
    opacity: 1;
  }
}

/* Кнопка-бургер */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1099;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .burger {
    display: flex;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1101;
    background-color: #2c2c2c;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
    padding: 0.5rem;
  }

  .burger:hover {
    transform: scale(1.05);
  }

  .burger img {
    width: 24px;
    height: 24px;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background: #1a1a1a;
    flex-direction: column;
    z-index: 1100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    padding: 2rem 1rem;
    align-items: flex-start;
    overflow-y: auto;
    padding-top: 4rem;
    overflow: hidden;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .logo {
    width: 100%;
    align-items: flex-start;
    padding-left: 1rem;
  }

  .logo_img {
    margin-bottom: 3rem;
  }

  .nav-icons {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: flex-start;
    margin-top: 1rem;
  }

  .nav-icons .nav-item {
    padding: 0.8rem 1rem;
    justify-content: flex-start;
    width: 100%;
    gap: 1rem;
  }

  .nav-icons .nav-label {
    display: block;
    position: static;
    left: auto;
    top: auto;
    transform: none;
    opacity: 1;
    pointer-events: auto;
    background-color: transparent;
    padding: 0;
    margin-left: 0;
  }

  .nav-icons img {
    width: 30px;
    height: 30px;
  }

  .bottom-icon {
    margin-top: auto;
    margin-bottom: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }

  .bottom-icon .nav-item {
    width: auto;
    justify-content: center;
    padding: 0;
  }

  .bottom-icon .nav-label {
    display: none;
  }

  .bottom-icon img {
    width: 30px;
    height: 30px;
  }

  .overlay {
    /* display: block; */
  }
}

.iconss {
  border: none;
}
</style>