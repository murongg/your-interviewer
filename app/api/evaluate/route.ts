import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { t } from '@/lib/i18n';

export async function POST(req: Request) {
  try {
    const { messages, context, language = 'en' } = await req.json();

    // 创建 AI 模型实例
    const ai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
    const aiModel = ai('gpt-4o');

    // 定义评分结构
    const evaluationSchema = z.object({
      overallScore: z.number().min(0).max(100).describe('Overall score (0-100)'),
      dimensions: z.object({
        technicalSkills: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string().describe('Technical skills feedback')
        }).describe('Technical skills'),
        communication: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string().describe('Communication feedback')
        }).describe('Communication'),
        problemSolving: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string().describe('Problem solving feedback')
        }).describe('Problem solving'),
        attitude: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string().describe('Work attitude feedback')
        }).describe('Work attitude'),
        experience: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string().describe('Relevant experience feedback')
        }).describe('Relevant experience')
      }),
      strengths: z.array(z.string()).describe('Strengths and highlights'),
      improvements: z.array(z.string()).describe('Areas for improvement'),
      recommendation: z.enum(['stronglyRecommend', 'recommend', 'average', 'notRecommend']).describe('Hiring recommendation'),
      summary: z.string().describe('Overall evaluation summary')
    });

    // 构建评估提示
    const conversationHistory = messages.map((msg: any) => 
      `${msg.role === 'user' ? (language === 'zh' ? '面试者' : 'Interviewee') : (language === 'zh' ? '面试官' : 'Interviewer')}: ${msg.content}`
    ).join('\n');

    let jobDescriptionContext = '';
    let resumeContext = '';
    
    if (context) {
      if (context.jobDescription) {
        jobDescriptionContext = language === 'zh' 
          ? `\n\n职位要求：\n${context.jobDescription}`
          : `\n\nJob Requirements:\n${context.jobDescription}`;
      }
      if (context.resume) {
        resumeContext = language === 'zh'
          ? `\n\n面试者简历：\n${context.resume}`
          : `\n\nInterviewee Resume:\n${context.resume}`;
      }
    }

    const evaluationPrompt = t(language, 'aiPrompts.evaluationPrompt', {
      conversationHistory,
      jobDescriptionContext,
      resumeContext
    });

    // 使用结构化评估
    const result = await generateObject({
      model: aiModel,
      schema: evaluationSchema,
      prompt: evaluationPrompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Evaluation error:', error);
    return Response.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
