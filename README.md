# GitHub Trending Collector

> 🚀 自动化采集 GitHub Trending 仓库，使用 Qwen AI 生成分析报告

## 功能特性

- ⏰ **定时采集** - 每 6 小时自动采集 GitHub Trending 数据
- 🤖 **AI 处理** - 使用 Qwen（通义千问）生成仓库分析
- 📊 **结构化输出** - JSON 格式存储，便于后续处理
- 🔄 **自动化流程** - GitHub Actions 自动运行

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入 QWEN_API_KEY
```

### 3. 测试 API 连通性

```bash
npm run test-api
```

### 4. 运行采集

```bash
npm run collect
```

## 项目结构

```
├── .github/workflows/
│   └── collect.yml      # GitHub Actions Workflow
├── scripts/
│   ├── collect.mjs      # 数据采集脚本
│   ├── process.mjs      # AI 处理脚本
│   ├── test-api.mjs     # API 测试脚本
│   └── __tests__/       # 测试用例
├── output/              # 采集的数据
└── .env                 # 环境变量
```

## GitHub Actions 自动化

- **触发方式**：
  - 定时触发：每 6 小时
  - 手动触发：通过 GitHub Actions 页面

- **执行流程**：
  1. 采集 GitHub Trending 数据
  2. 调用 Qwen API 处理数据
  3. 自动提交到仓库

## 许可证

MIT
