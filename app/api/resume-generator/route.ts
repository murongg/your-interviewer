import { NextRequest, NextResponse } from 'next/server'
import { createUserAI } from '@/lib/mastra'
import { OpenAIProvider } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const { projectFiles, language, apiKey, apiUrl, model } = await request.json()

    if (!projectFiles || !Array.isArray(projectFiles) || projectFiles.length === 0) {
      return NextResponse.json(
        { error: 'No project files provided' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    // 创建AI实例，使用传入的API key和URL
    const ai = createUserAI({ baseURL: apiUrl, apiKey })

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送开始消息
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: '开始分析项目代码...' })}\n\n`))
          
          // 分析项目代码并生成简历
          const resume = await generateResumeFromCode(ai, projectFiles, language, controller, encoder, model)

          // 发送完成消息
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', resume: resume })}\n\n`))

        } catch (error) {
          console.error('Resume generation error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: '简历生成失败' })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}

async function generateResumeFromCode(
  ai: OpenAIProvider,
  projectFiles: Array<{ name: string; content: string }>,
  language: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  model: string
) {
  try {
    // 发送进度消息
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: '正在分析项目代码结构...' })}\n\n`))
    
    // 准备项目代码摘要
    const codeSummary = prepareCodeSummary(projectFiles)
    
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: '正在生成AI提示...' })}\n\n`))
    
    const userModel = ai(model || 'gpt-4o-mini');

    // 构建AI提示
    const prompt = buildResumePrompt(codeSummary, language)

    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: 'AI正在生成简历...' })}\n\n`))

    // 调用AI生成简历（流式）
    const result = await userModel.doStream({
      inputFormat: 'prompt',
      mode: {
        type: 'regular',
        tools: []
      },
      prompt: [
        {
          role: 'system',
          content: getSystemPrompt(language)
        },
        {
          role: 'user',
          content: [{ type: 'text' as const, text: prompt }]
        }
      ]
    })

    // 处理流式响应
    let fullResume = ''
    const reader = result.stream.getReader()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        if (value.type === 'text-delta') {
          const textChunk = value.textDelta
          fullResume += textChunk
          
          // 发送流式文本块
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'text-chunk', 
            text: textChunk 
          })}\n\n`))
        }
      }
    } finally {
      reader.releaseLock()
    }

    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: '简历生成完成！' })}\n\n`))

    return fullResume

  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate resume with AI')
  }
}

function prepareCodeSummary(projectFiles: Array<{ name: string; content: string }>) {
  let summary = ''

  // 过滤掉系统文件和无关文件
  const relevantFiles = projectFiles.filter(file => {
    const fileName = file.name.toLowerCase()
    // 排除系统文件、隐藏文件、临时文件等
    return !fileName.includes('__macosx') &&
      !fileName.includes('._') &&
      !fileName.includes('.ds_store') &&
      !fileName.includes('thumbs.db') &&
      file.content && file.content.trim().length > 0
  })

  // 按文件类型分组
  const filesByType: { [key: string]: string[] } = {}

  relevantFiles.forEach(file => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown'
    if (!filesByType[ext]) {
      filesByType[ext] = []
    }
    filesByType[ext].push(file.name)
  })

  // 生成项目结构摘要
  summary += '## 项目结构\n'
  Object.entries(filesByType).forEach(([type, files]) => {
    summary += `- ${type.toUpperCase()} 文件 (${files.length}个): ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}\n`
  })

  // 分析主要代码文件内容
  const mainCodeFiles = relevantFiles.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'vue', 'php', 'go', 'rs', 'swift', 'kt'].includes(ext || '')
  }) // 限制分析的文件数量

  summary += '\n## 主要代码文件内容分析\n'
  mainCodeFiles.forEach(file => {
    const lines = file.content.split('\n').length
    const size = Math.round(file.content.length / 1024)

    // 分析代码内容特征
    const content = file.content
    const hasImports = content.includes('import ') || content.includes('from ') || content.includes('require(')
    const hasClasses = content.includes('class ') || content.includes('interface ')
    const hasFunctions = content.includes('function ') || content.includes('def ') || content.includes('func ')
    const hasAsync = content.includes('async ') || content.includes('await ')
    const hasErrorHandling = content.includes('try {') || content.includes('catch') || content.includes('error')
    const hasComments = content.includes('//') || content.includes('/*') || content.includes('#')

    // 提取关键代码片段（前15行和后10行）
    const firstLines = content.split('\n').slice(0, 15).join('\n')
    const lastLines = content.split('\n').slice(-10).join('\n')

    summary += `\n### ${file.name}\n`
    summary += `- 大小: ${size}KB, 行数: ${lines}\n`
    summary += `- 代码特征: ${[
      hasImports && '导入模块',
      hasClasses && '类定义',
      hasFunctions && '函数定义',
      hasAsync && '异步编程',
      hasErrorHandling && '错误处理',
      hasComments && '代码注释'
    ].filter(Boolean).join(', ')}\n`
    summary += `- 代码内容:\n\`\`\`${file.name.split('.').pop()}\n${firstLines}\n...\n${lastLines}\n\`\`\`\n`
  })

  // 添加项目整体分析
  summary += '\n## 项目整体分析\n'
  const totalLines = relevantFiles.reduce((sum, file) => sum + file.content.split('\n').length, 0)
  const totalSize = relevantFiles.reduce((sum, file) => sum + file.content.length, 0)

  summary += `- 总文件数: ${relevantFiles.length}\n`
  summary += `- 总代码行数: ${totalLines}\n`
  summary += `- 总代码大小: ${Math.round(totalSize / 1024)}KB\n`
  summary += `- 主要技术栈: ${Object.keys(filesByType).filter(type =>
    ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'vue', 'php', 'go', 'rs'].includes(type)
  ).join(', ')}\n`

  return summary
}

function buildResumePrompt(codeSummary: string, language: string) {
  const isChinese = language === 'zh'

  if (isChinese) {
    return `请仔细分析以下项目代码，只生成以下三个部分的内容：

1. **技能总结**：
   - 基于代码分析得出的技术技能
   - 识别代码中使用的技术栈、框架、工具
   - 评估对特定技术的掌握程度
   - 不要夸大或虚构技能

2. **项目经验**：
   - 只包含当前这一个项目的详细描述
   - 分析项目的主要功能和业务逻辑
   - 描述技术实现方案和架构设计
   - 突出解决的技术难点和挑战

3. **技术亮点**：
   - 代码中的创新点和特色
   - 使用的设计模式和最佳实践
   - 代码质量和架构优势
   - 技术难点和创新解决方案

请确保：
- 所有内容都基于代码分析得出
- 不要添加个人信息、教育背景等其他内容
- 只输出这三个部分，使用Markdown格式
- 内容真实可信，体现实际技术水平

项目代码分析：
${codeSummary}

请生成以上三个部分的内容：`
  } else {
    return `Please carefully analyze the following project code and only generate the following three sections:

1. **Skills Summary**:
   - Technical skills based on code analysis
   - Identify tech stack, frameworks, and tools used in code
   - Assess mastery level of specific technologies
   - Do not exaggerate or fabricate skills

2. **Project Experience**:
   - Only include this current project with detailed description
   - Analyze main functionality and business logic
   - Describe technical implementation and architecture design
   - Highlight technical challenges and solutions

3. **Technical Highlights**:
   - Innovations and features in code
   - Design patterns and best practices used
   - Code quality and architectural advantages
   - Technical challenges and innovative solutions

Please ensure:
- All content is based on code analysis
- Do not add personal information, education background, or other content
- Only output these three sections in Markdown format
- Content is authentic and credible, reflecting actual technical level

Project code analysis:
${codeSummary}

Please generate the above three sections:`
  }
}

function getSystemPrompt(language: string) {
  const isChinese = language === 'zh'

  if (isChinese) {
    return `你是一个专业的程序员技能分析专家。你需要：

1. 仔细分析提供的项目代码
2. 识别技术栈、架构模式、代码质量
3. 只生成三个部分：技能总结、项目经验、技术亮点
4. 使用专业的Markdown格式
5. 确保所有内容都基于代码分析得出
6. 不要添加个人信息、教育背景等其他内容

请记住：只输出这三个部分，内容必须基于代码分析，不要添加与代码无关的技能或经验。`
  } else {
    return `You are a professional programmer skills analysis expert. You need to:

1. Carefully analyze the provided project code
2. Identify tech stack, architecture patterns, and code quality
3. Only generate three sections: Skills Summary, Project Experience, Technical Highlights
4. Use professional Markdown format
5. Ensure all content is based on code analysis
6. Do not add personal information, education background, or other content

Please remember: Only output these three sections, content must be based on code analysis, do not add skills or experience unrelated to the code.`
  }
}
