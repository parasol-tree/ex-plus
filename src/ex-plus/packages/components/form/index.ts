import { withInstall } from '@/ex-plus/utils'
import Form from './src/form.vue'
import type { SFCWithInstall } from '@/ex-plus/utils'

export const ExForm: SFCWithInstall<typeof Form> = withInstall(Form)
export default ExForm
export * from './src/form'
