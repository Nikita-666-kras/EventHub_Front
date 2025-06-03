<template>
  <div class="event-card">
    <p class="event-title">{{ title }}</p>
    <p class="event-date">📅 Дата начала: {{ date }}</p>
    <p class="event-location">📍 {{ location }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  date: String,
  location: String
})
</script>

<style scoped>
.event-card {
  background: #333;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  color: white;
  border: 1px solid #888;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: #9333ea;
}

.event-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  line-height: 1.4;
  color: #fff;
}

.event-date,
.event-location {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-date::before,
.event-location::before {
  font-size: 1.1rem;
}

/* Добавляем медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .event-card {
    padding: 1rem;
    margin: 0 -1rem 1rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .event-title {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }

  .event-date,
  .event-location {
    font-size: 0.85rem;
  }

  /* Убираем эффект при наведении на мобильных */
  .event-card:hover {
    transform: none;
    box-shadow: none;
  }
}

/* Добавляем стили для планшетов */
@media (min-width: 769px) and (max-width: 1024px) {
  .event-card {
    padding: 1.1rem;
  }

  .event-title {
    font-size: 1.05rem;
  }
}

/* Добавляем анимацию появления */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card {
  animation: fadeIn 0.3s ease-out;
}

/* Добавляем поддержку prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .event-card {
    animation: none;
    transition: none;
  }

  .event-card:hover {
    transform: none;
  }
}
</style>