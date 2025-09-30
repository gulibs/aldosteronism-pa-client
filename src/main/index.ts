import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import icon from '../../resources/icon.icns?asset'
import runMac from '../../resources/run?asset'
import runWin from '../../resources/run.exe?asset'

const isDev = is.dev || !app.isPackaged

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'icon.icns'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: isDev
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/' })
  }
}

ipcMain.handle('get-temp-dir', () => {
  return app.getPath('temp')
})

ipcMain.handle('write-file', async (_, data: { path: string; data: string }) => {
  try {
    await writeFile(data.path, data.data)
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`)
  }
})

ipcMain.handle('predict-model', async (_, data: { csvPath: string }) => {
  const isPackaged = app.isPackaged
  // Get the correct path for the run executable
  // const runPath = isPackaged
  //   ? join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'run')
  //   : run
  let runPath = ''
  if (isPackaged) {
    if (process.platform === 'win32') {
      runPath = join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'run.exe')
    } else if (process.platform === 'darwin') {
      runPath = join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'run')
    }
  } else {
    if (process.platform === 'win32') {
      runPath = runWin
    } else if (process.platform === 'darwin') {
      runPath = runMac
    }
  }

  return new Promise((resolve, reject) => {
    const child = spawn(runPath, [data.csvPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (c: Buffer) => {
      stdout += c.toString()
    })
    child.stderr.on('data', (c: Buffer) => {
      stderr += c.toString()
    })
    child.on('close', (code: number) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout))
        } catch (e: any) {
          reject(
            new Error(`Failed to parse JSON: ${e?.message}\nStdout:${stdout}\nStderr:${stderr}`)
          )
        }
      } else {
        reject(new Error(`Model executable exited with code ${code}: ${stderr || stdout}`))
      }
    })
    child.on('error', (err: Error) =>
      reject(new Error(`Failed to run model executable: ${err.message}`))
    )
  })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.kanghuajuntai')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
    // 屏蔽快捷键 Ctrl/Cmd+Shift+I 和 F12
    window.webContents.on('before-input-event', (event, input) => {
      const key = input.key ? input.key.toLowerCase() : ''
      const ctrlOrCmd = input.control || input.meta
      const shift = input.shift

      if ((ctrlOrCmd && shift && key === 'i') || key === 'f12') {
        event.preventDefault()
      }
    })

    // 如果 DevTools 被打开，立即关闭（防止其它手段打开）
    window.webContents.on('devtools-opened', () => {
      window.webContents.closeDevTools()
    })
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
