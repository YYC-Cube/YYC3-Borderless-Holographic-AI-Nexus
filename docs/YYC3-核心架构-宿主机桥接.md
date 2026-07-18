---
@file: YYC3-核心架构-宿主机桥接.md
@description: 核心架构 - 宿主机桥接（Tauri）提示词
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-06-15
@updated: 2026-06-15
@status: stable
@tags: architecture,host-bridge,tauri
@category: prompt-system
@language: zh-CN
@design_type: prompt-engineering
@review_status: approved
@audience: developers,ai-engineers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ 核心架构 - 宿主机桥接

## 📋 阶段信息

- **阶段编号**: P0-02
- **阶段名称**: 宿主机桥接（Tauri）
- **优先级**: 🔴 P0-Critical
- **复杂度**: 高级
- **预计时间**: 2-3小时
- **可实现性**: ✅ 一次可实现

---

## 🎯 阶段目标

实现统一的宿主机原生能力桥接层，封装文件系统、对话框、系统通知等原生 API，提供 Promise-based、Type-safe 的接口。

---

## 📝 输入定义

### 前置条件

- ✅ P0-01-架构-项目初始化阶段已完成
- ✅ Tauri CLI 已安装
- ✅ Tauri API 已安装：@tauri-apps/api@{{TAURI_API_VERSION}}

### 依赖关系

- 依赖 P0-01-架构-项目初始化阶段

### 输入数据

```json
{
  "hostBridgeAPI": {
    "fileSystem": {
      "readFile": "boolean",
      "writeFile": "boolean",
      "readDir": "boolean",
      "createDir": "boolean",
      "removeDir": "boolean",
      "removeFile": "boolean",
      "renameFile": "boolean",
      "exists": "boolean"
    },
    "dialog": {
      "open": "boolean",
      "save": "boolean"
    },
    "notification": {
      "send": "boolean"
    },
    "system": {
      "exec": "boolean",
      "watch": "boolean"
    }
  }
}
```

---

## 🚀 提示词执行

### 完整提示词

```text
You are a senior full‑stack architect and Tauri specialist with deep expertise in native system integration, Rust backend development, and cross-platform desktop application development.

## Your Role & Expertise

You are an experienced systems architect who specializes in:
- **Desktop Applications**: Tauri, Electron, native system APIs
- **Backend Development**: Rust, C++, system-level programming
- **File Systems**: Native file system APIs, file dialogs, file watchers
- **System Integration**: OS-specific APIs, native bridges, IPC communication
- **Security**: File permissions, sandboxing, secure data handling
- **Performance**: Async I/O, memory management, optimization strategies
- **Cross-Platform**: Windows, macOS, Linux compatibility

## Your Task

Your task is to implement a **HostBridge** layer for YYC³ AI Code.

## Project Information

- **Project Name**: {{PROJECT_NAME}}
- **Team**: {{TEAM_NAME}}
- **Contact**: {{CONTACT_EMAIL}}

## Technical Stack

- **Native Bridge**: Tauri {{TAURI_API_VERSION}}
- **Type System**: TypeScript 5.3.3
- **Runtime**: Rust (Tauri backend)

## Code Standards

**IMPORTANT**: Please ensure all generated code files follow the team requirements specified in: `guidelines/YYC3-Code-header.md`

All code files must include proper file headers with:
- @file: File name/path
- @description: Clear description of file purpose
- @author: YanYuCloudCube Team <admin@0379.email>
- @version: Semantic version (v1.0.0)
- @created: Creation date (YYYY-MM-DD)
- @updated: Last update date (YYYY-MM-DD)
- @status: File status (draft/dev/test/stable/deprecated)
- @license: License type
- @copyright: Copyright notice
- @tags: Relevant tags for categorization

## HostBridge Requirements

### 1. File System API

Implement unified file system interface:

```typescript
// packages/core/src/bridge/host.ts
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import {
  readTextFile,
  writeFile,
  readDir,
  createDir,
  removeDir,
  removeFile,
  renameFile,
  exists,
  BaseDirectory
} from '@tauri-apps/api/fs';

export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  modified: number;
  isFile: boolean;
  isDir: boolean;
}

export interface FileWatcherEvent {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: number;
}

export interface FileWatcherCallback {
  (event: FileWatcherEvent): void;
}

export interface FileWatcherHandle {
  unwatch: () => Promise<void>;
}

/**
 * 统一的文件系统接口，内部自行决定是 IndexedDB 还是原生文件系统
 */
export const HostBridge = {
  /** 读取用户选定的文件 */
  async pickAndReadFile(): Promise<{ path: string; content: string }> {
    const path = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt', 'md', 'json', 'ts', 'tsx', 'js', 'jsx']
        },
        {
          name: 'All Files',
          extensions: ['*']
        }
      ]
    });

    if (!path) {
      throw new Error('User cancelled file picking');
    }

    // 读取内容（示例：文本文件）
    const content = await readTextFile(path as string, {
      directory: BaseDirectory.Desktop
    });

    return { path: path as string, content };
  },

  /** 读取文件内容 */
  async readFile(path: string): Promise<string> {
    const content = await readTextFile(path);
    return content;
  },

  /** 写入文件到用户指定目录 */
  async writeFile(filename: string, data: Uint8Array | string): Promise<string> {
    const savePath = await invoke('save_dialog', {
      defaultPath: filename,
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt', 'md', 'json', 'ts', 'tsx']
        }
      ]
    });

    if (!savePath) {
      throw new Error('User cancelled save dialog');
    }

    await writeFile(savePath as string, data, {
      directory: BaseDirectory.Desktop
    });

    return savePath as string;
  },

  /** 读取目录内容 */
  async readDir(path: string): Promise<FileMetadata[]> {
    const entries = await readDir(path, {
      dir: BaseDirectory.Desktop,
      recursive: false
    });

    return entries.map(entry => ({
      path: `${path}/${entry.name}`,
      name: entry.name,
      size: entry.children ? 0 : (entry as any).size || 0,
      modified: 0,
      isFile: !entry.children,
      isDir: !!entry.children,
    }));
  },

  /** 创建目录 */
  async createDir(path: string): Promise<void> {
    await createDir(path, {
      dir: BaseDirectory.Desktop,
      recursive: true
    });
  },

  /** 删除目录 */
  async removeDir(path: string): Promise<void> {
    await removeDir(path, {
      dir: BaseDirectory.Desktop,
      recursive: true
    });
  },

  /** 删除文件 */
  async removeFile(path: string): Promise<void> {
    await removeFile(path, {
      dir: BaseDirectory.Desktop
    });
  },

  /** 重命名文件 */
  async renameFile(oldPath: string, newPath: string): Promise<void> {
    await renameFile(oldPath, newPath, {
      dir: BaseDirectory.Desktop
    });
  },

  /** 检查文件是否存在 */
  async fileExists(path: string): Promise<boolean> {
    return await exists(path, {
      dir: BaseDirectory.Desktop
    });
  },

  /** 监控文件变化 */
  async watchFile(path: string, callback: FileWatcherCallback): Promise<FileWatcherHandle> {
    const unwatch = await invoke('watch_file', { path });

    // 在 Rust 端实现文件监控，通过事件回调通知前端
    const handle = (event: FileWatcherEvent) => {
      callback(event);
    };

    // 注册事件监听器
    window.addEventListener('file-watch-event', handle as EventListener);

    return {
      unwatch: async () => {
        await unwatch;
        window.removeEventListener('file-watch-event', handle as EventListener);
      }
    };
  },

  /** 批量读取文件 */
  async readFiles(paths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const path of paths) {
      try {
        const content = await this.readFile(path);
        results.set(path, content);
      } catch (error) {
        console.error(`Failed to read file ${path}:`, error);
      }
    }

    return results;
  },

  /** 批量写入文件 */
  async writeFiles(files: Map<string, Uint8Array | string>): Promise<void> {
    for (const [path, data] of files.entries()) {
      try {
        await this.writeFile(path, data);
      } catch (error) {
        console.error(`Failed to write file ${path}:`, error);
      }
    }
  },

  /** 获取文件元数据 */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    const exists = await this.fileExists(path);

    if (!exists) {
      throw new Error(`File not found: ${path}`);
    }

    // 尝试读取文件信息
    try {
      const content = await this.readFile(path);
      return {
        path,
        name: path.split('/').pop() || '',
        size: content.length,
        modified: Date.now(),
        isFile: true,
        isDir: false,
      };
    } catch (error) {
      // 如果读取失败，可能是目录
      const entries = await this.readDir(path);
      return {
        path,
        name: path.split('/').pop() || '',
        size: 0,
        modified: Date.now(),
        isFile: false,
        isDir: true,
      };
    }
  },
} as const;
```

### 2. Dialog API

Implement unified dialog interface:

```typescript
// packages/core/src/bridge/dialog.ts
import { open, save } from '@tauri-apps/api/dialog';

export interface DialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  multiple?: boolean;
  directory?: boolean;
}

export interface DialogResult {
  path: string | null;
  paths: string[] | null;
}

/**
 * 统一的对话框接口
 */
export const DialogBridge = {
  /** 打开文件对话框 */
  async openFile(options: DialogOptions = {}): Promise<DialogResult> {
    const path = await open({
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
      multiple: options.multiple || false,
      directory: options.directory || false,
    });

    return {
      path: path as string || null,
      paths: Array.isArray(path) ? path : null,
    };
  },

  /** 保存文件对话框 */
  async saveFile(options: DialogOptions = {}): Promise<string | null> {
    const path = await save({
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
    });

    return path as string || null;
  },

  /** 选择目录对话框 */
  async selectDirectory(options: DialogOptions = {}): Promise<string | null> {
    const path = await open({
      title: options.title,
      defaultPath: options.defaultPath,
      directory: true,
    });

    return path as string || null;
  },
} as const;
```

### 3. Notification API

Implement unified notification interface:

```typescript
// packages/core/src/bridge/notification.ts
import { invoke } from '@tauri-apps/api/tauri';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  sound?: string;
  timeout?: number;
}

/**
 * 统一的通知接口
 */
export const NotificationBridge = {
  /** 发送系统通知 */
  async send(options: NotificationOptions): Promise<void> {
    await invoke('send_notification', {
      title: options.title,
      body: options.body,
      icon: options.icon,
      sound: options.sound,
      timeout: options.timeout || 5000,
    });
  },

  /** 发送成功通知 */
  async success(message: string): Promise<void> {
    await this.send({
      title: '成功',
      body: message,
      icon: '/icons/success.png',
      sound: 'default',
    });
  },

  /** 发送错误通知 */
  async error(message: string): Promise<void> {
    await this.send({
      title: '错误',
      body: message,
      icon: '/icons/error.png',
      sound: 'error',
    });
  },

  /** 发送警告通知 */
  async warning(message: string): Promise<void> {
    await this.send({
      title: '警告',
      body: message,
      icon: '/icons/warning.png',
      sound: 'warning',
    });
  },

  /** 发送信息通知 */
  async info(message: string): Promise<void> {
    await this.send({
      title: '信息',
      body: message,
      icon: '/icons/info.png',
      sound: 'default',
    });
  },
} as const;
```

### 4. System API

Implement unified system interface:

```typescript
// packages/core/src/bridge/system.ts
import { invoke } from '@tauri-apps/api/tauri';

export interface SystemInfo {
  os: string;
  arch: string;
  version: string;
  hostname: string;
  username: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}

/**
 * 统一的系统接口
 */
export const SystemBridge = {
  /** 获取系统信息 */
  async getSystemInfo(): Promise<SystemInfo> {
    return await invoke('get_system_info');
  },

  /** 获取进程信息 */
  async getProcessInfo(): Promise<ProcessInfo> {
    return await invoke('get_process_info');
  },

  /** 执行系统命令 */
  async execCommand(command: string, args: string[] = []): Promise<string> {
    return await invoke('exec_command', { command, args });
  },

  /** 打开外部应用 */
  async openUrl(url: string): Promise<void> {
    await invoke('open_url', { url });
  },

  /** 获取剪贴板内容 */
  async readClipboard(): Promise<string> {
    return await invoke('read_clipboard');
  },

  /** 写入剪贴板内容 */
  async writeClipboard(text: string): Promise<void> {
    await invoke('write_clipboard', { text });
  },

  /** 监控系统资源 */
  async watchResources(callback: (info: ProcessInfo) => void): Promise<() => void> {
    const unwatch = await invoke('watch_resources');

    const handle = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('resource-watch-event', handle as EventListener);

    return () => {
      unwatch();
      window.removeEventListener('resource-watch-event', handle as EventListener);
    };
  },
} as const;
```

### 5. Rust Backend Implementation

Implement Rust backend for Tauri:

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn pick_file() -> Result<String, String> {
    use tauri::api::dialog::FileDialogBuilder;

    let dialog = FileDialogBuilder::new()
        .set_title("选择文件")
        .add_filter("文本文件", &["txt", "md", "json", "ts", "tsx"])
        .add_filter("所有文件", &["*"]);

    let path = dialog.pick_file();

    match path {
        Some(p) => Ok(p),
        None => Err("用户取消选择".to_string()),
    }
}

#[tauri::command]
fn save_file(default_path: String) -> Result<String, String> {
    use tauri::api::dialog::FileDialogBuilder;

    let dialog = FileDialogBuilder::new()
        .set_title("保存文件")
        .set_file_name(&default_path)
        .add_filter("文本文件", &["txt", "md", "json", "ts", "tsx"]);

    let path = dialog.save_file();

    match path {
        Some(p) => Ok(p),
        None => Err("用户取消保存".to_string()),
    }
}

#[tauri::command]
fn watch_file(path: String) -> Result<String, String> {
    use std::fs;
    use std::sync::mpsc;
    use tauri::Manager;

    let (tx, rx) = mpsc::channel();

    // 启动文件监控线程
    std::thread::spawn(move || {
        let mut watcher = notify::recommended_watcher(&path).unwrap();

        loop {
            match watcher.recv() {
                Ok(event) => {
                    let event_type = match event.kind {
                        notify::EventKind::Create(_) => "created",
                        notify::EventKind::Modify(_) => "modified",
                        notify::EventKind::Remove(_) => "deleted",
                        _ => continue,
                    };

                    let event_data = serde_json::json!({
                        "path": path.clone(),
                        "type": event_type,
                        "timestamp": chrono::Utc::now().timestamp_millis(),
                    });

                    // 发送事件到前端
                    tx.send(event_data).unwrap();
                }
                Err(e) => {
                    eprintln!("watch error: {:?}", e);
                    break;
                }
            }
        }
    });

    Ok("watch_started".to_string())
}

#[tauri::command]
fn send_notification(title: String, body: String) -> Result<(), String> {
    use tauri::api::notification::Notification;

    let notification = Notification::new()
        .title(&title)
        .body(&body)
        .show();

    Ok(())
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    use sysinfo::System;

    let system = System::new_all();

    Ok(SystemInfo {
        os: system.name().unwrap_or("unknown".to_string()),
        arch: system.architecture().unwrap_or("unknown".to_string()),
        version: system.os_version().unwrap_or("unknown".to_string()),
        hostname: system.host_name().unwrap_or("unknown".to_string()),
        username: system.username().unwrap_or("unknown".to_string()),
    })
}

#[tauri::command]
fn exec_command(command: String, args: Vec<String>) -> Result<String, String> {
    use std::process::Command;

    let output = Command::new(&command)
        .args(&args)
        .output();

    match output {
        Ok(output) => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
        Err(e) => Err(format!("执行命令失败: {}", e)),
    }
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    let result = Command::new("cmd")
        .args(&["/C", "start", "", &url])
        .spawn();

    #[cfg(target_os = "macos")]
    let result = Command::new("open")
        .arg(&url)
        .spawn();

    #[cfg(target_os = "linux")]
    let result = Command::new("xdg-open")
        .arg(&url)
        .spawn();

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("打开URL失败: {}", e)),
    }
}

#[tauri::command]
fn read_clipboard() -> Result<String, String> {
    use arboard::Clipboard;

    let clipboard = Clipboard::new();

    match clipboard.get_text() {
        Ok(text) => Ok(text),
        Err(e) => Err(format!("读取剪贴板失败: {}", e)),
    }
}

#[tauri::command]
fn write_clipboard(text: String) -> Result<(), String> {
    use arboard::Clipboard;

    let clipboard = Clipboard::new();

    match clipboard.set_text(&text) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("写入剪贴板失败: {}", e)),
    }
}

#[tauri::command]
fn watch_resources() -> Result<String, String> {
    use sysinfo::{System, SystemExt};

    let (tx, rx) = mpsc::channel();

    std::thread::spawn(move || {
        let mut system = System::new_all();

        loop {
            system.refresh_all();

            let process_info = ProcessInfo {
                pid: std::process::id(),
                name: "app".to_string(),
                cpu: system.global_cpu_info().cpu_usage,
                memory: system.total_memory() - system.available_memory(),
            };

            tx.send(process_info).unwrap();

            std::thread::sleep(std::time::Duration::from_secs(1));
        }
    });

    Ok("watch_started".to_string())
}

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    os: String,
    arch: String,
    version: String,
    hostname: String,
    username: String,
}

#[derive(Serialize, Deserialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu: f32,
    memory: u64,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            pick_file,
            save_file,
            watch_file,
            send_notification,
            get_system_info,
            exec_command,
            open_url,
            read_clipboard,
            write_clipboard,
            watch_resources,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 6. Tauri Configuration

Update Tauri configuration:

```json
// tauri.conf.json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devPath": "http://localhost:{{PORT}}",
    "distDir": "../dist"
  },
  "package": {
    "productName": "{{PROJECT_NAME}}",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true,
        "renameFile": true,
        "exists": true,
        "scope": ["**"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "notification": {
        "all": false,
        "send": true
      },
      "shell": {
        "all": false,
        "execute": true,
        "open": true
      },
      "clipboard": {
        "all": false,
        "readText": true,
        "writeText": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.yyc3.{{PROJECT_SLUG}}",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": {
      "title": "{{PROJECT_NAME}}",
      "width": 1280,
      "height": 800,
      "resizable": true,
      "fullscreen": false
    }
  }
}
```

### 7. Cargo Dependencies

Add required Rust dependencies:

```toml
# src-tauri/Cargo.toml
[package]
name = "app"
version = "1.0.0"
description = "{{PROJECT_NAME}}"
authors = ["{{TEAM_NAME}}"]
license = "{{LICENSE}}"
repository = "https://github.com/YYC-Cube/{{PROJECT_SLUG}}"
edition = "2021"

[dependencies]
tauri = { version = "1.5", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
notify = "6.0"
chrono = "0.4"
sysinfo = "0.30"
arboard = "3.0"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }
```

## Output Requirements

### Generated Files

1. ✅ `packages/core/src/bridge/host.ts` - HostBridge interface
2. ✅ `packages/core/src/bridge/dialog.ts` - DialogBridge interface
3. ✅ `packages/core/src/bridge/notification.ts` - NotificationBridge interface
4. ✅ `packages/core/src/bridge/system.ts` - SystemBridge interface
5. ✅ `src-tauri/src/main.rs` - Rust backend implementation
6. ✅ `tauri.conf.json` - Updated Tauri configuration
7. ✅ `src-tauri/Cargo.toml` - Updated Cargo dependencies

### Type Definitions

1. ✅ `FileMetadata` - File metadata interface
2. ✅ `FileWatcherEvent` - File watcher event interface
3. ✅ `FileWatcherCallback` - File watcher callback type
4. ✅ `FileWatcherHandle` - File watcher handle interface
5. ✅ `DialogOptions` - Dialog options interface
6. ✅ `DialogResult` - Dialog result interface
7. ✅ `NotificationOptions` - Notification options interface
8. ✅ `SystemInfo` - System information interface
9. ✅ `ProcessInfo` - Process information interface

## Verification Steps

### 1. Install Rust Dependencies

\`\`\`bash
cd src-tauri
cargo build
\`\`\`

**Expected**: Rust dependencies installed and compiled successfully.

### 2. Test File System API

\`\`\`typescript
// Test file picking
const { path, content } = await HostBridge.pickAndReadFile();
console.log('File content:', content);

// Test file writing
const savePath = await HostBridge.writeFile('test.txt', 'Hello, World!');
console.log('File saved to:', savePath);

// Test directory reading
const entries = await HostBridge.readDir('/path/to/dir');
console.log('Directory entries:', entries);
\`\`\`

**Expected**: All file system operations work correctly.

### 3. Test Dialog API

\`\`\`typescript
// Test open file dialog
const result = await DialogBridge.openFile({
  title: '选择文件',
  filters: [
    {
      name: 'Text Files',
      extensions: ['txt', 'md']
    }
  ]
});
console.log('Selected file:', result.path);

// Test save file dialog
const savePath = await DialogBridge.saveFile({
  title: '保存文件',
  defaultPath: 'test.txt',
  filters: [
    {
      name: 'Text Files',
      extensions: ['txt', 'md']
    }
  ]
});
console.log('File saved to:', savePath);
\`\`\`

**Expected**: All dialog operations work correctly.

### 4. Test Notification API

\`\`\`typescript
// Test success notification
await NotificationBridge.success('操作成功！');

// Test error notification
await NotificationBridge.error('操作失败！');

// Test warning notification
await NotificationBridge.warning('请注意！');

// Test info notification
await NotificationBridge.info('提示信息');
\`\`\`

**Expected**: All notifications are displayed correctly.

### 5. Test System API

\`\`\`typescript
// Test system info
const systemInfo = await SystemBridge.getSystemInfo();
console.log('System info:', systemInfo);

// Test command execution
const output = await SystemBridge.execCommand('ls', ['-la']);
console.log('Command output:', output);

// Test clipboard
await SystemBridge.writeClipboard('Hello, Clipboard!');
const clipboard = await SystemBridge.readClipboard();
console.log('Clipboard content:', clipboard);
\`\`\`

**Expected**: All system operations work correctly.

## Success Criteria

- ✅ All interfaces are created
- ✅ File system API works correctly
- ✅ Dialog API works correctly
- ✅ Notification API works correctly
- ✅ System API works correctly
- ✅ Rust backend compiles successfully
- ✅ Tauri configuration is updated
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ All files formatted correctly

---

<div align="center">

> **「YanYuCloudCube」**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for Future**
> **万象归元于云枢 | 深栈智启新纪元**
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

</div>
```

---

## 📤 输出生成

### 生成文件

执行上述提示词后，应该生成以下文件：

1. `packages/core/src/bridge/host.ts`
2. `packages/core/src/bridge/dialog.ts`
3. `packages/core/src/bridge/notification.ts`
4. `packages/core/src/bridge/system.ts`
5. `src-tauri/src/main.rs`
6. `tauri.conf.json`
7. `src-tauri/Cargo.toml`

---

## ✅ 验收标准

### 功能验收

- ✅ 文件系统 API 可以正常工作
- ✅ 对话框 API 可以正常工作
- ✅ 通知 API 可以正常工作
- ✅ 系统 API 可以正常工作
- ✅ 文件监控可以正常工作
- ✅ 剪贴板操作可以正常工作

### 代码质量验收

- ✅ 无 TypeScript 编译错误
- ✅ 无 ESLint 错误
- ✅ 所有文件格式正确
- ✅ 代码符合规范
- ✅ 接口设计合理

### 安全验收

- ✅ Tauri 配置正确设置权限
- ✅ 文件访问遵循最小权限原则
- ✅ 没有硬编码的敏感信息

---

## 🎯 下一步

完成本阶段后，请继续执行：

1. **[P0-03-架构-本地存储](./YYC3-P0-架构-本地存储.md)** - 实现本地存储
2. **[P0-04-架构-构建配置](./YYC3-P0-架构-构建配置.md)** - 配置构建工具
3. **[P1-01-前端-多面板布局](../P1-核心功能/YYC3-P1-前端-多面板布局.md)** - 实现多面板布局

---

<div align="center">

> **「YanYuCloudCube」**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for Future**
> **万象归元于云枢 | 深栈智启新纪元**
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

</div>
