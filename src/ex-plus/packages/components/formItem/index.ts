import { withInstall } from '@/ex-plus/utils'
import FormItem from '../form/src/formItem.vue'
import type { SFCWithInstall } from '@/ex-plus/utils'

export const ExFormItem: SFCWithInstall<typeof FormItem> = withInstall(FormItem)
export default ExFormItem
export * from 'ex-plus/packages/components/form/src/formItem'
