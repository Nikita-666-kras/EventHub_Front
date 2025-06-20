import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/page/login.vue') },
  { path: '/register', component: () => import('@/page/registation.vue') },
  { path: '/', component: () => import('@/page/main_page.vue') },
  { path: '/lenta', component: () => import('@/page/lenta.vue') },
  { path: '/user', component: () => import('@/page/ProfileView.vue') },
  { path: '/event_create', component: () => import('@/page/EventCreationForm.vue') },
  { path: '/stats', component: () => import('@/page/EventStatistics.vue') },
  { path: '/team', component: () => import('@/page/TeamPage.vue') },
  { path: '/settings', component: () => import('@/page/SettingsPage.vue') },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: () => import('@/page/EventDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
