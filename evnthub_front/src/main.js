import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/routers'
import '@splidejs/vue-splide/css' 
import axios from 'axios'

const app = createApp(App)
app.use(router)
app.mount('#app')

