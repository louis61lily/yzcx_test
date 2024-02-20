import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
//清除控制台的报错和提示信息
app.config.warnHandler = () => { }
app.config.errorHandler = () => { }
app.use(createPinia().use(persist))
app.use(router)
app.mount('#app')
