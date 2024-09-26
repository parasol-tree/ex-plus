import { withInstall } from '@/ex-plus/utils'
import Input from './src/input.vue'
import type { SFCWithInstall } from '@/ex-plus/utils'

export const ExInput: SFCWithInstall<typeof Input> = withInstall(Input)
export default ExInput
export * from './src/input'
