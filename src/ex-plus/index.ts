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

export { ExForm, ExFormItem, ExInput }

export default {
  install,
}

export * from 'ex-plus/packages/components/form'
export * from 'ex-plus/packages/components/formItem'
export * from 'ex-plus/packages/components/input'
