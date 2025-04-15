<template>
  
    <div class="container">
      <!-- Навигация -->
      <nav class="navbar">
        <div class="left-header">
            <div class="logo"><img src = "/src/assets/logo.svg"></div>
            <div class="nav-links">
                <a href="#">Обзор</a>
                <a href="#">Мероприятия</a>
                <a href="#">Возможности</a>
            </div>
        </div>
       
        <router-link  to="/login"><img class="login_img" src="../assets/login-icon.svg" alt="Login"></router-link>
        
      </nav>
  
      <!-- Главный баннер -->
      <header class="banner">
        <div class="banner-content">
          <div class="firstSection">
            <h1>Удобная платформа для регистрации и управления мероприятиями</h1>
            <div class="banner-image"></div>
          </div>
          
          <p>
            Создавайте события за считанные минуты, приглашайте участников и отслеживайте регистрацию в режиме 
            реального времени. Получайте актуальную статистику и управляйте вашим мероприятием с максимальной 
            эффективностью – всё в одном месте!
          </p>
        <div class="StartButton">
          <button class="start-btn">Начать</button>
        </div>
        </div>
        <!-- <div class="banner-image"></div> -->
      </header>
  
      <!-- Блок мероприятий -->
      <section class="events">
        
        <div class="events-header">
            <h2>Мероприятия</h2>
            <button class="all-events-btn">все мероприятия</button>
          
        </div>
        
  
        <Splide :options="{ perPage: 5, gap: '1rem', pagination: true }">
          <SplideSlide v-for="event in events" :key="event.id">
            <div class="event-card-wrapper">
            <div class="event-card">
              <h3>ТЕКСТ</h3>
              <div class="event-image"></div>
              
              <p>Описание Описание Описание ОписаниеОписание ОписаниеОписание Описание</p>
            </div>
          </div>
          </SplideSlide>
        </Splide>


      </section>

      <section class="description-Block">
        <div class="first_desciption">
          <div class="description-text">
              <h2>Создание мероприятий</h2>
              <p>Мы предоставляем простой и удобный инструмент для создания мероприятий любого масштаба. Независимо от того, планируете ли вы деловую встречу, конференцию или развлекательное событие, наш сервис поможет вам организовать всё с лёгкостью, начиная от планирования до управления списком участников.</p>
          </div>
          <div class="banner-description-image"></div>
        </div>

        <div class="first_desciption">
          <div class="banner-description-image"></div>
          <div class="description-text">
              <h2>Безопасность</h2>
              <p>Мы заботимся о защите ваших данных. Наш сайт использует современные технологии шифрования и аутентификации, чтобы обеспечить безопасность информации и защитить конфиденциальные данные участников мероприятий. Вы можете быть уверены, что все операции проходят под надёжной защитой.</p>
          </div>
          
        </div>


        <div class="first_desciption">
          <div class="description-text">
              <h2>Регистрация на мероприятия</h2>
              <p>Легко регистрируйтесь на мероприятия через наш интуитивно понятный интерфейс. Участники могут быстро забронировать своё место и получить всю необходимую информацию, а организаторы — эффективно управлять списками зарегистрированных пользователей и получать уведомления в реальном времени.</p>
          </div>
          <div class="banner-description-image"></div>
        </div>
      </section>
      <footer>
        <div class="footer_div">
          <div class="footer-list">
            <ul class="ul-footer">
              <li class="li-footer"><a href="#">Обзор</a></li>
              <li class="li-footer"><a href="#">Мероприятия</a></li>
              <li class="li-footer"><a href="#">Возможности</a></li>
              <li class="li-footer"><a href="#">Вход</a></li>
            </ul>
          </div>
          <div class="line"></div>
          <div class="footer-contacts">

            <div class="network">
              <img src="../assets/vk.png" alt="">
              <img src="../assets/whatsap.png" alt="">
              <img src="../assets/tg.png" alt="">
            </div>
            
            <div class="mail-phone">
              <div class="mail">
                <img src="" alt="">
                <p>Palich@gmail.com</p>
              </div>
              <div class="phone">
                <img src="" alt="">
                <p>+7 (928) 155-52-52</p>

              </div>

            </div>

          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { Splide, SplideSlide } from '@splidejs/vue-splide'
  import LentaLayout from '@/page/lenta.vue'
  import { ref } from 'vue';
  
  const events = ref([
    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
  ]);
  </script>
  
 
  <style scoped>
  /* Общие стили */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #150A1E;
  color: white;
  display: flex;
  justify-content: center;
}

/* Контейнер */
.container {
  
  max-width: 100%;
  min-height: 100vh;
}

/* Навигация */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  padding: 0.5rem ;
  background-color: #282828;
}
.left-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 50px;
    padding: 0.5rem;

}

.logo img{
  width: 2rem;
  display: flex;
  align-items: center;
  
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  
  text-decoration: none;
}

.nav-links a:hover {
  color: gray;
}
.login_img{
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 1.8rem;

}

.login-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Баннер */
.banner {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
}

.banner-content {
  max-width: 50vw;
}
.firstSection{
  display: flex;
  align-items: center;
}

.banner h1 {
  font-size: 1.8rem;
  font-weight: bold;
}

.banner p {
  color: gray;
  margin-top: 1rem;
  
}

.StartButton{
  display: flex;
  flex-direction:row-reverse;
}

.start-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 4rem;
  background: linear-gradient(to right, #3b82f6, #9333ea);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

/* Заглушка изображения */
.banner-image {
  width: 60vw;
  height: 14vw;
  background-color: gray;
  margin-left: 2rem;
}

/* Блок мероприятий */
.events {
  padding: 2rem;
}

.events-header h2{
  color: white;
  font-weight: bold;
}

.events-header {
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
}

.all-events-btn {
  position: absolute;
  right: 2rem;
  display: flex;
  flex-direction: row-reverse;
  padding: 0.5rem 1rem;
  border: 1px solid white;
  background: linear-gradient(90deg, #7116ff, #1ed0ff);
  color: white;
  border-radius: 100px;
  cursor: pointer;
  transition: 0.3s;
}
.event-card-wrapper {
  padding: 1px;
  background: linear-gradient(90deg, #7116ff, #1ed0ff);
  overflow: hidden;
  width: fit-content;
  border-radius: 10px;
}

.events-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.event-card {
  width: 15vw;
  
  background-color: #150A1E;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.event-image {
  width: 100%;
  height: 120px;
  background-color: gray;
  border-radius: 8px;
}

.event-card h3 {
  margin-bottom: 0.9rem;
}

.event-card p {
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0 0.4rem;
  color: gray;
}

.description-Block{
  margin-bottom: 20vw;
  max-width: 100%;
  padding: 0 10%;
}
.banner-description-image{
  width: 76vw;
  height: 25vw;
  background-color: gray;
  margin: 0 2rem;
}
.first_desciption h2{
  font-weight: bold;
  margin: 7% 0;
  color: white;
}
.first_desciption{
  margin: 5% 0;
  display: flex;
  align-items: center;
}

.line{
  width: 2px;
  height: 20vw;
  background: white;
}

footer{
  background-color: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer_div{
  display: flex;
  width: 80vw;
  justify-content: space-between;
  align-items: center;
}
.footer-contacts{
  display: flex;

}
.network{
  display: grid;
}
.network img{
  width: 4rem;
  margin: 1rem;
}
.footer-contacts{
  display: flex;
  width: 20vw;
  justify-content: space-between;
  align-items: center;
}
.footer-list {
  
}
.ul-footer{
  list-style: none;
}
.li-footer{
  padding: 0.6rem 0;
}
.line{
  height: 12rem;
  position: absolute;
  left: 50%;
  right: 50%;

}

  </style>
  