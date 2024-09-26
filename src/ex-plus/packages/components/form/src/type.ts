import type { RuleItem, ValidateError, ValidateFieldsError } from 'async-validator'
import Form from './form.vue'

export type InputTriggerName = 'change' | 'blur'
export interface FormRuleItem extends RuleItem {
  trigger?: InputTriggerName
}
export interface FormRules {
  [key: string | number | symbol]: FormRuleItem[]
}
export type ValidateStatus = 'success' | 'error' | ''
export interface FormValidateFailure {
  errors: ValidateError[]
  fields: ValidateFieldsError
}
export type ValidateCallback = (isValid: boolean, validErr?: FormValidateFailure[]) => Promise<void> | void
/**
 * @description 组件 ExForm 上下文 类型
 */
export interface FormContext {
  model?: { [key: string | number | symbol]: any }
  rules?: FormRules
  labelWidth?: string
  labelSuffix?: string
  disabled?: boolean
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
  validate: (callback?: ValidateCallback) => Promise<boolean>
  validateField: (prop?: string | string[], callback?: ValidateCallback) => Promise<boolean>
  clearValidate: (prop?: string | string[]) => void
  resetFields: (prop?: string | string[]) => void
}
/**
 * @description 组件 ExFormItem 上下文 类型
 */
export interface FormItemContext {
  $el: HTMLDivElement | undefined
  label?: string
  labelWidth?: string
  labelSuffix?: string
  for?: string
  prop?: string
  rules?: FormRuleItem[]
  disabled?: boolean
  validate: (validType?: InputTriggerName, callback?: (vaid: boolean, err?: FormValidateFailure) => void) => Promise<boolean>
  clearValidate: () => void
  resetField: () => void
}

export type FormInstance = InstanceType<typeof Form>
