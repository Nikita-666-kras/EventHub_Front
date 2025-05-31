import axios from 'axios'

// Создание инстанса
const api = axios.create({
  baseURL: 'https://api.event-hub.space/api',
  withCredentials: true // нужно для отправки HttpOnly cookie с refresh токеном
})

function setAccessToken(token) {
  if (!token) {
    token = document.cookie
      .split('; ')
      .find(row => row.startsWith('jwt='))?.split('=')[1]
  }
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

setAccessToken()

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

// Ответный перехватчик
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        // Ждём, пока другой refresh завершится
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(token => {
            if (token) {
              setAccessToken(token)
              original.headers['Authorization'] = `Bearer ${token}`
              resolve(api(original))
            } else {
              reject(err)
            }
          })
        })
      }
      isRefreshing = true
      try {
        // Получаем refreshToken из cookie или localStorage
        let refreshToken = document.cookie.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1]
        if (!refreshToken) {
          refreshToken = localStorage.getItem('refresh_token')
        }
        if (!refreshToken) throw new Error('No refresh token found')
        // Запрос на refresh
        const res = await axios.post(
          'https://api.event-hub.space/api/auth/refresh-token',
          { refreshToken },
          { withCredentials: true }
        )
        const newToken = res.data?.access_token
        if (!newToken) throw new Error('No access token in refresh response')
        // Сохраняем новый access token в cookie
        document.cookie = `jwt=${newToken}; path=/`
        setAccessToken(newToken)
        onRefreshed(newToken)
        isRefreshing = false
        // Повторяем оригинальный запрос
        original.headers['Authorization'] = `Bearer ${newToken}`
        return api(original)
      } catch (e) {
        isRefreshing = false
        onRefreshed(null)
        console.error('Не удалось обновить токен. Перенаправляю на логин...')
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)

export default api
