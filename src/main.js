import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import store from './store'
import * as ElIcon from '@element-plus/icons-vue'

import 'dayjs/locale/zh-cn';
import locale from "element-plus/lib/locale/lang/zh-cn";

const app = createApp(App)
app.use(router)
app.use(store)
app.use(ElementPlus,{locale})
app.mount('#app')

Object.keys(ElIcon).forEach((key) => {
    app.component(key, ElIcon[key])
})