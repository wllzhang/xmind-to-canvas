# 开发文档

## 项目结构

```
xmindtocanvas/
├── .github/workflows/       # GitHub Actions CI/CD
├── src/                     # 源代码
│   ├── main.ts             # 插件入口
│   ├── xmind-parser.ts     # XMind 解析器
│   ├── layout-calculator.ts # 布局计算
│   ├── canvas-generator.ts  # Canvas 生成器
│   └── types.ts            # 类型定义
├── manifest.json           # 插件清单
├── package.json           # 依赖管理
└── README.md              # 使用说明
```

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

这会启动 Rollup 监视模式，自动重新编译代码更改。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 代码检查

```bash
npm run lint
```

修复 lint 错误：

```bash
npm run lint:fix
```

## 在 Obsidian 中测试

### 方法 1：符号链接（推荐）

在你的 Obsidian vault 的插件目录创建符号链接：

**Windows (PowerShell 管理员):**
```powershell
New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\xmind-to-canvas" -Target "C:\path\to\xmindtocanvas"
```

**macOS/Linux:**
```bash
ln -s /path/to/xmindtocanvas /path/to/vault/.obsidian/plugins/xmind-to-canvas
```

### 方法 2：直接复制

复制以下文件到 vault 的插件目录：
- `main.js`
- `manifest.json`
- `styles.css`

### 测试步骤

1. 在 Obsidian 中启用开发者模式（Settings → Community plugins → Turn off safe mode）
2. 启用 "XMind to Canvas" 插件
3. 将 `test.xmind` 复制到你的 vault
4. 右键点击 .xmind 文件，选择 "Convert to Canvas"
5. 检查生成的 .canvas 文件

## 技术架构

### 数据流

```
XMind 文件 (.xmind)
    ↓
XMindParser (使用 xmind SDK)
    ↓
XMindWorkbook (内部数据结构)
    ↓
LayoutCalculator (使用 ELK.js)
    ↓
布局后的图形数据
    ↓
CanvasGenerator
    ↓
JSON Canvas (.canvas)
```

### 关键组件

#### XMindParser
- 使用官方 xmind SDK
- 支持多种 XMind 版本
- 递归提取节点树

#### LayoutCalculator
- 集成 ELK.js 布局引擎
- 使用 `mrtree` 算法（适合思维导图）
- 自动计算节点位置

#### CanvasGenerator
- 转换为 JSON Canvas 格式
- 符合 jsoncanvas.org 规范
- 生成节点和边的定义

## 发布流程

### 1. 更新版本号

同步更新以下文件中的版本号：
- `manifest.json`
- `package.json`
- `versions.json`

### 2. 更新变更日志

在 `CHANGELOG.md` 中记录变更。

### 3. 提交并打标签

```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### 4. 自动发布

GitHub Actions 会自动：
- 构建插件
- 创建 Release
- 上传构建产物

## 调试技巧

### 1. 查看控制台日志

在 Obsidian 中按 `Ctrl+Shift+I` (或 `Cmd+Option+I` on macOS) 打开开发者工具。

### 2. 重新加载插件

修改代码后：
1. `Ctrl+P` 打开命令面板
2. 搜索 "Reload app without saving"
3. 或完全重启 Obsidian

### 3. 常见问题

**问题：插件不加载**
- 检查 `main.js` 是否存在
- 查看控制台错误信息
- 确认 `manifest.json` 格式正确

**问题：XMind 解析失败**
- 确认 xmind SDK 正确安装
- 检查 XMind 文件格式版本
- 查看错误日志

**问题：布局不正确**
- 调整 `ConversionOptions` 参数
- 尝试不同的布局算法（layered/mrtree）
- 检查节点尺寸设置

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License
