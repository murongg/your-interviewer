import { Agent, createTool } from '@mastra/core';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { t } from './i18n';

// 创建 AI 模型实例
export const ai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

// 创建一个函数来获取用户设置的API配置
export const getUserApiConfig = (userSettings?: { baseURL?: string; apiKey?: string }) => {
  // 如果提供了用户设置，优先使用
  if (userSettings?.apiKey) {
    return {
      apiKey: userSettings.apiKey,
      baseURL: userSettings.baseURL || process.env.OPENAI_BASE_URL,
    }
  }

  // 服务端环境，使用环境变量
  if (typeof window === 'undefined') {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    }
  }

  // 客户端环境，从localStorage读取用户设置
  try {
    const savedSettings = localStorage.getItem('interview-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      return {
        apiKey: settings.apiKey || process.env.OPENAI_API_KEY,
        baseURL: settings.baseURL || process.env.OPENAI_BASE_URL,
      }
    }
  } catch (error) {
    console.error('Failed to load user API settings:', error)
  }

  // 如果没有用户设置，使用环境变量
  return {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  }
}

// 创建一个函数来创建AI实例
export const createUserAI = (userSettings?: { baseURL?: string; apiKey?: string }) => {
  const config = getUserApiConfig(userSettings)
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}

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
    difficulty: z.string().optional().default('medium'),
    language: z.string().optional().default('en')
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
    const { jobDescription, resume, questionType = 'general', difficulty = 'medium', language = 'en' } = context;
    const prompt = t(language as 'zh' | 'en', 'aiPrompts.generateQuestionPrompt', {
      difficulty,
      questionType,
      jobDescription: jobDescription || (language === 'zh' ? '未提供' : 'Not provided'),
      resume: resume || (language === 'zh' ? '未提供' : 'Not provided')
    });

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

// 创建答案评估和引导工具
export const evaluateAnswerTool = createTool({
  id: 'evaluate_answer',
  description: '评估面试答案的质量并提供引导提示',
  inputSchema: z.object({
    question: z.string(),
    answer: z.string(),
    jobDescription: z.string().optional(),
    criteria: z.array(z.string()).optional(),
    isFirstAttempt: z.boolean().optional().default(true),
    language: z.string().optional().default('en')
  }),
  outputSchema: z.object({
    score: z.number(),
    feedback: z.string(),
    guidance: z.string(),
    needsImprovement: z.boolean(),
    criteria: z.array(z.string()),
    accuracyRate: z.number()
  }),
  async execute({ context }) {
    const { question, answer, jobDescription, criteria = [], isFirstAttempt = true, language = 'en' } = context;
    const defaultCriteria = language === 'zh' ? [
      '答案的完整性和逻辑性',
      '与职位要求的匹配度',
      '具体性和实例的使用',
      '专业性和技术深度'
    ] : [
      'Answer completeness and logic',
      'Match with job requirements',
      'Specificity and use of examples',
      'Professionalism and technical depth'
    ];

    const evaluationCriteria = criteria.length > 0 ? criteria : defaultCriteria;

    const prompt = t(language as 'zh' | 'en', 'aiPrompts.evaluateAnswerPrompt', {
      question,
      answer,
      jobDescription: jobDescription || (language === 'zh' ? '未提供' : 'Not provided'),
      isFirstAttempt: isFirstAttempt ? (language === 'zh' ? '是' : 'Yes') : (language === 'zh' ? '否' : 'No'),
      evaluationCriteria: evaluationCriteria.join(language === 'zh' ? '、' : ', ')
    });

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    try {
      const result = JSON.parse(response.text);
      const score = result.score || 8;
      const accuracyRate = result.accuracyRate || (score / 10) * 100;
      return {
        score: score,
        feedback: result.feedback || response.text,
        guidance: result.guidance || '',
        needsImprovement: result.needsImprovement || false,
        criteria: evaluationCriteria,
        accuracyRate: accuracyRate
      };
    } catch {
      const score = 8;
      const accuracyRate = (score / 10) * 100;
      return {
        score: score,
        feedback: response.text,
        guidance: language === 'zh' ? '请尝试提供更详细的回答，包括具体的例子和经历。' : 'Please try to provide more detailed answers, including specific examples and experiences.',
        needsImprovement: true,
        criteria: evaluationCriteria,
        accuracyRate: accuracyRate
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

// 创建基于题库生成面试题的工具
export const generateQuestionFromBankTool = createTool({
  id: 'generate_question_from_bank',
  description: '根据上传的题库内容生成相关的面试问题，避免重复出题',
  inputSchema: z.object({
    questionBankContent: z.string(),
    questionType: z.string().optional().default('general'),
    difficulty: z.string().optional().default('medium'),
    count: z.number().optional().default(1),
    usedQuestions: z.array(z.string()).optional().default([])
  }),
  outputSchema: z.object({
    questions: z.array(z.object({
      question: z.string(),
      type: z.string(),
      difficulty: z.string(),
      source: z.string()
    })),
    totalQuestions: z.number()
  }),
  async execute({ context }) {
    const { questionBankContent, questionType = 'general', difficulty = 'medium', count = 1, usedQuestions = [] } = context;
    
    const prompt = `基于以下题库内容，生成${count}个${difficulty}难度的${questionType}面试问题：

题库内容：
${questionBankContent}

已使用过的问题（请避免重复）：
${usedQuestions.length > 0 ? usedQuestions.join('\n') : '无'}

要求：
1. 问题应该与题库内容相关
2. 问题应该具有挑战性和实用性
3. 问题类型：${questionType}
4. 难度级别：${difficulty}
5. 生成的问题数量：${count}
6. 重要：不要生成已经使用过的问题，确保每个问题都是新的

请以JSON格式返回：
{
  "questions": [
    {
      "question": "问题内容",
      "type": "问题类型",
      "difficulty": "难度级别",
      "source": "题库生成"
    }
  ],
  "totalQuestions": ${count}
}`;

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    try {
      const result = JSON.parse(response.text);
      return {
        questions: result.questions || [],
        totalQuestions: result.totalQuestions || count
      };
    } catch {
      // 如果JSON解析失败，返回一个简单的问题
      return {
        questions: [{
          question: `基于题库内容，请回答一个关于${questionType}的问题。`,
          type: questionType,
          difficulty: difficulty,
          source: '题库生成'
        }],
        totalQuestions: 1
      };
    }
  }
});

// 创建面试进度跟踪工具
export const trackInterviewProgressTool = createTool({
  id: 'track_interview_progress',
  description: '跟踪面试进度，评估是否应该终止当前面试',
  inputSchema: z.object({
    conversationHistory: z.string(),
    questionCount: z.number(),
    recentScores: z.array(z.number()),
    jobDescription: z.string().optional(),
    resume: z.string().optional(),
    language: z.string().optional().default('en')
  }),
  outputSchema: z.object({
    shouldTerminate: z.boolean(),
    reason: z.string(),
    overallScore: z.number(),
    accuracyRate: z.number(),
    questionCount: z.number()
  }),
  async execute({ context }) {
    const { conversationHistory, questionCount, recentScores, jobDescription, resume, language = 'en' } = context;
    
    // 计算准确率
    const averageScore = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const accuracyRate = (averageScore / 10) * 100;
    
    // 判断是否应该终止
    const shouldTerminate = (accuracyRate >= 80 && questionCount >= 3) || questionCount >= 5;
    
    const prompt = t(language as 'zh' | 'en', 'aiPrompts.evaluateProgressPrompt', {
      conversationHistory: language === 'zh' ? `面试对话：${conversationHistory}
问题数量：${questionCount}
最近回答得分：${recentScores.join(', ')}
平均准确率：${accuracyRate.toFixed(1)}%
职位描述：${jobDescription || '未提供'}` : `Interview conversation: ${conversationHistory}
Question count: ${questionCount}
Recent answer scores: ${recentScores.join(', ')}
Average accuracy rate: ${accuracyRate.toFixed(1)}%
Job description: ${jobDescription || 'Not provided'}`
    });

    const response = await generateText({
      model: aiModel as any,
      prompt,
    });

    try {
      const result = JSON.parse(response.text);
      return {
        shouldTerminate: result.shouldTerminate || shouldTerminate,
        reason: result.reason || (shouldTerminate ? (language === 'zh' ? '用户表现良好，可以结束当前面试' : 'User performed well, can end current interview') : (language === 'zh' ? '继续面试' : 'Continue interview')),
        overallScore: result.overallScore || averageScore,
        accuracyRate: result.accuracyRate || accuracyRate,
        questionCount: result.questionCount || questionCount
      };
    } catch {
      return {
        shouldTerminate: shouldTerminate,
        reason: shouldTerminate ? (language === 'zh' ? '用户表现良好，可以结束当前面试' : 'User performed well, can end current interview') : (language === 'zh' ? '继续面试' : 'Continue interview'),
        overallScore: averageScore,
        accuracyRate: accuracyRate,
        questionCount: questionCount
      };
    }
  }
});

// 创建面试终止判断工具
export const shouldTerminateInterviewTool = createTool({
  id: 'should_terminate_interview',
  description: '判断是否应该终止当前面试',
  inputSchema: z.object({
    recentScores: z.array(z.number()),
    questionCount: z.number(),
    conversationHistory: z.string(),
    jobDescription: z.string().optional()
  }),
  outputSchema: z.object({
    shouldTerminate: z.boolean(),
    reason: z.string(),
    averageScore: z.number(),
    accuracyRate: z.number(),
    terminationType: z.enum(['high_accuracy', 'sufficient_questions', 'max_questions'])
  }),
  async execute({ context }) {
    const { recentScores, questionCount, conversationHistory, jobDescription } = context;
    
    // 计算最近3个问题的平均分数
    const recentAverage = recentScores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(recentScores.slice(-3).length, 3);
    const accuracyRate = (recentAverage / 10) * 100;
    
    // 计算整体平均分数
    const overallAverage = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const overallAccuracyRate = (overallAverage / 10) * 100;
    
    let shouldTerminate = false;
    let reason = '';
    let terminationType: 'high_accuracy' | 'sufficient_questions' | 'max_questions' = 'sufficient_questions';
    
    // 判断终止条件
    if (recentScores.length >= 3 && accuracyRate >= 85) {
      shouldTerminate = true;
      reason = `恭喜！您最近3个问题的平均准确率达到${accuracyRate.toFixed(1)}%，表现优秀！`;
      terminationType = 'high_accuracy';
    } else if (questionCount >= 5 && overallAccuracyRate >= 80) {
      shouldTerminate = true;
      reason = `您已经回答了${questionCount}个问题，整体准确率达到${overallAccuracyRate.toFixed(1)}%，表现良好！`;
      terminationType = 'sufficient_questions';
    } else if (questionCount >= 8) {
      shouldTerminate = true;
      reason = `您已经回答了${questionCount}个问题，可以结束当前面试轮次了。`;
      terminationType = 'max_questions';
    }
    
    return {
      shouldTerminate,
      reason,
      averageScore: recentAverage,
      accuracyRate: accuracyRate,
      terminationType
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
    resume: z.string().optional(),
    overallScore: z.number(),
    accuracyRate: z.number(),
    questionCount: z.number(),
    terminationType: z.string()
  }),
  outputSchema: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    overallScore: z.number(),
    accuracyRate: z.number(),
    recommendations: z.array(z.string()),
    nextSteps: z.string(),
    congratulations: z.string()
  }),
  async execute({ context }) {
    const { conversationHistory, jobDescription, resume, overallScore, accuracyRate, questionCount, terminationType } = context;
    const prompt = `请总结这次面试：

面试对话：${conversationHistory}
职位描述：${jobDescription || '未提供'}
简历：${resume || '未提供'}
整体得分：${overallScore}/10
准确率：${accuracyRate.toFixed(1)}%
问题数量：${questionCount}
终止类型：${terminationType}

请以JSON格式返回：
{
  "summary": "面试总结",
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["需要改进的地方1", "需要改进的地方2"],
  "overallScore": 分数,
  "accuracyRate": 准确率,
  "recommendations": ["建议1", "建议2"],
  "nextSteps": "下一步建议",
  "congratulations": "祝贺语"
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
        overallScore: result.overallScore || overallScore,
        accuracyRate: result.accuracyRate || accuracyRate,
        recommendations: result.recommendations || [],
        nextSteps: result.nextSteps || '建议继续练习，可以开始新的面试轮次',
        congratulations: result.congratulations || '恭喜您完成这次面试！'
      };
    } catch {
      return {
        summary: response.text,
        strengths: [],
        weaknesses: [],
        overallScore: overallScore,
        accuracyRate: accuracyRate,
        recommendations: [],
        nextSteps: '建议继续练习，可以开始新的面试轮次',
        congratulations: '恭喜您完成这次面试！'
      };
    }
  }
});

// 创建面试代理
export const interviewAgent = new Agent({
  name: 'interview_assistant',
  description: '专业的面试助手，能够生成问题、评估答案、提供建议',
  instructions: t('zh', 'aiPrompts.agentInstructions'),
  model: aiModel,
  tools: {
    generateQuestion: generateQuestionTool,
    generateQuestionFromBank: generateQuestionFromBankTool,
    evaluateAnswer: evaluateAnswerTool,
    provideAdvice: provideAdviceTool,
    shouldTerminateInterview: shouldTerminateInterviewTool,
    summarizeInterview: summarizeInterviewTool
  }
});

// 创建语言感知的面试代理
export const createLanguageAwareInterviewAgent = (language: 'zh' | 'en' = 'en') => {
  return new Agent({
    name: 'interview_assistant',
    description: language === 'zh' ? '专业的面试助手，能够生成问题、评估答案、提供建议' : 'Professional interview assistant that can generate questions, evaluate answers, and provide advice',
    instructions: t(language, 'aiPrompts.agentInstructions'),
    model: aiModel,
    tools: {
      generateQuestion: generateQuestionTool,
      generateQuestionFromBank: generateQuestionFromBankTool,
      evaluateAnswer: evaluateAnswerTool,
      provideAdvice: provideAdviceTool,
      shouldTerminateInterview: shouldTerminateInterviewTool,
      summarizeInterview: summarizeInterviewTool
    }
  });
};

// 导出常用的工具函数
export { aiModel as default }; 
