import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    // 扩展 ElectronAPI，同时添加自定义方法
    electron: ElectronAPI & {
      getTempDir: () => Promise<string>
      writeFile: (path: string, data: string) => Promise<void>
    }

    api: {
      model: {
        predict: (data: { csvPath: string }) => Promise<any>
      }
    }
  }
}
