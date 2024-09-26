<template>
  <div class="exFormItem" ref="refExFormItem" :style="{ 'padding-bottom': isValidError ? '' : '20px' }">
    <label class="labelDom" :style="{ width: labelWidthReal }">
      {{ props.label }}
      <span class="labelSuffix" v-if="labelSuffixReal">{{ labelSuffixReal }}</span>
    </label>
    <div class="exFormItem-content" :class="[isValidError && 'exFormItem-error']">
      <slot></slot>
      <p class="errorText" v-if="isValidError">{{ errorMessages }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ExFormItem' })
import { ref, inject, toRefs, computed, reactive, onMounted, onBeforeUnmount, provide } from 'vue'
import { isValidValue, get, set, doValidate } from '@/ex-plus/utils'
import { formContextKey, formItemContextKey } from './constants'

import type { ValidateStatus, FormItemContext, FormRuleItem, FormValidateFailure, InputTriggerName } from './type'
import type { FormItemProps } from './formItem'

const props = defineProps<FormItemProps>()

const validateStatus = ref<ValidateStatus>('')
const isValidError = computed(() => validateStatus.value === 'error')
const errorMessages = ref('')
const exForm = inject(formContextKey, undefined)
const initValue = ref('')
const refExFormItem = ref<HTMLDivElement>()

const labelWidthReal = computed(() => {
  if (props.labelWidth) {
    return props?.labelWidth
  }
  return exForm?.labelWidth
})
const labelSuffixReal = computed(() => {
  if (props.labelSuffix) {
    return props.labelSuffix
  }
  return exForm?.labelSuffix
})

const validate: FormItemContext['validate'] = (validType, callback) => {
  const propName = props?.prop ?? ''
  if (!isValidValue(propName)) {
    console.warn('[ExFormItem]"prop" is required for validate to work!')
    callback && callback(false)
    return new Promise((reject) => reject(false))
  }
  const modelValue = exForm?.model
  const rulesValue = exForm?.rules
  const propValue = get(modelValue, propName)
  const currentRule: FormRuleItem[] = get(rulesValue, propName, [])
  if (isValidValue(props.rules)) {
    ;(props.rules as FormRuleItem[]).forEach((item) => {
      currentRule.push(item)
    })
  }

  const valideteRules = filterRulesFunc(currentRule, validType)
  if (!isValidValue(valideteRules)) {
    callback && callback(true)
    return new Promise((resolve) => resolve(true))
  }
  return new Promise((resolve, reject) => {
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
  })
}
const setValidateStatus = (status: ValidateStatus): void => {
  validateStatus.value = status
}
const setValidateMessage = (value: string): void => {
  errorMessages.value = value
}
const clearValidate = () => {
  setValidateStatus('')
  setValidateMessage('')
}
const resetField = () => {
  const model = exForm?.model
  if (model && props.prop) {
    set(model, props.prop, initValue.value)
  }
  clearValidate()
}

const filterRulesFunc = (rules: FormRuleItem[], validType?: InputTriggerName): Array<FormRuleItem> => {
  if (rules.length === 0) {
    return []
  }
  if (!isValidValue(validType)) {
    return rules // 没有 validType 原样返回
    // validType = 'blur'
  }
  const _rulesRequired = rules.filter((ele) => ele.required !== false)
  const _rulesValidType = _rulesRequired.filter((ele) => ele.trigger !== reverseTrigger(validType))
  if (_rulesValidType.length === 0) {
    return []
  }
  return _rulesValidType
}
const reverseTrigger = (validType?: InputTriggerName): InputTriggerName => {
  return validType === 'blur' ? 'change' : 'blur'
}

const context: FormItemContext = reactive({
  ...toRefs(props),
  $el: refExFormItem,
  validate,
  clearValidate,
  resetField,
})

onMounted(() => {
  const model = exForm?.model
  const value = get(model, props.prop as string)
  initValue.value = value
  exForm?.addField(context)
})
onBeforeUnmount(() => {
  exForm?.removeField(context)
})
provide(
  formItemContextKey,
  reactive({
    ...toRefs(props),
    $el: refExFormItem.value,
    validate,
    clearValidate,
    resetField,
  }),
)
defineExpose({
  validate,
  clearValidate,
  resetField,
})
</script>

<style scoped>
.exFormItem {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.labelDom {
  margin: 0;
  padding: 0;
  position: relative;
  padding: 0 10px;
  padding-right: 20px;
  min-height: 34px;
  line-height: 34px;
  font-family: inherit;
  cursor: text;
}
.labelSuffix {
  display: block;
  margin: 0;
  padding: 0;
  height: 100%;
  padding-right: 10px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
  font-size: inherit;
  line-height: 34px;
  font-family: inherit;
}

.exFormItem-content {
  width: 0;
  flex: 1;
}

.exFormItem-error:deep(.exInput) {
  box-shadow: 0 0 0 1px #ed4014 inset;
}
.errorText {
  margin: 0;
  padding: 0;
  color: #ed4014;
  font-size: 14px;
  line-height: 22px;
}
</style>
