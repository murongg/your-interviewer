import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { t } from '@/lib/i18n'

// 创建 AI 模型实例
const ai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
})
const aiModel = ai('gpt-4o-mini')

// 简单的 Markdown 解析函数
function parseMarkdown(content: string): string {
  // 移除 Markdown 标记，保留纯文本
  return content
    .replace(/^#+\s+/gm, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/`(.*?)`/g, '$1') // 移除代码标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接标记
    .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
    .replace(/^\s*\d+\.\s+/gm, '') // 移除数字列表标记
    .replace(/^\s*>/gm, '') // 移除引用标记
    .replace(/^\s*\|.*\|.*$/gm, '') // 移除表格标记
    .replace(/\n\s*\n/g, '\n') // 移除多余的空行
    .trim()
}

// RAG 知识库处理函数
async function processKnowledgeBase(content: string, fileName: string, language: 'zh' | 'en' = 'en'): Promise<string> {
  try {
    // 使用 AI 来提取和结构化知识内容
    const prompt = t(language, 'aiPrompts.processKnowledgeBasePrompt', {
      fileName,
      content
    });

    const response = await generateText({
      model: aiModel as any,
      prompt,
    })

    return response.text
  } catch (error) {
    console.error('RAG processing error:', error)
    // 如果 AI 处理失败，返回原始内容
    return content
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 })
    }

    // 读取文件内容
    const buffer = await file.arrayBuffer()
    const content = new TextDecoder().decode(buffer)

    // 仅允许 Markdown 文件
    if (!file.name.toLowerCase().endsWith('.md')) {
      return NextResponse.json({ error: '仅支持上传 Markdown (.md) 文件' }, { status: 400 })
    }

    // 处理 Markdown 文件
    let processedContent = parseMarkdown(content)
    let fileType = 'markdown'

    // 如果是知识库文件，进行 RAG 处理
    if (type === 'knowledgeBase') {
      processedContent = await processKnowledgeBase(processedContent, file.name, 'en')
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: fileType,
      content: processedContent,
      size: file.size,
      type: type
    })
  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 })
  }
}
