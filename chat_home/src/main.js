import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from '/src/stores/index'

import './assets/main.css'
import './permission' //路由守卫

const app = createApp(App)

app.use(store)
app.use(router)


app.mount('#app')
