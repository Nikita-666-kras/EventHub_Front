import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/routers.js'
import '@splidejs/vue-splide/css'
import axios from 'axios'

const app = createApp(App)

// Ленивая загрузка компонентов
app.component('EventCard', () => import('./components/EventCard.vue'))
app.component('NavBar', () => import('./components/nav_bar.vue'))
app.component('ProfileEventCard', () => import('./components/ProfileEventCard.vue'))

app.use(router)
app.mount('#app')

