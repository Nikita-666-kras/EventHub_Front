import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/page/login.vue' // Проверь путь, он должен быть правильным
import registation from '@/page/registation.vue'
import main from '@/page/main_page.vue'
import lenta from '@/page/lenta.vue'
import user from '@/page/ProfileView.vue'
const routes = [
  { path: '/login', component: LoginView },
  {path: '/register', component: registation},
  {path: '/', component: main},
  {path: '/lenta', component: lenta},
  {path: '/user', component: user}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
