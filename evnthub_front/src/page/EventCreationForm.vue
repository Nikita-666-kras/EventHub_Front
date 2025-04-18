<template>
    <NavBar />
    <div class="event-create-page">
        <div class="main-section">
            <div class="event-form">
                <div class="header">
                    <div class="image-upload">
                        <label for="imageInput">
                            <div class="image-preview"
                                :style="{ backgroundImage: imagePreview ? `url(${imagePreview})` : '' }">
                                <span v-if="!imagePreview">+</span>
                            </div>
                        </label>
                        <input id="imageInput" type="file" accept="image/*" @change="handleImageUpload" hidden />
                    </div>

                    <div class="heade-title">
                        <input class="event-title" v-model="event.title" placeholder="Название Мероприятия" />
                        <textarea class="event-description" v-model="event.description" placeholder="Описание" />
                    </div>
                </div>


                <div class="form-grid">
                    <div class="form-group">
                        <label>Дата</label>
                        <input type="date" v-model="event.date" />
                    </div>
                    <div class="form-group">
                        <label>Время</label>
                        <input type="time" v-model="event.time" />
                    </div>
                    <div class="form-group">
                        <label>Макс кол-во участников</label>
                        <input type="number" v-model="event.maxParticipants" />
                    </div>

                    <div class="form-group">
                        <label>Место</label>
                        <select v-model="event.location">
                            <option>Площадь Гагарина, 1, Ростов-на-Дону</option>
                        </select>
                    </div>
                </div>


                <div class="form-group">
                    <label>Формат мероприятия</label>
                    <div class="format-icons">
                        <div class="ww">
                            
                            <div class="format-option" :class="{ active: event.format === 'offline' }"
                                @click="event.format = 'offline'">
                                
                                <img src="@/assets/icons/offline.png" alt="Offline" />
                            </div>
                            <p>Оффлайн</p>
                        </div>
                        <div  class="ww">
                            
                            <div class="format-option" :class="{ active: event.format === 'online' }"
                                @click="event.format = 'online'">
                                
                                <img src="@/assets/icons/online.png" alt="Online" />
                            </div>
                            <p>Онлайн</p>
                        </div>
                        
                        
                    </div>
                </div>





                <div class="group-section">
                    <label>Объединение в группу</label>
                    <select v-model="event.grouping">
                        <option>Группы и соло</option>
                        <option>Только соло</option>
                        <option>Только группы</option>
                    </select>
                </div>

                <div class="dynamic-fields">
                    <h3>Собираемые Данные</h3>

                    <div class="field-item" v-for="(field, index) in event.fields" :key="index">
                        <input v-model="field.label" placeholder="Название поля" />
                        <select v-model="field.type">
                            <option value="text">Текст</option>
                            <option value="number">Число</option>
                            <option value="date">Дата</option>
                            <option value="boolean">Да/Нет</option>
                            <option value="select">Выбор</option>
                        </select>

                        <template v-if="field.type === 'select'">
                            <input v-model="field.options" placeholder="Варианты через запятую" />
                            <select>
                                <option v-for="(opt, idx) in field.options.split(',')" :key="idx">{{ opt }}</option>
                            </select>
                        </template>

                        <template v-if="field.type === 'boolean'">
                            <select disabled>
                                <option>Да</option>
                                <option>Нет</option>
                            </select>
                        </template>

                        <template v-if="field.type === 'text'">
                            <input disabled placeholder="Пример текста" />
                        </template>

                        <template v-if="field.type === 'number'">
                            <input disabled type="number" placeholder="123" />
                        </template>

                        <template v-if="field.type === 'date'">
                            <input disabled type="date" />
                        </template>

                        <input v-model="field.description" placeholder="Описание" />
                        <button @click="removeField(index)">×</button>
                    </div>

                    <button class="add-field" @click="addField">Добавить новое поле</button>
                </div>
                <div class="create_event">
                    <button class="create">Отправить</button>
                </div>
            </div>

            <div class="event-sidebar">
                <h4>Мои мероприятия</h4>
                <div class="upcoming-event" v-for="n in 2" :key="n">
                    <p>название мероприятия</p>
                    <p>📅 Дата начала: 20.03.2024</p>
                </div>
                <button class="submit-btn" @click="submitEvent">Создать мероприятие</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref } from 'vue'
 // по умолчанию

const imageFile = ref(null)
const imagePreview = ref('')



const event = ref({
    title: '',
    description: '',
    date: '',
    time: '',
    maxParticipants: '',
    location: '',
    grouping: 'Группы и соло',
    format: 'offline',
    fields: []
})


const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        imageFile.value = file
        const reader = new FileReader()
        reader.onload = () => {
            imagePreview.value = reader.result
        }
        reader.readAsDataURL(file)
    }
}



const addField = () => {
    event.value.fields.push({ label: '', type: 'text', options: '', description: '' })
}

const removeField = (index) => {
    event.value.fields.splice(index, 1)
}

const submitEvent = () => {
    console.log('Отправка мероприятия:', event.value)
    // axios.post('/api/event', event.value) — если готов бэкенд
}
</script>

<style scoped>
.format-icons {
    justify-content: center;
    display: flex;
    gap: 3rem;
    margin-top: 0.5rem;
}

.format-option {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: 0.3s;
}

.format-option img {
    width: 30px;
    height: 30px;
}

.create{
    
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    font-size: larger ;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
}

.create_event{
    display: flex;
    justify-content: center;
}

.format-option.active {
    border-color: #9333ea;
    background: #555;
}


.ww{
    display: grid;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
}


.event-create-page {
    display: flex;
    justify-content: center;
    background: #150a1e;
    min-height: 100vh;
    padding: 2rem;
    color: white;
    margin-left: 80px;
    /* фикс для NavBar */
}

.main-section {
    display: flex;
    width: 100%;
    max-width: 1400px;
}

.event-form {
    background: #444;
    border-radius: 10px 0 10px 10px;
    padding: 2rem;
    flex: 2;
}

.group-section select{
    margin-top: 1rem;
}

.event-sidebar {
    background: #222;
    border-radius: 0 10px 10px 0;
    padding: 1rem;
    width: 300px;
    height: fit-content;
}

.event-title,
.event-description {
    width: 100%;
    background: #333;
    border: 1px solid #777;
    color: white;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
}

textarea.event-description {
    height: 100px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
}
.form-group{
    text-align: center;
}

.form-group label {
    display: block;
    font-weight: bold;
    font-size: larger;

    margin-bottom: 0.8rem;
}

input,
select {
    width: 100%;
    padding: 0.4rem;
    border-radius: 6px;
    border: none;
    background: #333;
    color: white;
}

.group-section {
    margin: 1rem 0;
    text-align: center;

}
.group-section label{
    font-size: larger;
    font-weight: bold;
    padding-bottom: 1rem;
}
.dynamic-fields {
    background: #333;
    border-radius: 10px;
    padding: 1rem;
    margin-top: 2rem;
}

.image-upload {
    margin-right: 1rem;
}

.header {
    display: flex;
    margin-bottom: 1.5rem;
}

.image-preview {
    width: 12rem;
    height: 12rem;
    background-color: #555;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 2rem;
    cursor: pointer;
    border: 2px dashed #888;
}

.heade-title {
    flex: 1;
}


.field-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.field-item input,
.field-item select {
    flex: 1;
    min-width: 180px;
}

.field-item button {
    background: #a00;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-weight: bold;
    cursor: pointer;
}

.add-field,
.submit-btn {
    background: linear-gradient(to right, #3b82f6, #9333ea);
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
}

.upcoming-event {
    background: #444;
    padding: 0.5rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
}
</style>