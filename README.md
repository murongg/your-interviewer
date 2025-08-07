# AI Interview Assistant 🤖

[English](#english) | [中文](./README.zh.md)

---

## 🎯 Overview

AI Interview Assistant is an intelligent interview preparation platform that helps users improve their interview skills through AI-powered mock interviews. The application provides personalized interview experiences, real-time feedback, and comprehensive evaluation reports.

## ✨ Key Features

- **🤖 AI-Powered Mock Interviews**: Conduct realistic interview simulations with intelligent AI agents
- **📚 Personalized Content**: Upload your resume, job descriptions, and interview question banks for tailored experiences
- **🎯 Real-time Feedback**: Get instant feedback and guidance on your answers
- **📊 Comprehensive Evaluation**: Receive detailed assessment reports with scores across multiple dimensions
- **🌐 Bilingual Support**: Full support for both English and Chinese languages
- **⚡ Advanced AI Tools**: Powered by Mastra AI framework with multiple specialized tools
- **📱 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI Framework**: Mastra AI, OpenAI GPT-4
- **Backend**: Next.js API Routes
- **Internationalization**: Custom i18n system
- **File Processing**: PDF, Markdown, and text file support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- OpenAI API key (configured in frontend settings)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/murongg/your-interviewer.git
   cd your-interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env.local
   ```
   
   Note: OpenAI API key is configured in the frontend settings, not in environment variables.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Upload Your Materials
- **Resume**: Upload your resume for personalized questions
- **Job Description**: Add target job requirements for relevant interviews
- **Interview Questions**: Upload question banks for specific topics
- **Knowledge Base**: Add technical documentation for specialized interviews

### 2. Start an Interview
- Click "Start Interview" to begin
- Answer questions naturally as you would in a real interview
- Receive real-time feedback and guidance

### 3. Get Evaluated
- After completing the interview, click "Interview Evaluation"
- Review your comprehensive assessment report
- See scores across technical skills, communication, problem-solving, and more

### 4. Advanced Features
- **Question Generation**: AI generates relevant questions based on your materials
- **Answer Evaluation**: Get detailed feedback on your responses
- **Progress Tracking**: Monitor your improvement over time
- **Smart Termination**: AI automatically ends interviews when you're ready

## 🏗️ Project Structure

```
interview-assistant/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API for interviews
│   │   ├── evaluate/      # Evaluation API
│   │   └── upload/        # File upload API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── evaluation-report.tsx
│   ├── file-upload.tsx
│   ├── language-switcher.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── i18n.ts          # Internationalization
│   ├── mastra.ts        # AI tools and agents
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
└── styles/              # Additional styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_BASE_URL` | OpenAI API base URL | No (defaults to official) |

**Note**: OpenAI API key is configured through the frontend settings interface, not through environment variables.

### Language Configuration

The application supports both English and Chinese. The default language is English, but users can switch languages through the UI.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenAI](https://openai.com/)
- AI framework by [Mastra](https://mastra.ai/) 
