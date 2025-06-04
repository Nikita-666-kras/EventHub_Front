<template>
  <div class="event-card">
    <div class="header">

      <div class="user-info">
        <img class="avatar" :src="user.image || '@/assets/icons/user_black.png'" />
        <p class="nickname">{{ user.name }}</p>
      </div>

      <div class="title_event">
        <h3>{{ event.eventName }}</h3>
      </div>

      <!-- Menu Container -->
      <div class="menu-container">
        <div class="menu-icon" @click.stop="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div v-if="isMenuOpen" class="dropdown-menu">
          <button @click.stop="reportEvent" class="menu-item">
            Пожаловаться
          </button>
          <button v-if="user.canEdit" @click.stop="editEvent" class="menu-item">
            Изменить
          </button>
          <button @click.stop="viewUserEvents" class="menu-item">
            Мероприятия {{ user.name }}
          </button>
        </div>
      </div>
      <!-- End Menu Container -->

    </div>

    <div class="body" @click="goToEventDetails">

      <div class="left">
        <img class="preview" :src="event.image" />
        <div class="info">
          <div class="date">
            <img src="@/assets/login_icons/calendar.png" alt="">
            <div>
              <p> Начало: {{ event.startDateAndTime }}</p>
              <p> Конец: {{ event.endDateAndTime }}</p>
            </div>

          </div>
          <div class="location">
            <img src="@/assets/login_icons/location.png" alt="">
            <p> {{ event.eventAddress }}</p>
          </div>

        </div>
      </div>
      <div class="right">
        <p class="description">
          {{ event.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

const props = defineProps({
  event: Object
})

const user = ref('')
const router = useRouter()
const isMenuOpen = ref(false) // State for menu visibility

// Function to format date and time (restored if needed later)
// const formatDateTime = (dateTimeStr) => {
//   if (!dateTimeStr) return ''
//   const date = new Date(dateTimeStr)
//   if (isNaN(date.getTime())) return dateTimeStr
//   const day = date.getDate().toString().padStart(2, '0')
//   const month = (date.getMonth() + 1).toString().padStart(2, '0')
//   const year = date.getFullYear()
//   const hours = date.getHours().toString().padStart(2, '0')
//   const minutes = date.getMinutes().toString().padStart(2, '0')
//   const monthNames = [
//     'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
//     'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
//   ]
//   return `${day} ${monthNames[date.getMonth()]} ${year}, ${hours}:${minutes}`
// }

onMounted(async () => {
  try {
    const res = await api.get(`/users/${props.event.creatorId}`)
    user.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки пользователя:', err)
  }
})

// Menu toggle and actions
const toggleMenu = (event) => {
  event.stopPropagation()
  isMenuOpen.value = !isMenuOpen.value
}

const reportEvent = () => {
  // TODO: Реализовать функционал жалобы
  console.log('Жалоба на мероприятие:', props.event.id)
  isMenuOpen.value = false
}

const editEvent = () => {
  router.push(`/event/edit/${props.event.id}`)
  isMenuOpen.value = false
}

const viewUserEvents = () => {
  router.push(`/user/${props.event.creatorId}/events`)
  isMenuOpen.value = false
}

const goToEventDetails = () => {
  router.push(`/event/${props.event.id}`)
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    isMenuOpen.value = false
  })
})

</script>


<style scoped>
.event-card {
  background: linear-gradient(180deg, #245dff, #ae38b9);
  border-radius: 16px;
  padding: 1rem;
  color: white;
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
  padding-top: 0;
}

.title_event {
  width: 100%;
  max-width: 27rem;
  text-align: center;
  font-size: large;
  order: 2;
  margin: 0.5rem 0;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-left: 0.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.location {
  display: flex;
  align-items: flex-start;
}

.location img {
  width: 30px;
  height: 30px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.location p {
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  background: #eee;
  border-radius: 20px;
  color: black;
  border: 0.5rem;
  flex: 1;
  min-width: 0;
  order: 1;
  max-width: 60%;
  margin: 0 auto;
  padding: 0.5rem 0;
  justify-content: center;
}

.nickname {
  font-weight: bold;
  margin: 0 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px;
}

.menu-icon span {
  display: block;
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
}

.body {
  display: flex;
  padding: 12px;
  gap: 1rem;
  border: 0.1rem solid #eee;
  border-radius: 16px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.body:hover {
  background: rgba(255, 255, 255, 0.05);
}

.date {
  max-width: 100%;
  display: flex;
  align-items: center;
}

.date img {
  width: 30px;
  height: 30px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 60%;
}

.preview {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  background: gray;
  border-radius: 8px;
  object-fit: cover;
  margin: 0 auto;
  display: block;
}

.info {
  margin: 0.5rem 0 0.5rem 0.8rem;
  width: 100%;
}

.info p {
  margin: 0.7rem 0;
  font-size: 0.9rem;
}

.right {
  flex: 0 0 40%;
  background: #eee;
  color: black;
  height: auto;
  max-height: 35rem;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
}

.description {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  margin: 0;
  overflow-y: auto;
  max-height: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card {
  border-radius: 16px;
  animation: fadeIn 0.5s ease-out;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  margin-top: 0.5rem;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: none;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

@media (max-width: 768px) {
  .event-card {
    border-radius: 16px;
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .body {
    flex-direction: column;
    padding: 8px;
    gap: 0.75rem;
  }

  .left {
    width: 100%;
  }

  .right {
    width: 100%;
    flex: none;
  }

  .preview {
    aspect-ratio: 16/9;
  }

  .title_event {
    font-size: 1.1rem;
  }

  .user-info {
    margin: 0.5rem auto;
    max-width: 60%;
    width: 100%;
    justify-content: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .nickname {
    font-size: 0.9rem;
  }

  .menu-container {
    top: 1.5rem;
    right: 0.1rem;
  }

  .menu-icon {
    width: 20px;
    height: 20px;
    padding: 3px;
  }

  .menu-icon span {
    width: 3px;
    height: 3px;
  }

  .dropdown-menu {
    right: -10px;
    top: calc(100% + 5px);
  }
}
</style>