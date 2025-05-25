<template>
    <div class="team-page">
        <NavBar />
        <main class="content">
            <section class="team-details">
                <div class="team-header">
                    <div class="team-name-display">
                        <span v-if="!selectedTeam">Новая Команда</span>
                        <span v-else>{{ team.name }}</span>
                    </div>
                </div>

                <div class="info_team">
                    <div class="form-section">
                        <h3>Основная информация</h3>
                        <div class="form-group">
                            <label>Название Команды</label>
                            <div class="input-wrapper">
                                <input v-model="team.name" placeholder="Введите название команды" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Изображение Команды</label>
                            <div class="image-upload-container">
                                <input type="file" id="teamImageUpload" @change="handleImageUpload" accept="image/*"
                                    class="file-input" />
                                <label for="teamImageUpload" class="upload-label">
                                    <div class="upload-content">
                                        <span>Выберите изображение</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" v-if="!selectedTeam">
                            <label>Тип Команды</label>
                            <div class="input-wrapper">
                                <input v-model="team.type" placeholder="Введите тип команды (например, FIXED)" />
                            </div>
                        </div>
                    </div>

                    <div class="form-section" v-if="imagePreviewUrl || team.image">
                        <h3>Предпросмотр изображения</h3>
                        <div class="image-preview-container">
                            <img :src="imagePreviewUrl || team.image" alt="Предварительный просмотр изображения команды"
                                class="image-preview" />
                        </div>
                    </div>

                    <div class="form-section" v-if="team.event">
                        <h3>Связанное мероприятие</h3>
                        <div class="event-tag">
                            <h3>{{ team.event.eventName }}</h3>
                            <div class="date-ivent">
                                <p>Дата: {{ formatDate(team.event.startDateAndTime) }} – {{
                                    formatDate(team.event.endDateAndTime) }}</p>
                                <p>Время: {{ formatTime(team.event.startDateAndTime) }} – {{
                                    formatTime(team.event.endDateAndTime) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="button-group">
                    <button class="create-btn primary" @click="submitTeam">
                        {{ selectedTeam ? 'Сохранить Изменения' : 'Создать Команду' }}
                    </button>
                    <button class="create-btn secondary" @click="resetForm">
                        Отмена/Новая Команда
                    </button>
                </div>

                <div class="grid-table" v-if="team.structure && team.structure.length > 0">
                    <h4 style="margin-top: 2rem;">Структура Команды</h4>
                    <div class="row" v-for="(row, rowIndex) in team.structure" :key="rowIndex">
                        <div v-for="(cell, cellIndex) in row" :key="cellIndex" class="cell">{{ cell }}</div>
                    </div>
                </div>

                <h4 style="margin-top: 2rem;">Участники</h4>
                <div class="participant" v-for="user in team.members" :key="user.id">
                    <div class="switch-nickname">
                        <label class="switch">
                            <input type="checkbox" :checked="user.active" disabled />
                            <span class="slider"></span>
                        </label>
                        <span>{{ user.nickname }}</span>
                    </div>

                    <span class="email">{{ user.email }}</span>
                    <span v-if="user.isLeader" class="leader">Лидер</span>
                    <button class="options">...</button>
                    <button class="remove" @click="removeMember(user.id)">✕</button>
                </div>

                <div class="add-member-section"
                    style="margin-top: 2rem; padding: 1.5rem; background: #2a2a2a; border-radius: 12px; border: 1px solid #333;">
                    <h4 style="margin-bottom: 1rem; color: white;">Добавить участника в команду</h4>
                    <div style="display: flex; gap: 1rem; flex-direction: column;">
                        <input type="text" v-model="participantIdToAdd" placeholder="ID участника"
                            style="padding: 0.8rem; border-radius: 8px; border: 1px solid #555; background: #333; color: white;" />
                        <input type="text" v-model="memberRoleToAdd" placeholder="Роль (например, MEMBER или LEADER)"
                            style="padding: 0.8rem; border-radius: 8px; border: 1px solid #555; background: #333; color: white;" />
                        <button class="create-btn" @click="addMember">Добавить участника</button>
                    </div>
                </div>

            </section>

            <div class="sidebar_2">

                <h4 class="tile_sidebar">Мои команды</h4>
                <div class="sidebar_2_scroll">
                    <div class="event-item" v-for="team in userTeams" :key="team.id" @click="selectTeam(team)"
                        :class="{ active: selectedTeam && selectedTeam.id === team.id }">
                        <p>{{ team.name }}</p>
                        <p v-if="team.event">Мероприятие: {{ team.event.eventName }}</p>
                    </div>
                </div>
                <button class="submit-btn" @click="resetForm">Создать команду</button>

                <button class="leave-team-btn" @click="leaveTeam" v-if="selectedTeam">Покинуть Команду</button>

            </div>

        </main>
    </div>
</template>

<script setup>
import NavBar from '@/components/nav_bar.vue'
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

const userTeams = ref([])
const selectedTeam = ref(null)
const team = ref({
    id: null,
    name: '',
    image: '',
    members: [],
    structure: [],
    type: '',
    event: null
})

const participantIdToAdd = ref('')
const memberRoleToAdd = ref('')

const imagePreviewUrl = ref(null)
const imageFile = ref(null)

const getUserIdFromToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
    if (!token) return null
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.sub || payload.userId
    } catch (e) {
        console.error('JWT decode error', e)
        return null
    }
}

const submitTeam = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
        alert('Не удалось получить ID пользователя.');
        return;
    }

    const formData = new FormData();
    formData.append('name', team.value.name);
    formData.append('type', team.value.type);

    if (imageFile.value) {
        formData.append('image', imageFile.value);
    } else if (team.value.image && selectedTeam.value) {
        // If no new file selected but there's an existing image URL in edit mode, keep it.
        // The backend should ideally handle this by not changing the image if no file is sent.
        // We won't append the URL here directly, assume backend keeps existing if no file.
    }


    if (selectedTeam.value) {
        // Editing existing team
        if (!team.value.id) return;
        try {
            // For PATCH with FormData, backend needs to handle extracting fields and file
            await api.patch(`/teams/${team.value.id}/update`, formData);
            alert('Изменения команды сохранены!');
            await loadUserTeams();
            const updatedTeam = userTeams.value.find(t => t.id === selectedTeam.value.id);
            if (updatedTeam) {
                // Reload data for the selected team after update
                await loadTeamData(updatedTeam.id);
            } else {
                // If the updated team is no longer in user teams, reset form
                resetForm();
            }

        } catch (e) {
            alert('Ошибка при сохранении данных команды');
            console.error(e);
        }
    } else {
        // Creating new team
        if (!userTeams.value.length > 0 || !userTeams.value[0].event) {
            alert('Для создания команды необходимо связать ее с мероприятием. Пожалуйста, выберите существующую команду, чтобы использовать ее мероприятие как базовое для новой команды, или реализуйте отдельный выбор мероприятия.');
            return;
        }

        if (!team.value.name || !team.value.type) {
            alert('Введите название и тип команды.');
            return;
        }

        try {
            const eventIdForNewTeam = userTeams.value.length > 0 && userTeams.value[0].event ? userTeams.value[0].event.id : null;

            if (!eventIdForNewTeam) {
                alert('Не удалось определить мероприятие для новой команды.');
                return;
            }

            formData.append('event_id', eventIdForNewTeam);
            formData.append('leader_id', userId);

            await api.post('/teams', formData);
            alert('Команда успешно создана!');
            resetForm();
            await loadUserTeams();

        } catch (e) {
            alert('Ошибка при создании команды.');
            console.error(e);
        }
    }
}

const loadUserTeams = async () => {
    const userId = getUserIdFromToken()
    if (!userId) return

    try {
        const res = await api.get(`/teams/user/${userId}`)
        console.log('User teams:', res.data)
        userTeams.value = res.data
        if (userTeams.value.length > 0) {
            if (selectedTeam.value) {
                const reSelectTeam = userTeams.value.find(t => t.id === selectedTeam.value.id);
                if (reSelectTeam) {
                    await loadTeamData(reSelectTeam.id);
                    selectedTeam.value = reSelectTeam;
                } else {
                    await selectTeam(userTeams.value[0]);
                }
            } else {
                await selectTeam(userTeams.value[0]);
            }
        } else {
            resetForm();
        }

    } catch (err) {
        console.error('Ошибка загрузки команд пользователя:', err)
        userTeams.value = [];
        resetForm();
    }
}

const loadTeamData = async (teamId) => {
    if (!teamId) {
        console.warn('loadTeamData called with no teamId');
        resetForm();
        return;
    }
    try {
        const res = await api.get(`/teams/${teamId}`)
        console.log('Selected team data:', res.data)
        team.value = { ...res.data, type: team.value.type || '' };
        if (!selectedTeam.value || selectedTeam.value.id !== teamId) {
            selectedTeam.value = userTeams.value.find(t => t.id === teamId) || null;
        }

    } catch (err) {
        console.error('Ошибка загрузки данных команды:', err)
        alert('Ошибка при загрузке данных команды');
        if (selectedTeam.value && selectedTeam.value.id === teamId) {
            resetForm();
        }
    }
}

const selectTeam = async (teamItem) => {
    if (!teamItem || !teamItem.id) {
        console.warn('selectTeam called with invalid teamItem');
        resetForm();
        return;
    }
    selectedTeam.value = teamItem;
    await loadTeamData(teamItem.id);
}

onMounted(async () => {
    await loadUserTeams();
})

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : '';
const formatTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const removeMember = async (memberId) => {
    if (!team.value.id) {
        alert('Сначала выберите команду для удаления участника.');
        return;
    }
    try {
        await api.delete(`/teams/${team.value.id}/remove-member/${memberId}`)
        alert('Участник удален.');
        await loadTeamData(team.value.id);
    } catch (e) {
        alert('Ошибка при удалении участника')
        console.error(e)
    }
}

const leaveTeam = async () => {
    if (!team.value.id) {
        alert('Сначала выберите команду, из которой хотите выйти.');
        return;
    }
    try {
        await api.post(`/teams/${team.value.id}/leave`)
        alert('Вы покинули команду')
        await loadUserTeams();

    } catch (e) {
        alert('Ошибка при выходе из команды')
        console.error(e)
    }
}

const resetForm = () => {
    selectedTeam.value = null;
    team.value = {
        id: null,
        name: '',
        image: '',
        members: [],
        structure: [],
        type: '',
        event: null
    };
    participantIdToAdd.value = '';
    memberRoleToAdd.value = '';
    imagePreviewUrl.value = null;
    imageFile.value = null;
};

const addMember = async () => {
    if (!team.value.id) {
        alert('Сначала выберите команду');
        return;
    }
    if (!participantIdToAdd.value || !memberRoleToAdd.value) {
        alert('Введите ID участника и роль');
        return;
    }
    try {
        await api.post(`/teams/${team.value.id}/add-member`, {
            participant_id: participantIdToAdd.value,
            role: memberRoleToAdd.value
        });
        alert('Участник успешно добавлен');
        participantIdToAdd.value = '';
        memberRoleToAdd.value = '';
        await loadTeamData(team.value.id);
    } catch (e) {
        alert('Ошибка при добавлении участника');
        console.error(e);
    }
}

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreviewUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        imageFile.value = null;
        imagePreviewUrl.value = null;
    }
}

</script>

<style scoped>
/* Keyframes for animations */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
    }
}

/* Main layout styles */
.team-page {
    display: flex;
    background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
    /* Using dark tones from palette */
    min-height: 100vh;
    color: white;
    padding: 2rem;
    justify-content: center;
    margin-left: 80px;
    animation: fadeIn 0.5s ease-out;
}

.content {
    display: flex;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    gap: 2.5rem;
    animation: slideUp 0.5s ease-out;
}

/* Team details section */
.team-details {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey from palette with transparency */
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2.5rem;
    flex-grow: 1;
    min-width: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    /* Increased shadow for depth */
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    animation: slideInLeft 0.5s ease-out;
}

.team-header {
    margin-bottom: 2rem;
}

.team-name-display {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.5rem;
    background: rgba(65, 65, 65, 0.7);
    /* Medium grey from palette with transparency */
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Adjusted shadow */
}

/* Form styles */
.info_team {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey from palette with transparency */
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    animation: slideUp 0.5s ease-out;
}

.form-section {
    background: rgba(65, 65, 65, 0.5);
    /* Medium grey from palette with transparency */
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(80, 80, 80, 0.3);
    /* Lighter grey border */
}

.form-section h3 {
    color: #E2E8F0;
    /* White/light grey from palette */
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
}

.form-group {
    margin-bottom: 1.8rem;
    text-align: left;
    transition: all 0.3s ease;
}

.form-group label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    font-size: 1.1rem;
    color: #A0AEC0;
    /* Lighter grey from palette */
}

.input-wrapper {
    position: relative;
    
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group input[type="number"] {
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    background: rgba(45, 45, 45, 0.7);
    /* Dark grey from palette with transparency */
    color: #444;
    /* White from palette */
    box-sizing: border-box;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.form-group input[type="text"]:focus,
.form-group input[type="url"]:focus,
.form-group input[type="number"]:focus {
    border-color: #9333EA;
    /* Purple from palette */
    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3);
    /* Purple shadow */
    outline: none;
    background: rgba(65, 65, 65, 0.8);
    /* Medium grey with higher transparency */
}

/* Image upload styles */
.image-upload-container {
    position: relative;
    width: 100%;
}

.file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.upload-label {
    display: block;
    width: 100%;
    padding: 2rem;
    background: rgba(45, 45, 45, 0.7);
    /* Dark grey from palette with transparency */
    border: 2px dashed rgba(80, 80, 80, 0.5);
    /* Lighter grey dashed border */
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.upload-label:hover {
    background: rgba(65, 65, 65, 0.8);
    /* Medium grey with higher transparency */
    border-color: #9333EA;
    /* Purple from palette */
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-content span {
    color: #E2E8F0;
    /* White/light grey */
    font-size: 1rem;
}

/* Image preview styles */
.image-preview-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.image-preview {
    width: 100%;
    height: auto;
    border-radius: 12px;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Adjusted shadow */
}

/* Button group styles */
.button-group {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    justify-content: center;
    /* Center buttons */
}

.create-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 200px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Added shadow to buttons */
}

.create-btn.primary {
    background: linear-gradient(135deg, #9333EA 0%, #6B46C1 100%);
    /* Purple gradient from palette */
    color: white;
}

.create-btn.secondary {
    background: linear-gradient(135deg, #4A5568 0%, #2D3748 100%);
    /* Dark grey gradient from palette */
    color: white;
}

.create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
    /* Purple shadow on hover */
}

.create-btn.secondary:hover {
    box-shadow: 0 6px 20px rgba(45, 55, 72, 0.4);
    /* Dark grey shadow on hover */
}

/* Sidebar styles */
.sidebar_2 {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey from palette with transparency */
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    color: white;
    /* White from palette */
    height: fit-content;
    width: 320px;
    min-width: 320px;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    /* Increased shadow */
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    animation: slideInRight 0.5s ease-out;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4rem);
    /* Adjusted max-height */
}

.tile_sidebar {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    color: #E2E8F0;
    /* White/light grey */
}

.sidebar_2_scroll {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
    margin-bottom: 1.5rem;
}

.sidebar_2_scroll::-webkit-scrollbar {
    width: 8px;
    /* Slightly wider scrollbar */
}

.sidebar_2_scroll::-webkit-scrollbar-track {
    background: rgba(45, 45, 45, 0.5);
    /* Dark grey with transparency */
    border-radius: 4px;
    /* Rounded scrollbar track */
}

.sidebar_2_scroll::-webkit-scrollbar-thumb {
    background: #9333EA;
    /* Purple from palette */
    border-radius: 4px;
    /* Rounded scrollbar thumb */
    transition: background 0.3s ease;
    /* Smooth transition */
}

.sidebar_2_scroll::-webkit-scrollbar-thumb:hover {
    background: #6B46C1;
    /* Darker purple on hover */
}

/* Team list items */
.event-item {
    background: rgba(65, 65, 65, 0.5);
    /* Medium grey with transparency */
    padding: 1.2rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    /* Added subtle shadow */
}

.event-item:hover {
    transform: translateX(5px);
    /* Slide effect */
    background: rgba(80, 80, 80, 0.7);
    /* Lighter grey with more transparency */
    border-color: #9333EA;
    /* Purple border on hover */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Increased shadow on hover */
}

.event-item.active {
    background: rgba(147, 51, 234, 0.2);
    /* Purple tint from palette with transparency */
    border-color: #9333EA;
    /* Solid purple border */
    box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
    /* Purple shadow */
}

.event-item p {
    margin: 0;
    font-size: 1rem;
}

.event-item p:first-child {
    font-weight: 600;
    color: #E2E8F0;
    /* White/light grey */
    margin-bottom: 0.5rem;
}

.event-item p:last-child {
    font-size: 0.9rem;
    color: #A0AEC0;
    /* Lighter grey */
}

/* Participant styles */
.participant {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem;
    border-radius: 12px;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    margin: 1rem 0;
    transition: all 0.3s ease;
    background: rgba(45, 45, 45, 0.7);
    /* Dark grey with transparency */
    animation: slideUp 0.5s ease-out;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    /* Added subtle shadow */
}

.participant:hover {
    background: rgba(65, 65, 65, 0.8);
    /* Medium grey with more transparency */
    transform: translateY(-2px);
    /* Lift effect */
    border-color: #9333EA;
    /* Purple border on hover */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Increased shadow on hover */
}

.switch-nickname {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-grow: 1;
}

.switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #4A5568;
    /* Dark grey from palette */
    border-radius: 24px;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    /* White from palette */
    transition: 0.4s;
    border-radius: 50%;
}
input {
    width: 100%;
    padding: 0.4rem;
    border-radius: 6px;
    border: none;
    background: #333;
    color: white;
    transition: all 0.3s ease;
}

input:checked+.slider {
    background-color: #9333EA;
    /* Purple from palette */
}

input:checked+.slider:before {
    transform: translateX(20px);
}

.leader {
    margin: 0 1.5rem;
    font-weight: 600;
    color: #F6E05E;
    /* Yellow/gold - kept for leader indicator */
    flex-shrink: 0;
    padding: 0.3rem 0.8rem;
    background: rgba(246, 224, 94, 0.1);
    /* Semi-transparent yellow */
    border-radius: 6px;
}

.email {
    flex: 1;
    text-align: left;
    margin-left: 1rem;
    color: #A0AEC0;
    /* Lighter grey */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.options,
.remove {
    background: none;
    border: none;
    color: #A0AEC0;
    /* Lighter grey */
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 1rem;
    transition: all 0.3s ease;
    flex-shrink: 0;
    padding: 0.5rem;
    border-radius: 6px;
}

.options:hover,
.remove:hover {
    transform: scale(1.1);
    /* Pop effect */
    color: #E2E8F0;
    /* White/light grey */
    background: rgba(80, 80, 80, 0.3);
    /* Lighter grey background */
}

/* Add member section */
.add-member-section {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey with transparency */
    border-radius: 16px;
    padding: 2rem;
    margin-top: 2rem;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    animation: slideUp 0.5s ease-out;
}

.add-member-section h4 {
    color: #E2E8F0;
    /* White/light grey */
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
}

.add-member-section input[type="text"] {
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    background: rgba(45, 45, 45, 0.7);
    /* Dark grey with transparency */
    color: white;
    /* White */
    box-sizing: border-box;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.add-member-section input[type="text"]:focus {
    border-color: #9333EA;
    /* Purple */
    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3);
    /* Purple shadow */
    outline: none;
    background: rgba(65, 65, 65, 0.8);
    /* Medium grey with higher transparency */
}

/* Grid table styles */
.grid-table {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey with transparency */
    border-radius: 16px;
    padding: 2rem;
    margin-top: 2rem;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    animation: slideUp 0.5s ease-out;
}

.grid-table h4 {
    color: #E2E8F0;
    /* White/light grey */
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
}

.row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.cell {
    background: rgba(65, 65, 65, 0.5);
    /* Medium grey with transparency */
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid rgba(80, 80, 80, 0.3);
    /* Lighter grey border */
    color: #E2E8F0;
    /* White/light grey */
}

/* Event tag styles */
.event-tag {
    background: rgba(45, 45, 45, 0.8);
    /* Dark grey with transparency */
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(80, 80, 80, 0.5);
    /* Lighter grey border */
    margin-top: 2rem;
    /* Added margin-top back */
    animation: slideUp 0.5s ease-out;
    /* Added animation back */
}

.event-tag h3 {
    color: #E2E8F0;
    /* White/light grey */
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
}

.date-ivent {
    color: #A0AEC0;
    /* Lighter grey */
    font-size: 0.9rem;
}

.date-ivent p {
    margin: 0.5rem 0;
}

/* Submit and leave team buttons */
.submit-btn {
    background: linear-gradient(135deg, #9333EA 0%, #6B46C1 100%);
    /* Purple gradient from palette */
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    margin-top: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Added shadow */
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
    /* Purple shadow on hover */
}

.leave-team-btn {
    background: linear-gradient(135deg, #DC3545 0%, #C82333 100%);
    /* Red gradient for leave button */
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    /* Added shadow */
}

.leave-team-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    /* Red shadow on hover */
}
</style>