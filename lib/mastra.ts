import { Agent, createTool } from '@mastra/core';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

// 创建 AI 模型实例
export const ai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})
const aiModel = ai('gpt-4o-mini')

// Mastra 配置
export const mastraConfig = {
  model: aiModel,
  logLevel: 'info' as const,
};

// 定义面试相关的数据类型
export interface InterviewContext {
  jobDescription?: string;
  resume?: string;
  questionType?: string;
  difficulty?: string;
  conversationHistory?: string;
  language?: string;
}

export interface InterviewQuestion {
  question: string;
  type: string;
  difficulty: string;
  context: any;
}

export interface InterviewEvaluation {
  score: number;
  feedback: string;
  criteria: string[];
}

export interface InterviewAdvice {
  advice: string;
  type: string;
  timestamp: string;
}

// 创建面试问题生成工具
export const generateQuestionTool = createTool({
  id: 'generate_question',
  description: '根据职位描述和简历生成面试问题',
  inputSchema: z.object({
    jobDescription: z.string().optional(),
    resume: z.string().optional(),
    questionType: z.string().optional().default('general'),
    difficulty: z.string().optional().default('medium')
  }),
  outputSchema: z.object({
    question: z.string(),
    type: z.string(),
    difficulty: z.string(),
    context: z.object({
      jobDescription: z.string().optional(),
      resume: z.string().optional()
    })
  }),
  async execute({ context }) {
    const { jobDescription, resume, questionType = 'general', difficulty = 'medium' } = context;
    const prompt = `根据以下信息生成一个${difficulty}难度的${questionType}面试问题：

职位描述：${jobDescription || '未提供'}
简历内容：${resume || '未提供'}

请生成一个具体、相关且具有挑战性的面试问题。`;

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    return {
      question: response.text,
      type: questionType,
      difficulty,
      context: { jobDescription, resume }
    };
  }
});

// 创建答案评估工具
export const evaluateAnswerTool = createTool({
  id: 'evaluate_answer',
  description: '评估面试答案的质量',
  inputSchema: z.object({
    question: z.string(),
    answer: z.string(),
    jobDescription: z.string().optional(),
    criteria: z.array(z.string()).optional()
  }),
  outputSchema: z.object({
    score: z.number(),
    feedback: z.string(),
    criteria: z.array(z.string())
  }),
  async execute({ context }) {
    const { question, answer, jobDescription, criteria = [] } = context;
    const defaultCriteria = [
      '答案的完整性和逻辑性',
      '与职位要求的匹配度',
      '具体性和实例的使用',
      '专业性和技术深度'
    ];

    const evaluationCriteria = criteria.length > 0 ? criteria : defaultCriteria;

    const prompt = `请评估以下面试答案：

问题：${question}
答案：${answer}
职位描述：${jobDescription || '未提供'}

评估标准：${evaluationCriteria.join('、')}

请从1-10分进行评分，并提供详细的反馈和改进建议。
请以JSON格式返回：{"score": 分数, "feedback": "反馈内容"}`;

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    try {
      const result = JSON.parse(response.text);
      return {
        score: result.score || 8,
        feedback: result.feedback || response.text,
        criteria: evaluationCriteria
      };
    } catch {
      return {
        score: 8,
        feedback: response.text,
        criteria: evaluationCriteria
      };
    }
  }
});

// 创建面试建议工具
export const provideAdviceTool = createTool({
  id: 'provide_advice',
  description: '基于面试表现提供改进建议',
  inputSchema: z.object({
    conversationHistory: z.string(),
    jobDescription: z.string().optional(),
    adviceType: z.string().optional().default('general')
  }),
  outputSchema: z.object({
    advice: z.string(),
    type: z.string(),
    timestamp: z.string()
  }),
  async execute({ context }) {
    const { conversationHistory, jobDescription, adviceType = 'general' } = context;
    const prompt = `基于以下面试表现，提供${adviceType}方面的改进建议：

面试对话：
${conversationHistory}

职位描述：${jobDescription || '未提供'}

请提供具体、可操作的改进建议。`;

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    return {
      advice: response.text,
      type: adviceType,
      timestamp: new Date().toISOString()
    };
  }
});

// 创建面试总结工具
export const summarizeInterviewTool = createTool({
  id: 'summarize_interview',
  description: '总结面试表现和提供建议',
  inputSchema: z.object({
    conversationHistory: z.string(),
    jobDescription: z.string().optional(),
    resume: z.string().optional()
  }),
  outputSchema: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    overallScore: z.number(),
    recommendations: z.array(z.string())
  }),
  async execute({ context }) {
    const { conversationHistory, jobDescription, resume } = context;
    const prompt = `请总结这次面试：

面试对话：${conversationHistory}
职位描述：${jobDescription || '未提供'}
简历：${resume || '未提供'}

请以JSON格式返回：
{
  "summary": "面试总结",
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["需要改进的地方1", "需要改进的地方2"],
  "overallScore": 分数,
  "recommendations": ["建议1", "建议2"]
}`;

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    try {
      const result = JSON.parse(response.text);
      return {
        summary: result.summary || '面试总结',
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        overallScore: result.overallScore || 8,
        recommendations: result.recommendations || []
      };
    } catch {
      return {
        summary: response.text,
        strengths: [],
        weaknesses: [],
        overallScore: 8,
        recommendations: []
      };
    }
  }
});

// 创建面试代理
export const interviewAgent = new Agent({
  name: 'interview_assistant',
  description: '专业的面试助手，能够生成问题、评估答案、提供建议',
  instructions: `你是一个专业的面试助手，具备以下能力：

1. 根据职位描述和简历生成相关的面试问题
2. 评估候选人的答案质量
3. 提供个性化的面试建议和改进方向
4. 支持技术面试、行为面试等多种类型

请始终保持专业、友好和建设性的态度。`,
  model: aiModel,
  tools: {
    generateQuestion: generateQuestionTool,
    evaluateAnswer: evaluateAnswerTool,
    provideAdvice: provideAdviceTool,
    summarizeInterview: summarizeInterviewTool
  }
});

// 导出常用的工具函数
export { aiModel as default }; 
