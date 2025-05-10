import axios from 'axios'

// Создание инстанса
const api = axios.create({
  baseURL: 'http://212.22.94.76:8081/api',
  withCredentials: true // нужно для отправки HttpOnly cookie с refresh токеном
})

// Установка access токена (если есть)
function setAccessToken() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))?.split('=')[1]

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

setAccessToken()

// Ответный перехватчик
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) { 
      original._retry = true

      try {
        // Пытаемся обновить access токен
        await axios.post('http://212.22.94.76:8081/api/auth/refresh-token', {}, { withCredentials: true })

        // После успешного refresh — снова ставим новый токен
        setAccessToken()

        // Повторяем оригинальный запрос
        return api(original)
      } catch (e) {
        console.error('Не удалось обновить токен. Перенаправляю на логин...')
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }

    return Promise.reject(err)
  }
)

export default api
