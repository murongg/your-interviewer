# AI面试助手 🤖

[English](./README.md) | [中文](#chinese)

---

## 🎯 项目概述

AI面试助手是一个智能面试准备平台，通过AI驱动的模拟面试帮助用户提升面试技能。该应用程序提供个性化的面试体验、实时反馈和全面的评估报告。

## ✨ 主要功能

- **🤖 AI驱动的模拟面试**: 与智能AI代理进行真实的面试模拟
- **📚 个性化内容**: 上传简历、职位描述和面试题库，获得定制化体验
- **🎯 实时反馈**: 获得即时反馈和答案指导
- **📊 全面评估**: 接收详细的评估报告，包含多个维度的评分
- **🌐 双语支持**: 完整支持中英文两种语言
- **⚡ 高级AI工具**: 由Mastra AI框架驱动，配备多种专业工具
- **📱 现代UI**: 基于Next.js和Tailwind CSS构建的美丽响应式界面

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript
- **样式**: Tailwind CSS, shadcn/ui组件
- **AI框架**: Mastra AI, OpenAI GPT-4
- **后端**: Next.js API路由
- **国际化**: 自定义i18n系统
- **文件处理**: 支持PDF、Markdown和文本文件

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm, yarn, 或 pnpm
- OpenAI API密钥（在前端设置中配置）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/interview-assistant.git
   cd interview-assistant
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **配置环境变量（可选）**
   ```bash
   cp .env.example .env.local
   ```
   
   注意：OpenAI API密钥在前端设置中配置，不在环境变量中。

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

5. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用指南

### 1. 上传材料
- **简历**: 上传简历获得个性化问题
- **职位描述**: 添加目标职位要求进行相关面试
- **面试题库**: 上传特定主题的题库
- **知识库**: 添加技术文档进行专业面试

### 2. 开始面试
- 点击"开始面试"开始
- 像真实面试一样自然回答问题
- 获得实时反馈和指导

### 3. 获取评估
- 完成面试后，点击"面试评分"
- 查看全面的评估报告
- 查看技术能力、沟通、问题解决等多个维度的评分

### 4. 高级功能
- **问题生成**: AI根据你的材料生成相关问题
- **答案评估**: 获得回答的详细反馈
- **进度跟踪**: 监控你的改进情况
- **智能终止**: AI在你准备好时自动结束面试

## 🏗️ 项目结构

```
interview-assistant/
├── app/                    # Next.js应用目录
│   ├── api/               # API路由
│   │   ├── chat/          # 面试聊天API
│   │   ├── evaluate/      # 评估API
│   │   └── upload/        # 文件上传API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── ui/               # shadcn/ui组件
│   ├── evaluation-report.tsx
│   ├── file-upload.tsx
│   ├── language-switcher.tsx
│   └── ...
├── lib/                  # 工具库
│   ├── i18n.ts          # 国际化
│   ├── mastra.ts        # AI工具和代理
│   └── utils.ts         # 工具函数
├── hooks/               # 自定义React钩子
└── styles/              # 额外样式
```

## 🔧 配置

### 环境变量

| 变量 | 描述 | 必需 |
|------|------|------|
| `OPENAI_BASE_URL` | OpenAI API基础URL | 否（默认为官方） |

**注意**：OpenAI API密钥通过前端设置界面配置，不通过环境变量。

### 语言配置

应用程序支持中英文两种语言。默认语言为英文，但用户可以通过UI切换语言。

## 🤝 贡献

我们欢迎贡献！请随时提交Pull Request。对于重大更改，请先开一个issue讨论你想要更改的内容。

1. Fork仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 基于 [Next.js](https://nextjs.org/) 构建
- UI组件来自 [shadcn/ui](https://ui.shadcn.com/)
- AI由 [OpenAI](https://openai.com/) 提供支持
- AI框架由 [Mastra](https://mastra.ai/) 提供 
