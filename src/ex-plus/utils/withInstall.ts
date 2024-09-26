import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export const withInstall = <T>(copm: T) => {
  ;(copm as SFCWithInstall<T>).install = (app: App): void => {
    app.component((copm as any).name, copm as any)
  }
  return copm as SFCWithInstall<T>
}
