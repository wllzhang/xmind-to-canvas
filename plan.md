# XMind 转 Canvas Obsidian 插件开发计划

## 技术方案

### XMind 文件解析

**采用方案：使用 XMind 官方 SDK**

使用 `xmind` (官方 JavaScript SDK) 来解析 XMind 文件：

- XMind 官方维护，支持多种 XMind 版本（legacy、Zen、2020+）
- 已处理格式兼容性和边缘情况
- 提供标准化的数据结构输出
- 支持浏览器和 Node.js 环境

这种方案的优势：

- 开发速度快，无需研究文件格式细节
- 兼容性好，支持不同版本的 XMind 文件
- 稳定可靠，经过官方测试和社区验证
- 后续 XMind 格式更新时官方会跟进维护

### JSON Canvas 目标格式

根据 [`test.canvas`](test.canvas) 文件，需要生成：

- `nodes` 数组：包含节点的 id、type、text、位置（x, y）、尺寸（width, height）
- `edges` 数组：包含连接的 id、fromNode、toNode、fromSide、toSide

## 实现步骤

### 1. 插件基础结构

创建标准的 Obsidian 插件项目：

- TypeScript 配置和构建系统
- `manifest.json` - 插件元数据
- `main.ts` - 插件主文件
- 依赖管理（package.json）

### 2. XMind 解析模块

集成 XMind 官方 SDK 实现文件解析：

- 使用 `xmind` SDK 加载 .xmind 文件
- 调用 SDK API 获取思维导图数据结构
- 遍历节点树，提取节点信息（标题、层级、关系）
- 处理不同版本 XMind 文件的兼容性

### 3. 布局计算（使用 ELK.js）

使用专业的图形布局引擎处理节点布局：

- 集成 **ELK.js** (Eclipse Layout Kernel) 布局引擎
- 将 XMind 树形结构转换为 ELK 图形数据格式
- 配置布局算法：使用 `mrtree` 或 `layered` 算法（适合思维导图）
- 设置布局参数：方向（从左到右）、节点间距、层级间距
- 执行布局计算，获取每个节点的最终坐标
- 复杂度可控：只需数据转换 + API 调用，约 50-100 行代码

### 4. Canvas 生成模块

将解析后的结构转换为 JSON Canvas 格式：

- 生成节点对象（id、type、text、坐标、尺寸）
- 生成连接边对象（id、fromNode、toNode）
- 格式化为符合 [JSON Canvas 规范](https://jsoncanvas.org/spec/1.0/) 的 JSON

### 5. Obsidian 集成

实现插件的用户交互功能：

- 添加命令面板命令："转换 XMind 文件"
- 添加文件菜单选项（右键 .xmind 文件）
- 实现文件选择和保存逻辑
- 错误处理和用户提示

### 6. 测试和优化

使用 [`test.xmind`](test.xmind) 验证：

- 测试基本转换功能
- 验证输出格式正确性
- 处理边缘情况（空节点、深层嵌套等）
- 性能优化（大型思维导图）

### 7. CI/CD 配置

设置自动化构建和发布流程：

- 配置 **GitHub Actions** 工作流
- 自动化构建：代码提交时自动编译和打包
- 自动化测试：运行代码检查（lint、类型检查）
- 自动化发布：
  - 检测版本标签（如 `v1.0.0`）
  - 自动构建 release 资产（main.js、manifest.json、styles.css）
  - 创建 GitHub Release
  - 生成版本更新日志
- 版本管理：自动同步 manifest.json 和 package.json 版本号

## 关键文件结构

```
xmindtocanvas/
├── .github/
│   └── workflows/
│       └── release.yml      # CI/CD 发布流程
├── src/
│   ├── main.ts              # 插件入口
│   ├── xmind-parser.ts      # XMind 解析器
│   ├── layout-calculator.ts # 布局计算
│   ├── canvas-generator.ts  # Canvas 生成器
│   └── types.ts             # 类型定义
├── manifest.json            # 插件清单
├── package.json             # 依赖管理
├── tsconfig.json            # TypeScript 配置
├── rollup.config.js         # 构建配置
├── .eslintrc.json           # 代码规范配置（可选）
└── README.md                # 项目说明
```

## 依赖包

- `obsidian` - Obsidian API
- `xmind` - XMind 官方 JavaScript SDK
- `elkjs` - 专业图形布局引擎
- TypeScript 构建工具链（rollup、@rollup/plugin-typescript 等）

## CI/CD 流程设计

### GitHub Actions 工作流

**触发条件**：

- Push 到 main 分支：运行构建和检查
- 创建 tag（`v*`）：运行完整发布流程

**构建流程**：

1. 环境准备（Node.js、依赖安装）
2. 代码检查（ESLint、TypeScript 类型检查）
3. 构建插件（Rollup 打包）
4. 生成产物（main.js、manifest.json、styles.css）

**发布流程**（仅在 tag 时）：

1. 执行构建流程
2. 从 tag 提取版本号（如 `v1.0.0` → `1.0.0`）
3. 验证版本号与 manifest.json 一致
4. 创建 GitHub Release
5. 上传插件文件作为 Release Assets
6. 自动生成 Release Notes

**版本管理策略**：

- 使用语义化版本（Semantic Versioning）
- manifest.json 和 package.json 版本保持同步
- 通过 git tag 触发发布