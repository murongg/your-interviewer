import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { t } from '@/lib/i18n';

export async function POST(req: Request) {
  try {
    const { messages, context, language = 'zh' } = await req.json();

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
    let evaluationPrompt = `Please evaluate this interview as a professional interviewer.

Interview conversation record:
${messages.map((msg: any) => `${msg.role === 'user' ? 'Interviewee' : 'Interviewer'}: ${msg.content}`).join('\n')}`;

    if (context) {
      if (context.jobDescription) {
        evaluationPrompt += `\n\nJob Requirements:\n${context.jobDescription}`;
      }
      if (context.resume) {
        evaluationPrompt += `\n\nInterviewee Resume:\n${context.resume}`;
      }
    }

    evaluationPrompt += `\n\nPlease evaluate from the following dimensions (0-100 points):
1. Technical Skills - Professional knowledge mastery
2. Communication - Language organization and expression ability
3. Problem Solving - Analysis and problem-solving ability
4. Work Attitude - Positivity and responsibility
5. Relevant Experience - Work experience matching

Please provide specific scores, feedback suggestions, and hiring recommendations.`;

    // 根据语言调整提示
    if (language === 'zh') {
      evaluationPrompt = `请作为专业面试官，对这次面试进行全面评估。

面试对话记录：
${messages.map((msg: any) => `${msg.role === 'user' ? '面试者' : '面试官'}: ${msg.content}`).join('\n')}`;

      if (context) {
        if (context.jobDescription) {
          evaluationPrompt += `\n\n职位要求：\n${context.jobDescription}`;
        }
        if (context.resume) {
          evaluationPrompt += `\n\n面试者简历：\n${context.resume}`;
        }
      }

      evaluationPrompt += `\n\n请从以下维度进行评分（0-100分）：
1. 技术能力 - 专业知识掌握程度
2. 沟通表达 - 语言组织和表达能力
3. 问题解决 - 分析和解决问题的能力
4. 工作态度 - 积极性和责任心
5. 相关经验 - 工作经验的匹配度

请提供具体的评分、反馈建议和录用推荐。`;
    }

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: evaluationSchema,
      prompt: evaluationPrompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Evaluation error:', error);
    return Response.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
