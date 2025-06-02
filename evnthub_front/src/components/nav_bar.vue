<template>
  <div>
  <button class="burger" @click="isOpen = !isOpen">
      <img src="@/assets/icons/burger.svg" alt="menu" />
    </button>
    <aside :class="['sidebar', { open: isOpen }]">
    <div class="logo">
      <router-link to="/lenta"><img src="/src/assets/logo.svg" alt="Logo" class="logo_img" /></router-link>
      <div class="iconss">
        <nav class="nav-icons">
          <!-- Все кнопки по умолчанию -->
          <template v-if="!settings.isCompactMode">
            <router-link to="/lenta"><img src="@/assets/icons/waves.png" alt="Waves" /></router-link>
            <router-link to="/user"><img src="@/assets/icons/user.png" alt="User" /></router-link>
            <router-link to="/event_create"><img src="@/assets/icons/calendar.png" alt="Calendar" /></router-link>
            <router-link to="/stats"><img src="@/assets/icons/star.png" alt="Star" /></router-link>
            <router-link to="/team"><img src="@/assets/icons/stats.png" alt="Stats" /></router-link>
          </template>

          <!-- Компактный режим -->
          <template v-else>
            <!-- Режим участника -->
            <template v-if="settings.userMode === 'participant'">
              <router-link to="/lenta"><img src="@/assets/icons/waves.png" alt="Waves" /></router-link>
              <router-link to="/user"><img src="@/assets/icons/user.png" alt="User" /></router-link>
              <router-link to="/team"><img src="@/assets/icons/stats.png" alt="Stats" /></router-link>
            </template>

            <!-- Режим создателя -->
            <template v-else>
              <router-link to="/user"><img src="@/assets/icons/user.png" alt="User" /></router-link>
              <router-link to="/event_create"><img src="@/assets/icons/calendar.png" alt="Calendar" /></router-link>
              <router-link to="/stats"><img src="@/assets/icons/star.png" alt="Star" /></router-link>
            </template>
          </template>
        </nav>
      </div>
    </div>
    <div class="bottom-icon">
      <router-link to="/settings"><img src="@/assets/icons/settings.png" alt="Settings" /></router-link>
      <!-- <img src="@/assets/icons/theme-toggle.svg" alt="Theme toggle" /> -->
    </div>
  </aside>
</div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'

import { ref } from 'vue'

const isOpen = ref(false)
const settings = useSettingsStore()
</script>

<style scoped>



.sidebar.open {
  left: 0;
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
}

.sidebar:hover {
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
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
  /* color: #888; */
  text-decoration: none;
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

.bottom-icon {
  margin-top: auto;
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
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

.burger img {
  width: 24px;
  height: 24px;
}


@media (max-width: 768px) {
  .burger {
  position: relative;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  z-index: 1101;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

  .sidebar {
    position: fixed;
    align-items: center;
    width: 5rem;
    top: 0;
    left: -100%;
    overflow-y: auto;
    /* width: 250px; */
    height: 100vh;
    transition: left 0.3s ease;
    background: #1a1a1a;
    flex-direction: column;
    z-index: 1100;
    padding: 2rem 1rem;
  }

  .sidebar.open {
    left: 0;

  }
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
  .nav-icons {
    flex-direction: column;
    gap: 1.5rem;
    max-height: 100%;
    align-items: flex-start;
  }

  .logo {
    flex-direction: column;
    align-items: flex-start;
  }
  .logo_img{
    margin-top: 3rem;

  }

  .bottom-icon {
    margin-top: 1.5rem;
    gap: 1.5rem;
    max-height: 100%;
    align-items: flex-start;
  }
  .nav-icons {
  gap: 0.7rem; /* было 1.5rem */
}



}

/* .nav-icons img {
  width: 32px;
  height: 32px;
} */


.iconss {
  border: none;
}
</style>