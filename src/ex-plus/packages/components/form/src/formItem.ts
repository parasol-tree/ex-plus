import type { FormRuleItem } from './type'

export interface FormItemProps {
  label?: string
  labelWidth?: string
  labelSuffix?: string
  prop?: string
  rules?: FormRuleItem[]
  disabled?: boolean
}
