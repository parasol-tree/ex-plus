import { createApp } from 'vue'
import App from './App.vue'

import ExPlus from '@/ex-plus/index'
// import { ExForm, ExFormItem, ExInput } from 'ex-plus/index'
const app = createApp(App)
app.use(ExPlus)

// app.use(ExForm)
// app.use(ExFormItem)
// app.use(ExInput)

app.mount('#app')
