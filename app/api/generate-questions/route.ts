import { NextRequest, NextResponse } from 'next/server'
import { interviewAgent } from '@/lib/mastra'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

// 创建 AI 模型实例作为备用
const ai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
})
const aiModel = ai('gpt-4o-mini')

// 解析题库内容，提取问题和答案
async function parseQuestionBank(content: string): Promise<{
  questions: Array<{
    question: string
    answer?: string
    category?: string
    difficulty?: string
  }>
  categories: string[]
  difficulties: string[]
}> {
  try {
    // 使用 Mastra agent 解析题库内容
    const result = await interviewAgent.stream([
      {
        role: 'user',
        content: `请分析以下题库内容，提取所有面试问题和相关信息，并以JSON格式返回：

${content}

请返回以下格式的JSON：
{
  "questions": [
    {
      "question": "问题内容",
      "answer": "答案内容（如果有）",
      "category": "问题类别",
      "difficulty": "难度级别"
    }
  ],
  "categories": ["类别1", "类别2"],
  "difficulties": ["简单", "中等", "困难"]
}

如果内容格式不清晰，请尽可能提取出问题和相关信息。`
      }
    ])

    // 收集流式响应的完整文本
    let responseText = ''
    for await (const chunk of result.textStream) {
      responseText += chunk
    }

    try {
      // 尝试从响应中提取JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0])
        return {
          questions: parsedResult.questions || [],
          categories: parsedResult.categories || [],
          difficulties: parsedResult.difficulties || []
        }
      } else {
        return extractQuestionsManually(content)
      }
    } catch {
      return extractQuestionsManually(content)
    }
  } catch (error) {
    console.error('解析题库错误:', error)
    return extractQuestionsManually(content)
  }
}

// 手动提取问题的备用方法
function extractQuestionsManually(content: string) {
  const questions: Array<{
    question: string
    answer?: string
    category?: string
    difficulty?: string
  }> = []
  
  const lines = content.split('\n')
  let currentQuestion = ''
  let currentAnswer = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 检测问题模式
    if (trimmedLine.match(/^\d+[\.\)]?\s/) || 
        trimmedLine.match(/^[Qq]\.?\s/) ||
        trimmedLine.match(/^问题[：:]\s/) ||
        trimmedLine.match(/^[A-Z][a-z]+\s/)) {
      
      // 保存前一个问题
      if (currentQuestion) {
        questions.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim() || undefined,
          category: '通用',
          difficulty: '中等'
        })
      }
      
      currentQuestion = trimmedLine
      currentAnswer = ''
    } else if (trimmedLine && currentQuestion) {
      // 可能是答案或问题的一部分
      if (trimmedLine.match(/^[Aa]\.?\s/) || 
          trimmedLine.match(/^答案[：:]\s/) ||
          trimmedLine.match(/^答[：:]\s/)) {
        currentAnswer = trimmedLine
      } else if (!currentAnswer) {
        currentQuestion += ' ' + trimmedLine
      } else {
        currentAnswer += ' ' + trimmedLine
      }
    }
  }
  
  // 添加最后一个问题
  if (currentQuestion) {
    questions.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim() || undefined,
      category: '通用',
      difficulty: '中等'
    })
  }
  
  return {
    questions,
    categories: ['通用'],
    difficulties: ['简单', '中等', '困难']
  }
}

// 根据题库生成随机面试题
async function generateRandomQuestions(
  questionBank: any,
  count: number = 5,
  category?: string,
  difficulty?: string
): Promise<Array<{
  question: string
  answer?: string
  category?: string
  difficulty?: string
  source: string
}>> {
  let filteredQuestions = questionBank.questions
  
  // 按类别过滤
  if (category && category !== 'all') {
    filteredQuestions = filteredQuestions.filter((q: any) => 
      q.category === category || !q.category
    )
  }
  
  // 按难度过滤
  if (difficulty && difficulty !== 'all') {
    filteredQuestions = filteredQuestions.filter((q: any) => 
      q.difficulty === difficulty || !q.difficulty
    )
  }
  
  // 如果过滤后问题太少，使用所有问题
  if (filteredQuestions.length < count) {
    filteredQuestions = questionBank.questions
  }
  
  // 随机选择问题
  const selectedQuestions = []
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random())
  
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    selectedQuestions.push({
      ...shuffled[i],
      source: '题库'
    })
  }
  
  return selectedQuestions
}

// 生成基于题库的AI面试题
async function generateAIQuestions(
  questionBank: any,
  count: number = 3,
  category?: string,
  difficulty?: string
): Promise<Array<{
  question: string
  answer?: string
  category?: string
  difficulty?: string
  source: string
}>> {
  try {
    // 使用 Mastra agent 的 generateQuestionFromBank 工具
    const result = await interviewAgent.stream([
      {
        role: 'user',
        content: `请使用 generateQuestionFromBank 工具，基于以下题库内容生成${count}个新的面试问题：

题库内容：
${JSON.stringify(questionBank.questions.slice(0, 10), null, 2)}

要求：
1. 问题数量：${count}个
2. 类别：${category || '与题库相关'}
3. 难度：${difficulty || '中等'}
4. 问题应该与题库内容相关，但不要重复
5. 问题应该具有挑战性和实用性

请使用工具生成问题。`
      }
    ])

    // 收集流式响应的完整文本
    let responseText = ''
    for await (const chunk of result.textStream) {
      responseText += chunk
    }

    try {
      // 尝试从响应中提取JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const aiQuestions = JSON.parse(jsonMatch[0])
        return aiQuestions.map((q: any) => ({
          ...q,
          source: 'AI生成'
        }))
      } else {
        // 如果无法解析JSON，尝试使用备用方法
        const backupResult = await generateText({
          model: aiModel as any,
          prompt: `基于以下题库内容，生成${count}个新的面试问题：

题库内容：
${JSON.stringify(questionBank.questions.slice(0, 10), null, 2)}

要求：
1. 问题数量：${count}个
2. 类别：${category || '与题库相关'}
3. 难度：${difficulty || '中等'}
4. 问题应该与题库内容相关，但不要重复
5. 问题应该具有挑战性和实用性

请以JSON格式返回：
[
  {
    "question": "问题内容",
    "answer": "参考答案",
    "category": "问题类别",
    "difficulty": "难度级别"
  }
]`
        });

        const aiQuestions = JSON.parse(backupResult.text)
        return aiQuestions.map((q: any) => ({
          ...q,
          source: 'AI生成'
        }))
      }
    } catch {
      return []
    }
  } catch (error) {
    console.error('生成AI问题错误:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      questionBankContent, 
      count = 5, 
      category = 'all', 
      difficulty = 'all',
      includeAI = true,
      usedQuestions = [] 
    } = await request.json()

    if (!questionBankContent) {
      return NextResponse.json({ error: '题库内容不能为空' }, { status: 400 })
    }

    // 解析题库
    const parsedQuestionBank = await parseQuestionBank(questionBankContent)
    
    if (parsedQuestionBank.questions.length === 0) {
      return NextResponse.json({ error: '无法从题库中提取问题' }, { status: 400 })
    }

    // 过滤掉已使用的问题
    const availableQuestions = parsedQuestionBank.questions.filter((q: any) => {
      return !usedQuestions.some((used: string) => 
        used.toLowerCase().includes(q.question.toLowerCase()) ||
        q.question.toLowerCase().includes(used.toLowerCase())
      )
    })

    if (availableQuestions.length === 0) {
      return NextResponse.json({ 
        success: true,
        questions: [],
        message: '题库中的所有问题都已使用完毕',
        questionBank: {
          totalQuestions: parsedQuestionBank.questions.length,
          usedQuestions: usedQuestions.length,
          remainingQuestions: 0
        }
      })
    }

    // 生成随机问题
    const randomQuestions = await generateRandomQuestions(
      { ...parsedQuestionBank, questions: availableQuestions }, 
      Math.floor(count * 0.7), // 70%来自题库
      category, 
      difficulty
    )

    let allQuestions = [...randomQuestions]

    // 如果需要AI生成的问题
    if (includeAI && availableQuestions.length > 0) {
      const aiQuestions = await generateAIQuestions(
        { ...parsedQuestionBank, questions: availableQuestions },
        Math.ceil(count * 0.3), // 30%由AI生成
        category,
        difficulty
      )
      allQuestions = [...allQuestions, ...aiQuestions]
    }

    // 打乱问题顺序
    allQuestions = allQuestions.sort(() => 0.5 - Math.random())

    return NextResponse.json({
      success: true,
      questions: allQuestions.slice(0, count),
      questionBank: {
        totalQuestions: parsedQuestionBank.questions.length,
        usedQuestions: usedQuestions.length,
        remainingQuestions: availableQuestions.length,
        categories: parsedQuestionBank.categories,
        difficulties: parsedQuestionBank.difficulties
      }
    })

  } catch (error) {
    console.error('生成面试题错误:', error)
    return NextResponse.json({ error: '生成面试题失败' }, { status: 500 })
  }
} 
