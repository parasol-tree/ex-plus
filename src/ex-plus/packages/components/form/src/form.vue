<template>
  <form class="exForm" ref="refExForm">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
defineOptions({ name: 'ExForm' })
import { reactive, toRefs, provide } from 'vue'
import { isValidValue } from '@/ex-plus/utils'
import type { FormItemContext, FormContext } from './type'
import { formContextKey } from './constants'

import type { FormProps } from './form'
import type { FormValidateFailure } from './type'

const props = withDefaults(defineProps<FormProps>(), {})

const fields: FormItemContext[] = []

const addField: FormContext['addField'] = (field) => {
  fields.push(field)
}
const removeField: FormContext['removeField'] = (field) => {
  const index = fields.indexOf(field)
  index >= 0 && fields.splice(index, 1)
}

const validate: FormContext['validate'] = async (callback) => {
  if (!isValidValue(props.model)) {
    console.warn('[ exForm ]"model" is required for validate to work!')
    callback?.(true)
    return Promise.resolve(false)
  }
  return validateField(undefined, callback)
}
const validateField: FormContext['validateField'] = async (prop, callback) => {
  try {
    const res = await startValidate(prop)
    if (res === true) {
      callback?.(res)
    }
    return Promise.resolve(true)
  } catch (err) {
    callback?.(false, err as FormValidateFailure[])
    return Promise.resolve(false)
  }
}
const clearValidate: FormContext['clearValidate'] = (prop) => {
  if (isValidValue(prop)) {
    if (typeof prop === 'string') {
      const currentField = fields.find((field) => field.prop === prop)
      currentField && currentField.clearValidate()
    } else if (Array.isArray(prop)) {
      const list = filterField(prop)
      list.length > 0 && list.forEach((field) => field.clearValidate())
    } else {
      console.warn('[exForm]The parameters type of function "clearValidate" need "string|string[]"')
    }
  } else {
    fields.forEach((field) => field.clearValidate())
  }
}
const resetFields: FormContext['resetFields'] = (prop) => {
  if (isValidValue(prop)) {
    if (typeof prop === 'string') {
      const currentField = fields.find((field) => field.prop === prop)
      currentField && currentField.resetField()
    } else if (Array.isArray(prop)) {
      const list = filterField(prop)
      list.length > 0 && list.forEach((field) => field.resetField())
    } else {
      console.warn('[exForm]The parameters type of function "resetFields" need "string|string[]"')
    }
  } else {
    fields.forEach((field) => field.resetField())
  }
}

const startValidate = async (prop?: string | string[]): Promise<boolean> => {
  const _fields = filterField(prop)
  let errsList = []
  if (_fields.length > 0) {
    for (const field of _fields) {
      try {
        await field.validate()
      } catch (err) {
        errsList.push(err)
      }
    }
  }
  const isSuccess = errsList.length === 0
  return isSuccess ? Promise.resolve(isSuccess) : Promise.reject(errsList)
}
const filterField = (prop?: string | string[]): FormItemContext[] => {
  if (!isValidValue(prop)) {
    return fields
  }
  const result = fields.filter((fied) => {
    return typeof prop === 'string' ? fied.prop === prop : (prop as string[]).includes(fied.prop as string)
  })
  function _customSort(arr: any[], order: string[]) {
    const orderMap: { [key: string]: any } = {}
    order.forEach((item, index) => {
      orderMap[item] = index
    })
    arr.sort((a, b) => orderMap[a.prop] - orderMap[b.prop])
    return arr
  }
  if (Array.isArray(prop)) {
    return _customSort(result, prop) // 按照给定的顺序排序数组对象 ['username', 'email']
  }
  return result
}

provide(
  formContextKey,
  reactive({
    ...toRefs(props),
    addField,
    removeField,
    validate,
    validateField,
    clearValidate,
    resetFields,
  }),
)
defineExpose({
  validate,
  validateField,
  clearValidate,
  resetFields,
})
</script>

<style scoped>
.exForm {
  width: 100%;
  padding-bottom: 10px;
}
</style>
