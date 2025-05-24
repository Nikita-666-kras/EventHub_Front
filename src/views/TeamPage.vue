<template>
    <div class="page-wrapper">
        <div class="main-content">
            <div class="team-header">
                <h1>Команда</h1>
                <button class="primary-button" @click="showAddMemberModal = true">
                    <i class="fas fa-plus"></i>
                    Добавить участника
                </button>
            </div>

            <div class="team-members">
                <div v-for="member in teamMembers" :key="member.id" class="card member-card">
                    <div class="member-avatar">
                        <img :src="member.avatar" :alt="member.name">
                    </div>
                    <div class="member-info">
                        <h3>{{ member.name }}</h3>
                        <p class="member-role">{{ member.role }}</p>
                        <p class="member-email">{{ member.email }}</p>
                    </div>
                    <div class="member-actions">
                        <button class="secondary-button edit-btn" @click="editMember(member)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="secondary-button delete-btn" @click="deleteMember(member)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="sidebar">
            <div class="sidebar_scroll">
                <h4 class="sidebar_title">Участники команды</h4>
                <div class="card" v-for="member in teamMembers" :key="member.id">
                    <p>{{ member.name }}</p>
                    <p>{{ member.role }}</p>
                </div>
            </div>
        </div>

        <!-- Add Member Modal -->
        <div v-if="showAddMemberModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Добавить участника</h2>
                <form @submit.prevent="addMember">
                    <div class="form-group">
                        <label>Имя</label>
                        <input v-model="newMember.name" type="text" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input v-model="newMember.email" type="email" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Роль</label>
                        <select v-model="newMember.role" class="form-input" required>
                            <option value="admin">Администратор</option>
                            <option value="manager">Менеджер</option>
                            <option value="member">Участник</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="secondary-button"
                            @click="showAddMemberModal = false">Отмена</button>
                        <button type="submit" class="primary-button">Добавить</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TeamPage',
    data() {
        return {
            showAddMemberModal: false,
            newMember: {
                name: '',
                email: '',
                role: 'member'
            },
            teamMembers: [
                {
                    id: 1,
                    name: 'Иван Иванов',
                    role: 'Администратор',
                    email: 'ivan@example.com',
                    avatar: 'https://via.placeholder.com/50'
                },
                {
                    id: 2,
                    name: 'Мария Петрова',
                    role: 'Менеджер',
                    email: 'maria@example.com',
                    avatar: 'https://via.placeholder.com/50'
                }
            ]
        }
    },
    methods: {
        addMember() {
            // Add new member logic
            this.showAddMemberModal = false
        },
        editMember(member) {
            // Edit member logic
        },
        deleteMember(member) {
            // Delete member logic
        }
    }
}
</script>

<style scoped>
@import '@/assets/styles/common.css';

.team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    padding: 0 1rem;
}

.team-header h1 {
    font-size: 2rem;
    color: white;
    margin: 0;
    font-weight: 600;
}

.team-members {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    padding: 1rem;
}

.member-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
}

.member-avatar img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #444;
    transition: all 0.3s ease;
}

.member-card:hover .member-avatar img {
    border-color: #9333ea;
}

.member-info {
    flex: 1;
}

.member-info h3 {
    margin: 0;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.member-role {
    color: #9333ea;
    margin: 0.2rem 0;
    font-size: 0.95rem;
    font-weight: 500;
}

.member-email {
    color: #999;
    margin: 0;
    font-size: 0.9rem;
}

.member-actions {
    display: flex;
    gap: 0.8rem;
}

.edit-btn,
.delete-btn {
    padding: 0.8rem;
    font-size: 1.1rem;
}

.edit-btn {
    color: #3b82f6;
}

.delete-btn {
    color: #ef4444;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

.modal-content {
    background: #222;
    padding: 2rem;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    border: 1px solid #333;
    animation: slideIn 0.3s ease-out;
}

.modal-content h2 {
    margin: 0 0 1.5rem;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}
</style>