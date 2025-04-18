<template>
    <aside class="sidebar">
      <div class="logo">
        <router-link to="/lenta"><img src="/src/assets/logo.svg" alt="Logo" class="logo_img"/></router-link>
        <div class="iconss">
          <nav class="nav-icons">
            
          <router-link to="/user"><img src="@/assets/icons/user.png" alt="User" /></router-link>
          <router-link to="/event_create"><img src="@/assets/icons/calendar.png" alt="Calendar" /></router-link>
          <router-link to="/event_create"><img src="@/assets/icons/star.png" alt="Star" /></router-link>
          <router-link to="/stats"><img src="@/assets/icons/stats.png" alt="Stats" /></router-link>
          <router-link to="/waves"><img src="@/assets/icons/waves.png" alt="Waves" /></router-link>
        
          </nav>
        </div>
      </div>
      <div class="bottom-icon">
        <router-link to="/setings"><img src="@/assets/icons/settings.png" alt="Settings" /></router-link>
        <!-- <img src="@/assets/icons/theme-toggle.svg" alt="Theme toggle" /> -->
      </div>
    </aside>
  </template>
  
  <script setup>
  
  </script>
  
  <style scoped>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80px;
    height: 100vh;
    background-color: #1f1f1f;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    z-index: 1000;
  }
  
  .logo_img {
    width: 50px;
    margin-bottom: 5rem;
    
  }
  
  .nav-icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .iconss{
    border: none;
  }
  
  .nav-icons img,
  .bottom-icon img {
    width: 45px;
    height: 45px;
    cursor: pointer;  
    transition: 0.3s;
    filter: brightness(0.9);
  }
  
  .nav-icons img:hover,
  .bottom-icon img:hover {
    filter: brightness(1.3);
  }
  
  .bottom-icon {
    margin-bottom: 1rem;
  }
  </style>
  