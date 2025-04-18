<template>
  <div class="outer-conteiner">
  <div class="auth-container">
    <div class="auth-card">
      <div class="top-section">
        <img class="close_img" src="../assets/close-icon.svg" alt="Close" />
      </div>
      <div class="auth-content">
        <div class="logo-section">
          <div>
            <img class="login-icon" src="../assets/logo.svg" alt="Logo" />
            <router-link class="create-link vertically" to="/login">Войти в аккаунт</router-link>
          </div>
          <div>
            <router-link class="create-link horizontally" to="/login">Войти в аккаунт</router-link>
            <div class="login-form">
          
            <form @submit.prevent="register" class="form">
              <div class="form-group">
                <input
                  v-model="email"
                  class="auth-input"
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="password"
                  type="password"
                  class="auth-input"
                  placeholder="Пароль"
                  aria-label="Пароль"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="confirmPassword"
                  type="password"
                  class="auth-input"
                  placeholder="Подтвердите пароль"
                  aria-label="Подтвердите пароль"
                  required
                />
              </div>
              <button
                type="submit"
                class="login-submit"
                :class="{ active: isValid, disabled: !isValid }"
                aria-label="Зарегистрироваться"
              >
                Зарегистрироваться
              </button>
            </form>

        </div>
          </div>
          
        </div>
       
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/utils/axios' // свой инстанс с baseURL и withCredentials

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref(null)

const isValid = computed(() =>
  email.value && password.value && password.value === confirmPassword.value
)

const register = async () => {
  if (!isValid.value) {
    error.value = 'Пароли не совпадают или поля пустые'
    return
  }

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    // Если токен в теле — сохраняем вручную (если нужно)
    if (response.data.token) {
      document.cookie = `jwt=${response.data.token}; path=/;`
    }

    // Переход после успешной регистрации
    window.location.href = '/lenta'
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Ошибка при регистрации'
  }
}
</script>


<style scoped>

.form-group{
  padding-bottom: 8px;
}

.outer-conteiner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: #150A1E; /* или твой фон */
}
.auth-container {
  display: flex;
  min-height: 400px;
  min-width: 150px;
  border-radius: 40px;
  flex-direction: column;
  background: #282828;
  justify-content: center;
  align-items: center;
}


.top-section {
  display: flex;
  padding-right: 20px;
  padding-bottom: 25px;
  justify-content: end;
  align-items: top;
}
.close_img{
  width: 15px;

}

.logo-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.login-icon {
  width: 250px;
  height: 250px;
}

.create-link {
  font-size: small;
  font-weight: 700;
  color: var(--text-primary);
}

.vertically {
  writing-mode: vertical-rl;
  text-orientation: upright;
  text-decoration: overline;
}

.horizontally {
  padding: 20px;
  letter-spacing: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  padding-left: 40px;
  padding-top: 4vh;
  align-items: end;
}

.auth-input {
  max-width: 70%;
  padding: 10px 15px;
  font-size: 16px;
  
  color: #dfdddd;
  background: transparent;
  border: 1px solid #555;
  border-radius: 24px;
  outline: none;
  transition: all 0.3s ease-in;
}

.auth-input:focus {
  border-color: #888;
  background: #444;
}

.login-submit {
  height: 32px;
  width: auto;
  border-radius: 17px;
  border: 1px solid var(--text-primary);
  background: transparent;
  color: var(--text-primary);
  margin-top: 20px;
  margin-right: 40px;
  transition: all 0.3s ease-in-out;
}

.login-submit.active {
  background: var(--gradient-bg);
}

.login-submit.disabled {
  border-color: #444;
  color: #444;
  pointer-events: none;
}
</style>
