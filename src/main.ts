import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ErrorStackParser from 'error-stack-parser'
import { findCodeBySourceMap } from './utils/index'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, vm) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  console.log(errorStack, 'errorStack')
  findCodeBySourceMap(errorStack[0])
  //   console.error(err, 'error')
  //   console.error(vm, 'vm')
}

app.mount('#app')
