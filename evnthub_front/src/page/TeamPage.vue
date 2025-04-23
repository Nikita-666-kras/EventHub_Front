<template>
    <div class="team-page">
        <NavBar />
        <main class="content">
            <section class="team-details">
                <div class="team-header">
                    <p class="section-title">Моя Команда</p>
                    <a href="#" class="edit-btn">
                        <img src="@/assets/login_icons/redact.png" alt="edit" />
                    </a>
                </div>

                <div class="team-overview">
                    <div class="team-name">Название команды</div>

                    <div class="event-tag">
                        <h3>Название Мероприятия</h3>
                        <div class="date-ivent">
                            <p>Дата: 20.10.2004–20.10.2004</p>
                            <p>Время: 18:52–19:00</p>
                        </div>
                    </div>
                </div>

                <div class="grid-table">
                    <div class="row" v-for="n in 2" :key="n">
                        <div v-for="i in 3" :key="i" class="cell">название</div>
                    </div>
                </div>

                <div class="participants">
                    <h3>Участники</h3>
                    <div class="participant" v-for="(user, i) in 3" :key="i">
                        <div class="switch-nickname">
                            <label class="switch">
                                <input type="checkbox" checked />
                                <span class="slider"></span>
                            </label>
                            <span>Nickname</span>
                        </div>
                        
                        <span class="email">email@mail.com</span>
                        <span v-if="i === 1" class="leader">Лидер</span>
                        <button class="options">...</button>
                        <button class="remove">✕</button>
                    </div>
                    <div class="invite-container">
                        <button class="invite">Пригласить Участников</button>
                    </div>
                </div>
            </section>

            <div class="sidebar_2">
                <h4>Мои мероприятия</h4>
                <div class="event-item" v-for="i in 3" :key="i">
                    <p>название мероприятия</p>
                    <p>Дата начала: 20.03.2024</p>
                </div>
                <button class="create-btn">Создать мероприятие</button>
            </div>
        </main>
    </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
</script>

<style scoped>
.create-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
}

.team-page {
    display: flex;
    height: 100vh;
    background: #1a0f24;
    color: white;
}

.content {
    display: flex;
    flex: 1;
    padding: 2rem;

}

.sidebar_2 h4 {
    margin-bottom: 1rem;
}

.sidebar_2 {

    height: fit-content;
    width: 300px;
    background: #222;
    padding: 1rem;
    border-radius: 0 10px 10px 0;

}

.event-item {
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
}

.team-details {

    background: #3f3f3f;
    border-radius: 12px;
    padding: 1.5rem;
    flex: 3;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.team-header {
    display: flex;
    justify-content: space-between;
}

.section-title {
    font-size: 1.2rem;
    font-weight: bold;
}

.edit-btn img {
    width: 20px;
}

.team-overview {
    display: grid;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    
    border-radius: 10px;
}

.event-tag h3 {
    background: #2b2b2b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius:  9px 9px 0 0;
}
.date-ivent{
    background:#f2f2f2;
    color: rgb(0, 0, 0);
    padding: 0.5rem 1rem;
    border-radius: 0 0 9px 9px;
}

.team-name {
    font-size: 1.1rem;
    font-weight: bold;
    padding: 0 1rem;
}

.event-tag {
    
    color: black;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    text-align: center;
}

.grid-table .row {
    display: flex;
    justify-content: space-evenly;
    margin-top: 1rem;
}

.cell {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #aaa;
}

.participants {
    background: #2b2b2b;
    padding: 1rem;
    border-radius: 8px;
}

.participant {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem;
    align-items: center;
    align-content: center;
    border-radius: 10px;
    border: 0.1rem solid #eee;
    margin: 0.5rem 0;
}

.switch-nickname {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: gray;
    border-radius: 20px;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #9333ea;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

.leader {
    margin:0 1rem;
    font-weight: bold;
    color: gold;
}

.email {
    flex: 1;
    text-align: left;
    margin-left: 1rem;
}

.options,
.remove {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 0.5rem;
}

.invite-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.invite {
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, #4e00c2, #e700b3);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.team-list {
    flex: 1;
    background: #1e1e1e;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.team-item {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
}

.circle {
    width: 12px;
    height: 12px;
    background: red;
    border-radius: 50%;
    margin-right: 1rem;
}

.create-team {
    background: linear-gradient(to right, #4e00c2, #e700b3);
    color: white;
    padding: 0.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
</style>