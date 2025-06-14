import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/routers.js'
import '@splidejs/vue-splide/css'
import axios from 'axios'
import '@fortawesome/fontawesome-free/css/all.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.component('EventCard', () => import('./components/EventCard.vue'))
app.component('NavBar', () => import('./components/nav_bar.vue'))
app.component('ProfileEventCard', () => import('./components/ProfileEventCard.vue'))

app.use(pinia)
app.use(router)
app.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 3,
    newestOnTop: true
})
app.mount('#app')

