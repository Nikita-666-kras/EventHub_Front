<template>
  <div class="main-page fade-in">
    <div class="hero-section slide-in">
      <!-- Навигация -->
      <nav class="navbar">
        <div class="left-header">
          <div class="logo"><img src="/src/assets/logo.svg"></div>
          <div class="nav-links">
            <a href="#">Обзор</a>
            <a href="#">Мероприятия</a>
            <a href="#">Возможности</a>
          </div>
        </div>

        <router-link to="/login"><img class="login_img" src="../assets/login-icon.svg" alt="Login"></router-link>

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
            <router-link to="/login"><button class="start-btn">Начать</button></router-link>
          </div>
        </div>
        <!-- <div class="banner-image"></div> -->
      </header>
    </div>

    <!-- Карусель с ивентами -->
    <section class="carousel-section">
      <h2 class="carousel-title">Ближайшие мероприятия</h2>
      <Splide :options="splideOptions" class="event-carousel">
        <SplideSlide v-for="event in events" :key="event.id">
          <div class="carousel-card" @click="goToEvent(event.id)">
            <img :src="event.image" alt="event image" class="carousel-img" loading="lazy" />
            <div class="carousel-info">
              <h3>{{ event.eventName }}</h3>
              <p>{{ event.description }}</p>
            </div>
          </div>
        </SplideSlide>
      </Splide>
    </section>


    <section class="description-Block">
      <div class="first_desciption">
        <div class="description-text">
          <h2>Создание мероприятий</h2>
          <p>Мы предоставляем простой и удобный инструмент для создания мероприятий любого масштаба. Независимо от того,
            планируете ли вы деловую встречу, конференцию или развлекательное событие, наш сервис поможет вам
            организовать всё с лёгкостью, начиная от планирования до управления списком участников.</p>
        </div>
        <div class="banner-description-image"></div>
      </div>

      <div class="first_desciption">
        <div class="banner-description-image"></div>
        <div class="description-text">
          <h2>Безопасность</h2>
          <p>Мы заботимся о защите ваших данных. Наш сайт использует современные технологии шифрования и аутентификации,
            чтобы обеспечить безопасность информации и защитить конфиденциальные данные участников мероприятий. Вы
            можете быть уверены, что все операции проходят под надёжной защитой.</p>
        </div>

      </div>


      <div class="first_desciption">
        <div class="description-text">
          <h2>Регистрация на мероприятия</h2>
          <p>Легко регистрируйтесь на мероприятия через наш интуитивно понятный интерфейс. Участники могут быстро
            забронировать своё место и получить всю необходимую информацию, а организаторы — эффективно управлять
            списками зарегистрированных пользователей и получать уведомления в реальном времени.</p>
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
            <li class="li-footer"><router-link to="/login"><a href="#">Вход</a></router-link></li>
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
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref([])

const splideOptions = {
  type: 'loop',
  perPage: 3,
  gap: '2rem',
  autoplay: true,
  pauseOnHover: true,
  arrows: true,
  pagination: false,
  breakpoints: {
    1024: {
      perPage: 2,
      arrows: true
    },
    768: {
      perPage: 1,
      arrows: false,
      gap: '1rem',
      padding: { left: '1rem', right: '1rem' }
    }
  }
}


onMounted(async () => {
  try {
    const res = await api.get('/events/page?limit=5&sortBy=start_date_and_time')
    events.value = res.data || []
    console.log('Ответ от /events/page:', res.data)

  } catch (e) {
    console.error('Ошибка загрузки мероприятий:', e)
  }
})


function isLoggedIn() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))?.split('=')[1]
  return !!token
}

function goToEvent(id) {
  if (!isLoggedIn()) {
    router.push('/login')
  } else {
    router.push(`/event/${id}`)
  }
}
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
  padding: 0.5rem;
  background-color: #282828;
  animation: slideDown 0.5s ease-out;
}

.left-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  padding: 0.5rem;
}

.logo img {
  width: 2rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.logo img:hover {
  transform: scale(1.1);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #3b82f6, #9333ea);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

.login_img {
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 1.8rem;
  transition: transform 0.3s ease;
}

.login_img:hover {
  transform: scale(1.1);
}

/* Баннер */
.banner {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  animation: fadeIn 0.8s ease-out;
}

.banner-content {
  max-width: 50vw;
  animation: fadeInUp 0.8s ease-out;
}

.firstSection {
  display: flex;
  align-items: center;
  animation: slideInLeft 0.8s ease-out;
}

.banner h1 {
  font-size: 1.8rem;
  font-weight: bold;
  animation: fadeIn 1s ease-out;
}

.banner p {
  color: gray;
  margin-top: 1rem;
  animation: fadeIn 1.2s ease-out;
}

.StartButton {
  display: flex;
  flex-direction: row-reverse;
  animation: fadeIn 1.4s ease-out;
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
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

/* Заглушка изображения */
.banner-image {
  width: 60vw;
  height: 14vw;
  background-color: gray;
  margin-left: 2rem;
  animation: slideInRight 0.8s ease-out;
}

/* Блок мероприятий */
.events {
  padding: 2rem;
  animation: fadeIn 0.8s ease-out;
}

.events-header h2 {
  color: white;
  font-weight: bold;
  animation: fadeIn 0.8s ease-out;
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
  transition: all 0.3s ease;
}

.all-events-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.event-card-wrapper {
  padding: 1px;
  background: linear-gradient(90deg, #7116ff, #1ed0ff);
  overflow: hidden;
  width: fit-content;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.event-card-wrapper:hover {
  transform: translateY(-5px);
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
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.event-image {
  width: 100%;
  height: 120px;
  background-color: gray;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image {
  transform: scale(1.05);
}

.event-card h3 {
  margin-bottom: 0.9rem;
  transition: color 0.3s ease;
}

.event-card:hover h3 {
  color: #9333ea;
}

.event-card p {
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0 0.4rem;
  color: gray;
  transition: color 0.3s ease;
}

.event-card:hover p {
  color: #fff;
}

.description-Block {
  margin-bottom: 20vw;
  max-width: 100%;
  padding: 0 10%;
}

.banner-description-image {
  width: 76vw;
  height: 25vw;
  background-color: gray;
  margin: 0 2rem;
  transition: transform 0.3s ease;
}

.banner-description-image:hover {
  transform: scale(1.02);
}

.first_desciption h2 {
  font-weight: bold;
  margin: 7% 0;
  color: white;
  transition: color 0.3s ease;
}

.first_desciption:hover h2 {
  color: #9333ea;
}

.first_desciption {
  margin: 5% 0;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}

.first_desciption:nth-child(1) {
  animation-delay: 0.2s;
}

.first_desciption:nth-child(2) {
  animation-delay: 0.4s;
}

.first_desciption:nth-child(3) {
  animation-delay: 0.6s;
}

.line {
  width: 2px;
  height: 20vw;
  background: white;
  transition: background 0.3s ease;
}

.first_desciption:hover .line {
  background: linear-gradient(to bottom, #3b82f6, #9333ea);
}

footer {
  background-color: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.8s ease-out;
}

.footer_div {
  display: flex;
  width: 80vw;
  justify-content: space-between;
  align-items: center;
}

.footer-contacts {
  display: flex;
}

.network {
  display: grid;
}

.network img {
  width: 4rem;
  margin: 1rem;
  transition: transform 0.3s ease;
}

.network img:hover {
  transform: scale(1.1);
}

.footer-contacts {
  display: flex;
  width: 20vw;
  justify-content: space-between;
  align-items: center;
}

.ul-footer {
  list-style: none;
}

.li-footer {
  padding: 0.6rem 0;
  transition: transform 0.3s ease;
}

.li-footer:hover {
  transform: translateX(5px);
}

.li-footer a {
  transition: color 0.3s ease;
}

.li-footer:hover a {
  color: #9333ea;
}

.line {
  height: 12rem;
  position: absolute;
  left: 50%;
  right: 50%;
  transition: background 0.3s ease;
}

footer:hover .line {
  background: linear-gradient(to bottom, #3b82f6, #9333ea);
}

/* Ключевые кадры анимаций */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.main-page {
  background: #150A1E;
  min-height: 100vh;
  color: white;
}

.carousel-section {
  background: none;
  box-shadow: none;
  border-radius: 0;
  margin: 0 -8vw 3rem -8vw;
  max-width: none;
  padding: 0;
  position: relative;
  overflow: visible;
}

.carousel-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #fff;
}

.event-carousel {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 2rem 0 3rem 0;
}

.carousel-card {
  cursor: pointer;
  background: #222;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(147, 51, 234, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
  min-height: 350px;
  margin: 0 1.5vw;
  z-index: 2;
}

.carousel-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 16px 48px rgba(147, 51, 234, 0.18), 0 2px 8px rgba(147, 51, 234, 0.12);
  background: #242424;
}

.carousel-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.carousel-info {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.carousel-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
  color: #fff;
}

.carousel-info p {
  color: #bbb;
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 1rem;
  }

  .left-header {
    gap: 20px;
  }

  .nav-links {
    display: none;
  }

  .banner {
    padding: 2rem 1rem;
  }

  .banner-content {
    max-width: 100%;
  }

  .firstSection {
    flex-direction: column;
  }

  .banner h1 {
    font-size: 1.5rem;
  }

  .banner-image {
    width: 100%;
    height: 30vw;
    margin: 1rem 0;
  }

  .description-Block {
    padding: 0 5%;
    margin-bottom: 10vw;
  }

  .first_desciption {
    flex-direction: column;
    text-align: center;
  }

  .banner-description-image {
    width: 100%;
    height: 40vw;
    margin: 1rem 0;
  }

  .footer_div {
    flex-direction: column;
    width: 90vw;
    gap: 2rem;
  }

  .footer-contacts {
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .network {
    display: flex;
    justify-content: center;
  }

  .network img {
    width: 3rem;
    margin: 0.5rem;
  }

  .line {
    display: none;
  }

  .carousel-card {
    min-height: 300px;
    margin: 0 1rem;
  }

  .carousel-info h3 {
    font-size: 1.1rem;
  }

  .carousel-info p {
    font-size: 0.9rem;
  }

  .carousel-section {
    margin: 0;
    padding: 0;
  }

  .carousel-title {
    font-size: 1.5rem;
    margin: 1.5rem 0;
  }

  .event-carousel {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .carousel-card {
    min-height: 280px;
    margin: 0;
    border-radius: 12px;
  }

  .carousel-img {
    height: 160px;
  }

  .carousel-info {
    padding: 1rem;
  }

  .carousel-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .carousel-info p {
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }

  /* Скрываем стрелки навигации */
  :deep(.splide__arrow) {
    display: none;
  }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
  .banner-content {
    max-width: 70vw;
  }

  .banner-image {
    width: 70vw;
    height: 20vw;
  }

  .description-Block {
    padding: 0 7%;
  }

  .banner-description-image {
    width: 85vw;
    height: 30vw;
  }

  .footer_div {
    width: 90vw;
  }

  .footer-contacts {
    width: 30vw;
  }
}

/* Десктоп */
@media (min-width: 1025px) {
  .banner-content {
    max-width: 50vw;
  }

  .banner-image {
    width: 60vw;
    height: 14vw;
  }

  .description-Block {
    padding: 0 10%;
  }

  .banner-description-image {
    width: 76vw;
    height: 25vw;
  }

  .footer_div {
    width: 80vw;
  }

  .footer-contacts {
    width: 20vw;
  }
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {

  .navbar,
  .banner,
  .banner-content,
  .firstSection,
  .banner h1,
  .banner p,
  .StartButton,
  .banner-image,
  .events,
  .events-header h2,
  .first_desciption,
  footer,
  .carousel-card {
    animation: none;
    transition: none;
  }

  .carousel-card:hover,
  .event-card:hover,
  .banner-description-image:hover,
  .network img:hover,
  .li-footer:hover {
    transform: none;
  }
}
</style>