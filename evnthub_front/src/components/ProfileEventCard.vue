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
    padding: 1rem;
    margin-bottom: 1rem;
    color: white;
    border: 1px solid #888;
  }
  .event-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .event-date,
  .event-location {
    font-size: 0.85rem;
    color: #ccc;
  }
  </style>
  