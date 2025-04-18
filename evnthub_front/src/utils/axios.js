
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://212.22.94.76:8081/api'
  // обязательно
})

export default api
 