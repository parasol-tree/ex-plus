import type { FormRules } from './type'

export interface FormProps {
  model?: { [key: string | number | symbol]: any }
  rules?: FormRules
  labelWidth?: string
  labelSuffix?: string
  disabled?: boolean
}
