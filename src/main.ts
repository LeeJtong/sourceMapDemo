import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ErrorStackParser from 'error-stack-parser'
import { findCodeBySourceMap } from './utils/index'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.config.errorHandler = (err, vm) => {
  // const errorStack = ErrorStackParser.parse(err as Error)
  // console.log(errorStack, 'errorStack')
  // findCodeBySourceMap(errorStack[0])
  //   console.error(err, 'error')
  //   console.error(vm, 'vm')

  const errorStack = ErrorStackParser.parse(err as Error)
  const jsError = {
    stack_frames: errorStack,
    message: err.message,
    stack: err.stack,
    error_name: err.name,
  }
  ElMessage.error(`您触发了一个${err.name} 错误`)
  localStorage.setItem('jsErrorList', JSON.stringify(jsError))
}

app.mount('#app')
