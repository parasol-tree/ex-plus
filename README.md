## 前沿

1. 初衷
- 最近失业，刚好有时间看看各大UI框架，就想着自己也实现一个表单组件。
2. 适合人群
- 对"vue3"和"typescript"有一定基础的人员。
3. 工具版本
- vue@3.4.29, typescript@5.4.0, **async-validator@4.2.5**, vite@5.3.1, eslint@8.57.0
- node@20.13.1, npm@10.5.2,pnpm@9.9.0
4. 参考的代码
- [element-plus](https://element-plus.org/zh-CN/)、[iview](https://www.iviewui.com/view-ui-plus/guide/introduce)、[Ant Design Vue](https://www.antdv.com/components/overview-cn)
5. [文章免阅，看源代码的点这里](#八、所有代码地址)
6. 温馨提示
- 写的不好勿喷，本文章代码仅供交流学习，**不建议**用到生产环境。
<hr>

## 目录
- [一、设计思路](#一、设计思路)
- [二、工具类函数编写](#二、工具类函数编写)
- [三、form组件编写](#三、form组件编写)
- [四、form-item编写](#四、form-item编写)
- [五、input组件编写](#五、input组件编写)
- [六、使用式例](#六、使用式例)
- [七、总结](#七、总结)
- [八、所有代码地址](#八、所有代码地址)

### 一、设计思路
1. "form"组件当个容器,容纳"formItem"组件。"formItem"组件也当个容器, 容纳"input"组件。
2. 外部调用"form"组件的校验方法触发校验,"input"组件的"change"或者"input"事件触发校验。
3. "form"组件（作为一个骨架容器）和"input"组件（作为一个纯输入的组件）校验逻辑不能放在这两个组件内。
4. 最适合发存放校验逻辑的组件是"formItem"。
5. 使用方法：大体是在外部调用"form"组件的校验方法。该方法的前提是需要获取所有"formItem"组件的上下文用来调用"formItem"组件自身内校验方法。这一步就需要"formItem"在挂载到文档后将自身实例存入"form"组件，这就需要"form"组件内有一个方法和变量来添加和存储"formItem"组件的上下文。
6. 当然"input"组件自身在"blur"或者"input"事件触发时也能校验。这一步就简单多了，只需要调用"input"组件的父级组件"formItem"的校验方法即可。
7. 大体思路上就是这些，OK，咱们简单粗暴直入主题开始吧。
   ![11.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/82548c15badb4eec9fe68a5b57649b1a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmM5qCq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDMwMDk0NTIxOTEzNzM5MCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727940043&x-orig-sign=FxMTDNWS6PRRaLrnh%2FRETiNZ0ow%3D)

##### 1. 脚手架部分
脚手架部分可忽略，[点这里跳转到工具类函数编写](#二、工具类函数编写)<br>
**(1)** 为了方便，直接用Vue官方的脚手架工具[create-vue](https://github.com/vuejs/create-vue)创建一个项目。起名"**ex-plus**"

![222222.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d1ea187db4234eb3a69a172b8d616bed~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmM5qCq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDMwMDk0NTIxOTEzNzM5MCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727423439&x-orig-sign=PPfSbqs%2BQ4NsmDk3uYKjOzK6KEk%3D)

**记得安装 [async-validator](https://github.com/yiminghe/async-validator) ，校验就是依赖它的。**

##### 2. VsCode编辑器代码提示
（1）为了在编辑器编写"HTML"代码时有我们的组件的代码提示，建立个"global.d.ts"文件

```typescript
// ex-plus/global.d.ts
/* eslint-disable */
// @ts-nocheck
/* prettier-ignore */
declare module 'vue' {
  export interface GlobalComponents {
    ExForm: typeof import('ex-plus/index')['ExForm']
    ExFormItem: typeof import('ex-plus/index')['ExFormItem']
    ExInput: typeof import('ex-plus/index')['ExInput']
  }
}
export {}
```

（2）对vite.config.ts和tsconfig.app.json进行修改

```typescript
// vite.config.ts
alias: { 'ex-plus': fileURLToPath(new URL('./src/ex-plus', import.meta.url)) }
// tsconfig.app.json
"compilerOptions": {
  "types": ["./src/ex-plus/global"], // 加载上边定义的 global.d.ts
  "lib": ["ES6", "ES2022", "DOM"],
  "paths": { "ex-plus/*": ["./src/ex-plus/*"] } // 添加自定义路径别名 "ex-plus"
}
```

##### 3. 文件结构

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2bc5a4996af5450cad9841f4d76a8234~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmM5qCq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDMwMDk0NTIxOTEzNzM5MCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727429254&x-orig-sign=2WugwoYTdjR3xU7bsVtJL5ZVxKM%3D)

### 二、工具类函数编写
1. 首先编写工具类函数是为了方便后边的使用,建议先弄清楚函数的作用再往下看。
2. 注释内已标明函数的具体作用，后边不再阐述。
3. 不想看工具类函数编写的可以[点这里跳转到form组件编写](#三、form组件编写)

##### isValidKey
```typescript
// ex-plus/utils/isValidKey.ts
/**
 * @description 用于检查对象或者数组的键是否有效，即键不为 null、 undefined 或空字符串
 * @param {*} key 对象或者数组的键
 * @returns {boolean} 返回布尔值表示键是否有效
 */
export function isValidKey(key: any): boolean {
  return !['', null, 'null', undefined, 'undefined'].includes(key)
}
```

##### isValidValue
```typescript
// ex-plus/utils/isValidValue.ts
/**
 * @description 用于检查一个参数是否为有效的值
 * @param {*} data 要检查的参数
 * @returns {boolean} 返回布尔值表示该参数是否是有效的值
 */
export function isValidValue<T>(data: T): boolean {
  if (data === '' || data === null || data === 'null' || data === undefined || data === 'undefined') {
    return false as const
  }
  if (Object.prototype.toString.call(data) === '[object Object]') {
    return Object.keys(data as object).length > 0
  }
  if (Array.isArray(data)) { return (data as Array<any>).length > 0 }
  if (typeof data === 'number') { return true }
  return Boolean(data)
}
```

##### getArrayIndex
```typescript
// ex-plus/utils/getArrayIndex.ts
/**
 * @description 用于将键转换为数组索引
 * @param key
 * @returns 函数尝试将传入的键转换为整数索引，如果无法转换为整数，则返回原始键。
 */
export function getArrayIndex<T>(key: T): T | number {
  const index = parseInt(key as string, 10)
  return isNaN(index) ? key : index
}
```
##### get
```typescript
// ex-plus/utils/get.ts 你可以理解为 lodash 的 get 方法
import { isValidKey } from './isValidKey'
import { getArrayIndex } from './getArrayIndex'
type kesType<M> = string | number | symbol | M | [M] | M[] | Array<string | number | symbol>
/**
 * @description 根据对象或者数组的某一个键查询该键对应的值。
 * @param {Object|Array} data 要查询的对象或者数组
 * @param {string|number|symbol} path 查询的路径
 * @param {*} defaultValue 查询不到时的默认值（undefined）
 * @returns 返回查询到的值
 */
export function get<T, K extends keyof T>(data: T, path: kesType<K>, defaultValue?: any): T[K] {
  if (Object.prototype.toString.call(data) !== '[object Object]' || !isValidKey(path)) {
    return defaultValue
  }
  const formatPath = Array.isArray(path) ? path : String(path).replace(/\[(\d+)\]/g, '.$1').split('.')
  let result = data
  for (const element of formatPath) {
    if (!isValidKey(element) || result == null || typeof result !== 'object' || !element || !(element in result)) {
      return defaultValue
    }
    const key = getArrayIndex(element)
    result = Object(result)[key]
  }
  return result === undefined ? defaultValue : result
}
```

### 三、form组件编写

##### 1. 基本实现

为了区别原生"form"，这里加了"ex"为前缀，后边的组件也加了"ex"为前缀<br>
"exForm"组件作为容器,用原生"form"标签作为根元素，再加个"slot"插槽存放内容。

```html
<!-- ex-plus/components/form/src/form.vue -->
<template>
  <form class="exForm" ref="refExForm">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ExForm' })
</script>
```

##### 2. 添加属性

作为容器（盒子），没错就是这么简单。接下来让我们继续完善它。<br>
1. 现在让我们给它加两个"prop"属性"model"（用于存放表单数据的对象）和"rules"（用于存放表单验证规则的对象）。
2. 在"rules"的规则对象内添加"trigger"属性,以决定校验触发的方式。
3. "rules"的更多内容可以参考 [async-validator](https://github.com/yiminghe/async-validator) 该框架不支持"trigger"属性。
4. 建个文件"form.ts"存放"prop"属性,文件"type.ts"存放需要用的所有类型

```typescript
// ex-plus/components/form/src/type.ts
import type { RuleItem } from 'async-validator'
export type InputTriggerName = 'change' | 'blur' // 校验触发的方式
// 规则对象
export interface FormRuleItem extends RuleItem { trigger?: InputTriggerName }
// 规则数组
export interface FormRules { [key: string | number | symbol]: FormRuleItem[] }

// ex-plus/components/form/src/form.ts
import type { FormRules } from './type'
export interface FormProps {
  model?: { [key: string | number | symbol]: any } // 表单数据对象
  rules?: FormRules // 表单验证规则
}

// ex-plus/components/form/src/form.vue
import type { FormProps } from './form'
const props = defineProps<FormProps>() // 定义组件的 prop
```
5. 添加"form"和"formItem"组件的上下文数据类型。
```typescript
// ex-plus/components/form/src/type.ts
import type { ValidateError, ValidateFieldsError } from 'async-validator'
export interface FormValidateFailure {
  // 验证失败的数据类型,来源于 验证库 async-validator
  errors: ValidateError[]
  fields: ValidateFieldsError
}
// 回调函数的类型
export type ValidateCallback = (isValid: boolean, validErr?: FormValidateFailure[]) => Promise<void> | void
// form 组件的 上下文
export interface FormContext {
  model?: { [key: string | number | symbol]: any } //
  rules?: FormRules
  addField: (field: FormItemContext) => void // 添加 formItem 组件的上下文
  removeField: (field: FormItemContext) => void // 删除 formItem 组件的上下文
  // 对整个表单的内容进行验证。 接收一个回调函数，或返回 `Promise`。
  validate: (callback?: ValidateCallback) => Promise<boolean> // 验证方法
}
// formItem 组件的 上下文
export interface FormItemContext {
  $el: HTMLDivElement | undefined
  label?: string
  prop?: string
  rules?: FormRuleItem[] // 前边已经定义过 FormRuleItem 了
  validate: (validType?: InputTriggerName, callback?: (vaid: boolean, err?: FormValidateFailure) => void) => Promise<boolean> // 验证方法
}
```
##### 3. 添加方法
1. 接下来只需要外部组件调用"form"组件的校验方法即可，校验结果放在"form"校验方法的回调函数内，方便外部使用。根据上边设计思路第5点，我们需要一个变量和方法来存储"formItem"的实例。
```typescript
// ex-plus/components/form/src/form.vue
import type { FormContext, FormItemContext } from './type'
const fields: FormItemContext[] = [] // 存放 formItem 组件的 上下文
// formItem 组件 在文档挂载后调用此方法
const addField: FormContext['addField'] = (field) => fields.push(field)
// formItem 组件 在文档卸载前调用此方法，删除对应存储的 formItem 组件的 上下文
const removeField: FormContext['removeField'] = (field) => {
  const index = fields.indexOf(field)
  index >= 0 && fields.splice(index, 1)
}
```
2. 添加验证方法, 其实就是在"form"组件内循环所有"formItem"组件的校验方法完成的校验。
```typescript
// ex-plus/components/form/src/form.vue
import { isValidValue } from 'ex-plus/utils'
import type { FormValidateFailure, FormContext } from './type'
//校验方法 外部组件调用这个方法即可完成验证
const validate: FormContext['validate'] = async (callback) => {
  if (!isValidValue(props.model)) {
    console.warn('[ exForm ]"model" is required for validate to work!')
    callback?.(true)
    return Promise.resolve(false)
  }
  let errsList: FormValidateFailure[] = [] // 存放错误数据
  if (fields.length > 0) {
    // fields 就是上边代码里提到的 formItem 组件的 上下文
    for (const field of fields) {
      // 循环所有"formItem"组件的校验方法完成的校验。
      try {
        await field.validate() // 调用 formItem 组件的 校验(validate)方法 完成校验
      } catch (err) {
        errsList.push(err as FormValidateFailure)
      }
    }
  }
  const isSuccess = errsList.length === 0 // 存在错误数据就是验证失败了
  callback?.(isSuccess, errsList)
  return Promise.resolve(isSuccess)
}

// 向外暴露 方法
defineExpose({ validate })
```
3.  由于"formItem"组件需要使用"form"组件的一些方法，所以向下注入一下"form"组件的方法。
```typescript
// ex-plus/components/form/src/form.vue
import { formContextKey } from '@/components/type/exForm' // 函数 provide 要注入的 key 下面有解释

provide(
  formContextKey,
  reactive({
    ...toRefs(props), // 让"formItem"组件获取"prop"的属性
    addField, // 让"formItem"组件 调用的方法
  }),
)
```
4. 在上面我们需要用"provide"函数，接下来需要定义一个关键字来当作要注入的 key。[参考文档](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
```typescript
// ex-plus/components/form/src/constants.ts
import type { InjectionKey } from 'vue'
import type { FormContext, FormItemContext } from './type'
export const formContextKey: InjectionKey<FormContext> = Symbol('formContextKey')
// 顺便也定一下 formItem 的"provide"函数的 key
export const formItemContextKey: InjectionKey<FormItemContext> = Symbol('formItemContextKey')
```
OK, "form"组件到这里基本结束了。
### 四、form-item编写
##### 1. 基本实现
该组件要有一个"label"容器，存放输入框的"label",一个容器同时存放"input"组件和校验失败时的错误提示文字。"input"组件用"slot"接收。
```html
<!-- ex-plus/components/form/src/formItem.vue -->
<template>
  <div class="exFormItem" ref="refExFormItem">
    <label class="labelDom"></label>
    <!-- 存放输入框的"label"文字 -->
    <div class="exFormItem-content">
      <slot></slot>
      <!-- 接收 "input" 组件。 -->
      <p class="errorText"></p>
      <!-- 存放校验失败时的错误提示文字 -->
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ExFormItem' })
</script>
```
##### 2. 添加属性
骨架内容搭建完毕，接下来加点js来润色了。给这个组件加几个属性。<br>
(1)现在给它加三个"prop"属性"label"、"prop"、"rules"。<br>
"label" 输入框的"label"文字。<br>
"prop" 校验的字段名字。<br>
"rules" 校验的规则，同上边的"form"组件。
(2) 建个文件"formItem.ts"存放"prop"属性
```typescript
// ex-plus/components/form/src/formItem.ts
import type { FormRuleItem } from './type'
export interface FormItemProps {
  label?: string // 输入框的"label"文字
  prop?: string // 校验的字段名字
  rules?: FormRuleItem[] // 校验的规则, 前边在 type.ts 内定义过 FormRuleItem 了
}

// ex-plus/components/form/src/formItem.vue
import type { FormItemProps } from './formItem'
const props = defineProps<FormItemProps>()
```
##### 3. 添加方法
1. 定义一些变量和方法用于控制显示错误提示文字（见下）。
```html
<!-- ex-plus/components/form/src/formItem.vue -->
<template>
  <!-- 给错误信息的 父级盒子 加 "class" 名 -->
  <div class="exFormItem-content" :class="[isValidError && 'exFormItem-error']"></div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  type ValidateStatus = 'success' | 'error' | '' // 校验结果的类型

  const validateStatus = ref<ValidateStatus>('') // 校验结果
  // 校验结果是否失败，失败返回 "true", 反之返回"false",给错误信息的盒子加"class"名
  const isValidError = computed(() => validateStatus.value === 'error')
  const errorMessages = ref('') // 错误提示文字
  // 设置校验结果
  const setValidateStatus = (status: ValidateStatus) => (validateStatus.value = status)
  // 设置错误提示文字
  const setValidateMessage = (value: string) => (errorMessages.value = value)
</script>

<style scoped>
  .exFormItem-error:deep(.exInput) {
    box-shadow: 0 0 0 1px #ed4014 inset; // 红色
  }
  .errorText { color: #ed4014; } // 红色
</style>
```
2. 在"formItem"组件挂载后，调用"form"组件的"addField"方法将自身上下文存储。<br>在"formItem"组件卸载后，调用"form"组件的"removeField"方法将自身上下文删除。<br>"input"组件需要在失焦或者值改变时调用"formItem"组件的校验方法，所以需要暴露一些方法。
```typescript
// ex-plus/components/form/src/formItem.vue
import { ref, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'
import { formContextKey } from './constants'
// "form" 组件暴露过来的属性、方法的集合
const exForm = inject(formContextKey, undefined)
const refExFormItem = ref<HTMLDivElement>() // "formItem"组件的 DOM 节点

const context: FormItemContext = reactive({
  // FormItemContext 上边在type.ts内定义过了
  ...toRefs(props),
  $el: refExFormItem,
  validate, // "formItem"组件的 校验方法
})

onMounted(() => exForm?.addField(context))
onBeforeUnmount(() => exForm?.removeField(context))
```
3. 为了让"form"组件和"input"组件调用校验方法，需要向外暴露出去一些方法，并向下("input"组件内)注入一些属性和方法。
```typescript
// ex-plus/components/form/src/formItem.vue
import { reactive, toRefs } from 'vue'
import { formItemContextKey } from './constants'

provide(
  formItemContextKey,
  reactive({
    ...toRefs(props),
    $el: refExFormItem.value, // "formItem"组件的 DOM 节点
    validate, // "formItem"组件的 校验方法
  }),
)
defineExpose({ validate }) // 向外暴露方法
```
3. 接下来添加最重要的校验方法。该方法的主要思路就是：<br>
   (1) 获取"form"组件的 属性"model"和属性"rules"。<br>
   (2) 根据当前组件"formItem"的属性"prop"来从"form"组件的"rules"内获取对应的规则。<br>
   (3) 获取前组件"formItem"的属性"rules",将其添加到上一步获取的规则内。<br>
   (4) 第2步和第3步结束后,没有获取到任何规则的话直接返回一个"Promise"的"true",结束校验。<br>
   (5) 根据"input"组件触发校验的模式，对获取到的规则进行"trigger"属性的过滤，即获取与触发模式对应的"trigger"规则<br>
   (6) 如果第5步没获取到规则，返回一个"Promise"的"true",结束校验。反之开始校验。<br>
   (7) 最终返回一个"Promise&lt;boolean&gt;"的函数,校验结果放在回调函数内反出去。
```typescript
// ex-plus/components/form/src/formItem.vue
import { isValidValue, get } from '@/ex-plus/utils'
import type { ValidateStatus, FormItemContext, FormRuleItem, InputTriggerName } from './type'

const validate: FormItemContext['validate'] = (validType, callback) => {
  const propName = props?.prop // 校验的字段
  if (!propName) {
    // 没有校验的字段直接校验失败
    console.warn('[ExFormItem]"prop" is required for validate to work!')
    callback?.(false)
    return new Promise((reject) => reject(false))
  }
  const modelValue = exForm?.model // 存放表单数据的对象
  const rulesValue = exForm?.rules // 存放表单验证规则的对象
  const propValue = get(modelValue, propName) // 校验字段的值
  const currentRule: FormRuleItem[] = get(rulesValue, propName, [])

  if (isValidValue(props.rules)) { // 合并校验规则
    ;(props.rules as FormRuleItem[]).forEach((item) => currentRule.push(item))
  }

  const valideteRules = filterRulesFunc(currentRule, validType) // 根据"trigger"的值筛选后的规则
  if (!isValidValue(valideteRules)) { // 没有获取到规则直接校验成功
    callback?.(true)
    return new Promise((resolve) => resolve(true))
  }
  return new Promise((resolve) => {
    // 检验函数... 后边有详细代码
    // "resolve(检验结果 "true" 或者 "false")"
    // "callback(检验结果 "true" 或者 "false")"
  })
}
// 根据"trigger"的值筛选规则
const filterRulesFunc = (rules: FormRuleItem[], validType?: InputTriggerName): Array<FormRuleItem> => {
  if (rules.length === 0) { return [] }
  if (!isValidValue(validType)) {
    // 没有"validType"原样返回("validType" 为外部组件触发校验的方式 "change"|"input")
    return rules
  }
  const _rulesRequired = rules.filter((ele) => ele.required !== false)
  const _rulesValidType = _rulesRequired.filter((ele) => ele.trigger !== reverseTrigger(validType))
  if (_rulesValidType.length === 0) { return [] }
  return _rulesValidType
}
// 反转触发校验的方式
const reverseTrigger = (validType?: InputTriggerName): InputTriggerName => {
  return validType === 'blur' ? 'change' : 'blur'
}
```
##### 4. 最终校验函数的编写
[async-validator文档地址](https://github.com/yiminghe/async-validator)
```typescript
// ex-plus/utils/validator.ts
import Schema, { type RuleItem } from 'async-validator'

/**
 * @description 表单验证
 * @param {string} propName 要验证的字段（必需）
 * @param {string} value 对应字段的值
 * @param {Array} rules 验证规则
 * @returns 返回 一个 promise
 */
export const doValidate = (propName: string, value: any, rules: RuleItem[]) => {
  const descriptor = { [propName]: rules }
  const validator = new Schema(descriptor)
  const data = { [propName]: value }
  return validator.validate(data, { firstFields: true })
}
```
接下来将下面的代码塞入 "formItem"组件内 "validate"函数南北的"Promise"内
```typescript
// ex-plus/components/form/src/formItem.vue
import { doValidate } from '@/ex-plus/utils'

doValidate(propName, propValue, valideteRules)
  .then(() => {
    setValidateStatus('success')
    callback?.(true)
    resolve(true as const)
  })
  .catch((err: FormValidateFailure) => {
    const message = err?.errors[0]?.message ?? ''
    const warningRule = valideteRules.find((ele) => ele.message === message)
    console.warn(`[Error valid!]Invalid value of "${propName}".\nWarning message:${message}.\nWarning rules:`, warningRule)
    setValidateStatus('error')
    setValidateMessage(message)
    callback?.(false, err)
    reject(err)
  })
```
至此，"formItem"组件编写完成了，接下来继续 "input"组件的编写.
### 五、input组件编写
##### 1. 基本实现
"input"组件就简单许多了，只需要一个原生的"textarea"或者"input"就够了。
```html
<div class="exInput">
  <textarea></textarea>
  <input />
</div>
<script setup lang="ts">
  defineOptions({ name: 'ExInput' })
</script>
```
##### 2. 添加属性
接下来新建文件"input.ts"，添加所需的"prop"的属性。
```typescript
// ex-plus/components/input/src/input.ts
export interface InputProps {
  modelValue?: string
  type?: 'text' | 'password' | 'textarea'
  placeholder?: string
  rows?: number
  autocomplete?: 'on' | 'off'
}

// ex-plus/components/input/src/input.vue
import type { InputProps } from './input'
const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入',
  rows: 2,
  autocomplete: 'off',
})
```
##### 3. 更新DOM结构
接下来根据"prop"属性来更新下DOM结构
```html
// ex-plus/components/input/src/input.vue
<div class="exInput">
  <textarea
    class="textareaDom"
    ref="refTextarea"
    v-if="props.type === 'textarea'"
    :placeholder="props.placeholder"
    :autocomplete="props.autocomplete"
    :rows="props.rows"
    :value="props.modelValue"
  ></textarea>
  <input
    class="inputDom"
    ref="refInput"
    v-else
    :placeholder="props.placeholder"
    :autocomplete="props.autocomplete"
    :rows="props.rows"
    :value="props.modelValue"
  />
</div>
```
##### 4. 双向绑定和校验方法的实现
接下来进行 "input 组件双向绑定和校验方法的实现<br>
这里只写一个"input", "textarea"同理，就不再写了.
```html
<!-- ex-plus/components/input/src/input.vue -->
<template>
  <div class="exInput" :class="[isFocus && 'exInput-focus']">
    <input :value="props.modelValue" @focus="focusFunc" @blur="blurFunc" @input="inputFunc" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ExInput' })

  import { ref, inject } from 'vue'
  import { formItemContextKey } from 'ex-plus/components/form/src/constants'
  type TargetElement = HTMLInputElement | HTMLTextAreaElement
  import type { InputTriggerName } from 'ex-plus/components/form/src/type'
  enum EnumInputTrigger {
    change = 'change',
    blur = 'blur',
  }

  // 定义一个emit事件，在 "input" 事件 更新值时更新外部的值
  const emits = defineEmits<{ (eventName: 'update:modelValue', value: string): void }>()
  const exFormItem = inject(formItemContextKey, undefined) // "formItem"组件上下文
  const isFocus = ref(false) // "input" 组件是否聚焦了

  // props 在上边定义过了就不在这里写了
  const focusFunc = () => (isFocus.value = true) // 聚焦状态标识为 "true"
  const blurFunc = () => {
    isFocus.value = false // 聚焦状态标识为 "false"
    startValidate(EnumInputTrigger.blur) // 开始调用 "formItem"组件的校验方法
  }
  const inputFunc = (e: Event) => {
    const targetValue = (e.target as TargetElement).value // 输入框当前值
    updatValue(targetValue) // 双向绑定，更新外部的值
    startValidate(EnumInputTrigger.change) // 开始调用 "formItem"组件的校验方法
  }
  // 双向绑定，更新外部的值
  const updatValue = (value: string) => emits('update:modelValue', value)
  // 开始调用 "formItem"组件的校验方法
  const startValidate = (validType: InputTriggerName) => {
    exFormItem && exFormItem.validate && exFormItem.validate(validType).catch(() => {})
  }
</script>
<style scoped>
  .exInput {
    box-shadow: 0 0 0 1px #dcdfe6 inset; // 灰色
  }
  .exInput-focus {
    box-shadow: 0 0 0 1px #409eff inset; // 淡蓝色
  }
  .inputDom {
    outline: none;
    border: 0;
  }
</style>
```
##### 5. 组件的使用方法升级
1. 将组件的使用方法改为通用为UI框架的使用方式。<br>
   在每个组件的文件夹下建立"index.ts"文件，下面用"form"组件举例。

```typescript
// ex-plus/packages/components/form/index.ts

import { withInstall } from '@/ex-plus/utils' // 导入安装方法
import Form from './src/form.vue' // 导入组件
import type { SFCWithInstall } from '@/ex-plus/utils' // 定义的工具函数安装的组件类型

// 安装组件
export const ExForm: SFCWithInstall<typeof Form> = withInstall(Form)
export default ExForm // 默认导出
export * from './src/form' // 也可以不导出看个人
```
2. 在文件夹"ex-plus"内建立"index.ts"文件，导入并导出所有组件。
```typescript
// ex-plus/index.ts

import type { App } from 'vue'
import ExForm from 'ex-plus/packages/components/form/index'
import ExFormItem from 'ex-plus/packages/components/formItem/index'
import ExInput from 'ex-plus/packages/components/input/index'

const components = [ExForm, ExFormItem, ExInput]

const install = (app: App): void => {
  components.map((component) => app.component(component.name as any, component))
}
if (typeof window !== 'undefined' && (window as any).Vue) {
  install((window as any).Vue)
}

export { ExForm, ExFormItem, ExInput } // 按需引入时需要

export default {
  // 全量引入时需要
  install,
}

export * from 'ex-plus/packages/components/form'
export * from 'ex-plus/packages/components/formItem'
export * from 'ex-plus/packages/components/input'
```
### 六、使用式例
##### 1. 安装、注册
```typescript
import { createApp } from 'vue'
const app = createApp(App)

// 按需引入
import { ExForm, ExFormItem, ExInput } from 'ex-plus/index'
app.use(ExForm)
app.use(ExFormItem)
app.use(ExInput)

// 全量引入
import ExPlus from '@/ex-plus/index'
app.use(ExPlus)
```
##### 2. 用法代码展示
```html
<template>
  <ex-form ref="refExForm" :model="modelObject" :rules="rules">
    <ex-form-item label="username">
      <ex-input v-model="modelObject.username"></ex-input>
    </ex-form-item>
    <ex-form-item label="email" prop="email">
      <ex-input v-model="modelObject.email"></ex-input>
    </ex-form-item>
    <ex-form-item label="password" prop="password">
      <ex-input type="textarea" :rows="4" v-model="modelObject.password"></ex-input>
    </ex-form-item>
    <ex-form-item
      v-for="(item, index) of modelObject.dynamicList"
      :key="item.key"
      :label="item.label || `dynamic-${index}`"
      :prop="`item.${index}.value`"
      :rules="item.rules"
    >
      <ex-input v-model="item.value"></ex-input>
    </ex-form-item>
  </ex-form>
  <button @click="submitFunc">submitFunc</button>
  <button @click="addDynamic">addDynamic</button>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import type { FormRules, FormRuleItem, FormInstance } from 'ex-plus/components/form/src/type'

  const modelObject = reactive<{
    username: string
    password: string
    email: string
    dynamicList: { key: string | number; value: string; label?: string; rules?: FormRuleItem[] }[]

  }>({ username: '', password: '', email: '',
    dynamicList: [], // 动态校验
  })
  const rules = reactive<FormRules>({
    username: [
      { required: true, message: 'Please input Activity username', trigger: 'blur' },
      { min: 3, max: 10, message: 'Username Length should be 3 to 10', trigger: 'blur' },
    ],
    email: [
      { required: true, message: 'Please input Activity email', trigger: 'blur' },
      { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] },
    ],
    password: [
      { required: true, message: 'Please input Activity password' },
      { min: 6, max: 12, message: 'Password Length should be 6 to 12' },
    ],
  })
  const refExForm = ref<FormInstance>()
  const submitFunc = async () => {
    refExForm.value?.validate((vaild, err) => {
      console.log('vaild --->', vaild, err)
    })
  }
  const addDynamic = () => {
    modelObject.dynamicList.push({
      key: new Date().getTime().toString(),
      value: '',
      label: '自定义label'
      rules: [ // 也可以不用这个，自行往"form"的属性"rules"追加规则
        { required: true, message: 'Please input Activity dynamic', trigger: 'blur' },
        { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
      ],
    })
  }
</script>
```
##### 3. 截图以表清白

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a7ce2f5216ee484eb5797e1e889db1d3~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmM5qCq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDMwMDk0NTIxOTEzNzM5MCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727450119&x-orig-sign=zz%2BLcebo8sBSO74Ry30PCquhQPE%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c745a51bd04b49518821b0d959910191~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5LmM5qCq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiNDMwMDk0NTIxOTEzNzM5MCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727450173&x-orig-sign=BIxdCNUCpap9Pm3jjYILrGPI0lk%3D)


### 七、总结
1. 还有些不足，没有编写 清除验证的方法、表单重置的方法、单个字段验证的方法。
2. 没有编写 "label"属性的详细设置,没有对"input"组件进行更加细粒度的优化。
3. textarea 没有自适应高度。
4. 没有按照组件库的格式建立仓库。优化后的代码在上边的代码地址处.

### 八、所有代码地址
优化上面问题后的代码地址[ex-plus](https://github.com/parasol-tree/ex-plus)
