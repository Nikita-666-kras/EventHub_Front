<template>
  <aside class="sidebar">
    <div class="logo">
      <router-link to="/lenta"><img src="/src/assets/logo.svg" alt="Logo" class="logo_img" /></router-link>
      <div class="iconss">
        <nav class="nav-icons">

          <router-link to="/user"><img src="@/assets/icons/user.png" alt="User" /></router-link>
          <router-link to="/event_create"><img src="@/assets/icons/calendar.png" alt="Calendar" /></router-link>
          <router-link to="/stats"><img src="@/assets/icons/star.png" alt="Star" /></router-link>
          <router-link to="/team"><img src="@/assets/icons/stats.png" alt="Stats" /></router-link>
          <router-link to="/lenta"><img src="@/assets/icons/waves.png" alt="Waves" /></router-link>

        </nav>
      </div>
    </div>
    <div class="bottom-icon">
      <router-link to="/settings"><img src="@/assets/icons/settings.png" alt="Settings" /></router-link>
      <!-- <img src="@/assets/icons/theme-toggle.svg" alt="Theme toggle" /> -->
    </div>
  </aside>
</template>

<script setup>

</script>

<style scoped>
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

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 60px;
    flex-direction: row;
    padding: 0;
    bottom: auto;
    top: auto;
  }

  .logo {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 1rem;
  }

  .logo_img {
    margin-bottom: 0;
  }

  .nav-icons {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }

  .nav-icons a {
    padding: 0.5rem;
  }

  .nav-icons a:hover {
    transform: translateY(-5px);
  }

  .nav-icons a.router-link-active::before {
    width: 24px;
    height: 4px;
    top: auto;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px 4px 0 0;
  }

  .bottom-icon {
    margin: 0;
    padding: 0 1rem;
  }
}

.iconss {
  border: none;
}
</style>