<template>
    <div class="profile-layout">
      <NavBar />
  
      <div class="content">
        <!-- Профиль -->
        <div class="profile-card">
          <div class="profile-header">
            <p class="section-title">Профиль</p>
            <div class="actions">
              <img src="@\assets\login_icons\push.png" alt="" class="imge">
              <img src="@\assets\login_icons\redact.png" alt="" class="imge">
            </div>
          </div>
  
          <div class="profile-info">
            <div class="left">
              <div class="avatar"></div>
            </div>
            <div class="right">
              <div class="name">
                <p>{{ user.firstName }}</p>
                <p>{{ user.lastName }}</p>
              </div>
              <p>{{ user.email }}</p>
              <div class="age-birth">
                <p>{{ user.age }} лет</p>
                <p>{{ user.birthdate }}</p>
              </div>
              <p>{{ user.phone }}</p>
            </div>
          </div>
  
          <h3 class="section-subtitle">Прошедшие мероприятия</h3>
  
          <div class="events-columns">
  <!-- Соло -->
  <div class="column">
    <h4>Соло</h4>
    <div class="line"></div>
    <div
      class="event-card"
      v-for="event in soloEvents"
      :key="event.id"
    >
      <p class="event-title">{{ event.title }}</p>
      <div class="calendar">
        <img src="@/assets/login_icons/calendar.png" alt="" class="icons" />
        <p class="event-date">Дата начала: {{ event.date }}</p>
      </div>
      <div class="calendar">
        <img src="@/assets/login_icons/location.png" alt="" class="icons" />
        <p class="event-location">{{ event.location }}</p>
      </div>
    </div>
  </div>

  <!-- Группа -->
  <div class="column">
    <h4>Группа</h4>
    <div class="line"></div>
    <div
      class="event-card"
      v-for="event in groupEvents"
      :key="event.id"
    >
      <p class="event-title">{{ event.title }}</p>
      <div class="calendar">
        <img src="@/assets/login_icons/calendar.png" alt="" class="icons" />
        <p class="event-date">Дата начала: {{ event.date }}</p>
      </div>
      <div class="calendar">
        <img src="@/assets/login_icons/location.png" alt="" class="icons" />
        <p class="event-location">{{ event.location }}</p>
      </div>
    </div>
  </div>
</div>


        </div>
  
        <!-- Грядущие мероприятия -->
        <div class="upcoming">
          <h4>Грядущие мероприятия</h4>
          <div class="event-upcoming" v-for="event in groupEvents" :key="event.id">
            <p>{{ event.title }}</p>
            <div class="calendar">
              <img src="@/assets/login_icons/calendar.png" alt="" class="icons">
              <p>Дата начала: {{ event.date }}</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

const user = ref({
  firstName: '',
  lastName: '',
  email: '',
  birthdate: '',
  phone: '',
  age: 0
})


function getUserIdFromToken() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))?.split('=')[1]

  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log(payload)
    return payload.sub || payload.userId // зависит от твоей схемы токена
  } catch (e) {
    console.error('Ошибка при декодировании JWT:', e)
    return null
  }
}




const soloEvents = ref([])
const groupEvents = ref([])

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) {
    console.warn('Нет userId в токене')
    return
  }

  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data
    console.log(user)//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!удалить
  } catch (e) {
    console.error('Ошибка при загрузке пользователя:', e)
  }

  //Загрузка мероприятий
  // const soloRes = await axios.get('/events/solo')
  // const groupRes = await axios.get('/events/group')

  // soloEvents.value = soloRes.data
  // groupEvents.value = groupRes.data
})

</script>


  
  
  <style scoped>
  #app{
    justify-content: flex-end;
        padding-right: 8%
  }
  .profile-layout {
    display: flex;
    width: 80%;
  }
  
  .content {
    display: flex;
    justify-content: space-between;
    padding: 2rem 0;
    width: 100%;
  }
  
  .profile-card {
    background: #575757;
    border-radius: 8px 0 8px 8px;
    color: white;
    padding: 2rem;
    width: 75%;
  }
  
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .section-title {
    font-weight: bold;
  }
  
  .actions .icon {
    font-size: 1.2rem;
    margin-left: 1rem;
    cursor: pointer;
  }
  .imge{
    width: 40px;
    height: 40px;
    margin-left: 1.5rem;
  }
  
  .profile-info {
    display: flex;
    justify-content:space-evenly;
    margin-top: 1.5rem;
    gap: 2rem;
  }
  
  .avatar {
    width: 150px;
    height: 200px;
    background: lightgray;
  }
  
  .right {
    display: flex;
    flex-direction: column;
    text-decoration:dashed;
    justify-content: space-around;
  }
  
  .name {
    display: flex;
    gap: 6rem;
    font-weight: bold;
  }
  
  .age-birth {
    display: flex;
    gap: 6rem;
  }
  .calendar{
    display: flex;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }
  
  .section-subtitle {
    margin-top: 3rem;
    font: 3rem;
    text-align: center;
  }
  
  .events-columns {
    display: flex;
    justify-content: space-around;
    gap: 2rem;
    margin-top: 2rem;
  }
  .icons{
    width: 20px;
    height: 20px;
  }
  
  .column h4 {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .event-card {
    /* background: #333; */
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    color: white;
    border: 1px solid #888;
  }
  
  .event-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .event-date,
  .event-location {
    font-size: 0.85rem;
    color: #ccc;
  }
  
  .upcoming {
    width: 25%;
    background: #333;
    border-radius: 0 12px 12px 0;
    padding: 1rem;
    color: white;
    height: fit-content;
  }
  .line{
    background-color: #ccc;
    height: 1px;
    width: 13rem;
    margin: 1rem ;
    margin-left: 3rem;
  }
  
  .event-upcoming {
    border: 1px solid #999;
    border-radius: 8px;
    padding: 0.8rem;
    margin-top: 1rem;
    background: #555;
  }
  </style>
  