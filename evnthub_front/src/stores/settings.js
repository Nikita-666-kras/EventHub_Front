import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        theme: localStorage.getItem('theme') || 'dark',
        userMode: localStorage.getItem('userMode') || 'participant',
        isCompactMode: localStorage.getItem('isCompactMode') === 'true'
    }),

    actions: {
        setTheme(theme) {
            this.theme = theme
            localStorage.setItem('theme', theme)
            document.documentElement.setAttribute('data-theme', theme)
        },

        setUserMode(mode) {
            this.userMode = mode
            localStorage.setItem('userMode', mode)
        },

        setCompactMode(isCompact) {
            this.isCompactMode = isCompact
            localStorage.setItem('isCompactMode', isCompact)

            if (!isCompact) {
                this.userMode = 'participant'
                localStorage.setItem('userMode', 'participant')
            }
        },

        resetSettings() {
            localStorage.removeItem('theme')
            localStorage.removeItem('userMode')
            localStorage.removeItem('isCompactMode')
            this.theme = 'dark'
            this.userMode = 'participant'
            this.isCompactMode = false
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }
}) 