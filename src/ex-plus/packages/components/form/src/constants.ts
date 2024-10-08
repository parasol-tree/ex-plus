import type { InjectionKey } from 'vue'
import type { FormContext, FormItemContext } from './type'

export const formContextKey: InjectionKey<FormContext> = Symbol('formContextKey')
export const formItemContextKey: InjectionKey<FormItemContext> = Symbol('formItemContextKey')
