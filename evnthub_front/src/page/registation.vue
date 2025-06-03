<template>
  <div class="outer-conteiner">
    <div class="auth-container">
      <div class="auth-card">
        <div class="top-section">
          <router-link to="/"><img class="close_img" src="../assets/close-icon.svg" alt="Close" /></router-link>
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
                    <input v-model="email" class="auth-input" type="email" placeholder="Email" aria-label="Email"
                      required />
                  </div>
                  <div class="form-group password-group">
                    <input v-model="password" :type="showPassword ? 'text' : 'password'" class="auth-input"
                      placeholder="Пароль" aria-label="Пароль" required />
                    <span class="password-toggle" @click="showPassword = !showPassword">
                      <img :src="showPassword ? eyeOff : eye" alt="Показать пароль" class="eye-icon" />
                    </span>
                  </div>
                  <div class="form-group">
                    <input v-model="confirmPassword" type="password" class="auth-input" placeholder="Подтвердите пароль"
                      aria-label="Подтвердите пароль" required />
                  </div>
                  <button type="submit" class="login-submit" :class="{ active: isValid, disabled: !isValid }"
                    aria-label="Зарегистрироваться">
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
import api from '@/utils/axios'
import eye from '@/assets/login_icons/eye.svg'
import eyeOff from '@/assets/login_icons/eye-off.svg'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
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
    const response = await api.post('/auth/register', {
      email: email.value,
      password: password.value
    })

    if (response.data.token) {
      document.cookie = `jwt=${response.data.token}; path=/;`
    }

    window.location.href = '/lenta'
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Ошибка при регистрации'
  }
}
</script>



<style scoped>
.password-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.eye-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: 0.2s;
}

.eye-icon:hover {
  opacity: 1;
}

.form-group {
  padding-bottom: 8px;
}

.outer-conteiner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: #150A1E;
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

.close_img {
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
  padding: 3rem 2rem;
  align-items: end;
}

.auth-input {
  width: 100%;
  padding: 0.6rem 0.5rem;
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

/* Мобильные устройства */
@media (max-width: 768px) {
  .outer-conteiner {
    padding: 0;
    margin-left: 0;
  }

  .auth-container {
    min-height: 100vh;
    border-radius: 0;
    width: 100%;
  }

  .logo-section {
    flex-direction: column;
    padding: 1rem;
  }

  .login-icon {
    width: 180px;
    height: 180px;
    margin-bottom: 1rem;
  }

  .vertically {
    display: none;
  }

  .horizontally {
    padding: 10px;
    letter-spacing: 0.3rem;
    font-size: 12px;
    text-align: center;
  }

  .login-form {
    padding: 1rem;
    align-items: center;
    width: 100%;
  }

  .auth-input {
    font-size: 16px;
    padding: 0.8rem 1rem;
  }

  .login-submit {
    width: 100%;
    margin-top: 1rem;
    margin-right: 0;
  }

  .top-section {
    padding: 16px;
  }

  .close_img {
    width: 18px;
    height: 18px;
  }
}

/* Планшеты */
@media (min-width: 769px) and (max-width: 1024px) {
  .auth-container {
    max-width: 700px;
  }

  .login-icon {
    width: 200px;
    height: 200px;
  }

  .login-form {
    padding: 2rem;
  }
}

/* Десктоп */
@media (min-width: 1025px) {
  .auth-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .outer-conteiner {
    padding: 0;
  }
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-container {
  animation: fadeIn 0.5s ease-out;
}

/* Поддержка prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .auth-container {
    animation: none;
  }

  .auth-input,
  .login-submit {
    transition: none;
  }
}
</style>
