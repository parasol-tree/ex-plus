export interface InputProps {
  modelValue?: string
  type?: 'text' | 'password' | 'textarea'
  placeholder?: string
  maxlength?: number
  rows?: number
  autocomplete?: 'on' | 'off'
  autoHeight?: boolean
  isStopEnter?: boolean
  disabled?: boolean
}
