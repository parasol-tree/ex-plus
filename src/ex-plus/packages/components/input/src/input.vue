<template>
  <div
    class="exInput"
    :class="[
      props.type === 'textarea' ? 'exInput-textarea' : 'exInput-input',
      isFocus && 'exInput-focus',
      isDisabled && 'exInput-disabled',
    ]"
  >
    <slot></slot>
    <textarea
      class="textareaDom"
      ref="refTextarea"
      v-if="props.type === 'textarea'"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :autocomplete="props.autocomplete"
      :maxlength="props.maxlength"
      :disabled="isDisabled"
      :value="props.modelValue"
      @focus="focusFunc"
      @blur="blurFunc"
      @input="inputFunc"
      @compositionstart="compositionStartFunc"
      @compositionupdate="compositionUpdateFunc"
      @compositionend="compositionEndFunc"
    ></textarea>
    <input
      class="inputDom"
      ref="refInput"
      v-else
      :type="props.type === 'password' ? passwordType : props.type"
      :placeholder="props.placeholder"
      :autocomplete="props.autocomplete"
      :maxlength="props.maxlength"
      :disabled="isDisabled"
      :value="props.modelValue"
      @focus="focusFunc"
      @blur="blurFunc"
      @input="inputFunc"
      @compositionstart="compositionStartFunc"
      @compositionupdate="compositionUpdateFunc"
      @compositionend="compositionEndFunc"
    />
    <div class="exInput-icon-container" v-if="props.type === 'password' && props.modelValue">
      <i class="exInput-icon">
        <eyeShow v-if="isShowEye" @click="isShowEye = !isShowEye"></eyeShow>
        <eyeHide v-else @click="isShowEye = !isShowEye"></eyeHide>
      </i>
    </div>
    <div class="counter" v-if="props.maxlength && props.maxlength > 0">{{ modelValue.length }} / {{ props.maxlength }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ExInput' })
import { ref, inject, watch, onBeforeUnmount, computed } from 'vue'
import eyeShow from 'ex-plus/packages/components/icon/eyeShow.vue'
import eyeHide from 'ex-plus/packages/components/icon/eyeHide.vue'
import resolveTextAreaHeight from './resolveTextAreaHeight'
import { formContextKey, formItemContextKey } from 'ex-plus/packages/components/form/src/constants'

import type { InputProps } from './input'
type TargetElement = HTMLInputElement | HTMLTextAreaElement
enum EnumInputTrigger {
  change = 'change',
  blur = 'blur',
}
import type { InputTriggerName } from 'ex-plus/packages/components/form/src/type'

const emits = defineEmits<{
  (eventName: 'update:modelValue', value: string): void
}>()
const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入',
  rows: 2,
  autocomplete: 'off',
  autoHeight: true,
  isStopEnter: true,
})

const exForm = inject(formContextKey, undefined)
const exFormItem = inject(formItemContextKey, undefined)
const refTextarea = ref<HTMLTextAreaElement>()
const refInput = ref<HTMLInputElement>()
const isShowEye = ref(false)

const isDisabled = computed(() => {
  const _arr = [true, false]
  const formDisabled = exForm?.disabled as boolean
  const formItemDisabled = exFormItem?.disabled as boolean
  const disabled = props.disabled as boolean
  if (_arr.includes(formDisabled)) {
    return formDisabled
  }
  if (_arr.includes(formItemDisabled)) {
    return formItemDisabled
  }
  if (_arr.includes(disabled)) {
    return disabled
  }
  return false
})
const passwordType = computed(() => {
  if (isShowEye.value) {
    return 'text'
  }
  return 'password'
})
const isFocus = ref(false)
const isComposing = ref(false)
const isObserver = ref(false)
let observer: IntersectionObserver | null = null

const focusFunc = () => {
  isFocus.value = true
}
const blurFunc = () => {
  isFocus.value = false
  startValidate(EnumInputTrigger.blur)
}
const inputFunc = (e: Event) => {
  if (isComposing.value) {
    return false
  }
  const targetValue = (e.target as TargetElement).value
  updatValue(targetValue)
  startValidate(EnumInputTrigger.change)
}
const compositionStartFunc = () => {
  isComposing.value = true
}
const compositionUpdateFunc = () => {}
const compositionEndFunc = (e: Event) => {
  isComposing.value = false
  const targetValue = (e.target as TargetElement).value
  updatValue(targetValue)
  startValidate(EnumInputTrigger.change)
}
const updatValue = (value: string) => {
  emits('update:modelValue', value)
  setAutoToHeight()
}
const setAutoToHeight = () => {
  if (props.autoHeight && props.type === 'textarea') {
    const targetDom = refTextarea.value
    if (targetDom) {
      const { newHeight, minHeight } = resolveTextAreaHeight(targetDom)
      const orignalheight = minHeight * props.rows
      targetDom.style.height = '0px'
      targetDom.style.height = 'auto'
      targetDom.style.height = (newHeight < orignalheight ? orignalheight : newHeight) + 'px'
      if (!isObserver.value) {
        watchTextareaHeight()
      }
    }
  }
}
const watchTextareaHeight = () => {
  isObserver.value = true
  const targetDom = refTextarea.value as HTMLTextAreaElement
  observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isObserver.value = false
        const { newHeight, minHeight } = resolveTextAreaHeight(targetDom)
        const orignalheight = minHeight * props.rows
        targetDom.style.height = (newHeight < orignalheight ? orignalheight : newHeight) + 'px'
        observer.unobserve(entry.target)
      }
    })
  })
  observer.observe(targetDom)
}
const startValidate = (validType: InputTriggerName) => {
  exFormItem && exFormItem.validate && exFormItem.validate(validType).catch(() => {})
}

watch(
  () => props.modelValue,
  () => {
    setAutoToHeight()
  },
)
onBeforeUnmount(() => {
  observer && observer.unobserve && observer.unobserve(refTextarea.value as HTMLTextAreaElement)
})
</script>

<style scoped>
.exInput {
  position: relative;
  width: 100%;
  padding: 2px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}
.exInput-focus {
  box-shadow: 0 0 0 1px #409eff inset;
}
.exInput-disabled * {
  cursor: not-allowed;
}

.textareaDom,
.inputDom {
  box-sizing: border-box;
  width: 100%;
  display: block;
  outline: none;
  border: 0;
}
.textareaDom {
  box-sizing: border-box;
  width: 100%;
  min-height: 31px;
  padding: 5px 10px;
  line-height: 1.5;
  color: inherit;
  resize: vertical;
  font-size: inherit;
  font-family: inherit;
}

.exInput-input {
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.inputDom {
  height: 30px;
  font-size: inherit;
  font-family: inherit;
  line-height: 30px;
}

.exInput-icon-container {
  width: 20px;
  height: 14px;
  padding-left: 6px;
  user-select: none;
}
.exInput-icon {
  width: 14px;
  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.counter {
  display: inline-flex;
  margin-left: 4px;
  line-height: initial;
  white-space: nowrap;
  flex-shrink: 0;
  flex-wrap: nowrap;
  text-align: center;
  pointer-events: none;
  background-color: #fff;
}
.exInput-textarea .counter {
  position: absolute;
  bottom: 2px;
  right: 10px;
  font-size: 14px;
  line-height: 20px;
}
</style>
