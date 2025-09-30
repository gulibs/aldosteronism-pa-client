import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // 返回临时目录字符串
  getTempDir: (): Promise<string> => ipcRenderer.invoke('get-temp-dir'),

  // 写文件，和 main 中的 ipcMain.handle('write-file', ...) 对应
  writeFile: (path: string, data: string): Promise<void> =>
    ipcRenderer.invoke('write-file', { path, data })
})

// 另外暴露 model 调用的便捷 API（renderer 原本期望 window.api.model.predict）
contextBridge.exposeInMainWorld('api', {
  model: {
    predict: (data: { csvPath: string }): Promise<any> => ipcRenderer.invoke('predict-model', data)
  }
})
