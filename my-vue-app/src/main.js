import { createApp } from 'vue'
import { ChatWidget } from '@lvmaoya/chat-bot'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.use(ChatWidget)
app.mount('#app')
