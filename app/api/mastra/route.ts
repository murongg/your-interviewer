import { NextRequest, NextResponse } from 'next/server';
import { 
  generateQuestionTool, 
  evaluateAnswerTool, 
  provideAdviceTool, 
  summarizeInterviewTool,
  interviewAgent 
} from '@/lib/mastra';

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'generate_question':
        const questionResult = await generateQuestionTool.execute({
          jobDescription: data.jobDescription,
          resume: data.resume,
          questionType: data.questionType || 'general',
          difficulty: data.difficulty || 'medium'
        });
        return NextResponse.json({ success: true, data: questionResult });

      case 'evaluate_answer':
        const evaluationResult = await evaluateAnswerTool.execute({
          question: data.question,
          answer: data.answer,
          jobDescription: data.jobDescription,
          criteria: data.criteria
        });
        return NextResponse.json({ success: true, data: evaluationResult });

      case 'provide_advice':
        const adviceResult = await provideAdviceTool.execute({
          conversationHistory: data.conversationHistory,
          jobDescription: data.jobDescription,
          adviceType: data.adviceType || 'general'
        });
        return NextResponse.json({ success: true, data: adviceResult });

      case 'summarize_interview':
        const summaryResult = await summarizeInterviewTool.execute({
          conversationHistory: data.conversationHistory,
          jobDescription: data.jobDescription,
          resume: data.resume
        });
        return NextResponse.json({ success: true, data: summaryResult });

      case 'run_agent':
        // 使用mastra Agent进行智能处理
        const messages = data.messages || [];
        const context = data.context || {};
        
        if (messages.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'No messages provided' 
          });
        }

        const lastMessage = messages[messages.length - 1];
        const userMessage = lastMessage.content;

        // 根据消息内容智能选择工具
        if (userMessage.includes('生成问题') || userMessage.includes('提问')) {
          const result = await generateQuestionTool.execute({
            jobDescription: context.jobDescription,
            resume: context.resume,
            questionType: 'general',
            difficulty: 'medium'
          });
          
          return NextResponse.json({
            success: true,
            data: {
              role: 'assistant',
              content: result.question
            }
          });
        } else if (userMessage.includes('评估') || userMessage.includes('评分')) {
          const result = await evaluateAnswerTool.execute({
            question: '面试问题',
            answer: userMessage,
            jobDescription: context.jobDescription
          });
          
          return NextResponse.json({
            success: true,
            data: {
              role: 'assistant',
              content: `评分：${result.score}/10\n\n反馈：${result.feedback}`
            }
          });
        } else if (userMessage.includes('建议') || userMessage.includes('改进')) {
          const conversationHistory = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
          const result = await provideAdviceTool.execute({
            conversationHistory,
            jobDescription: context.jobDescription,
            adviceType: 'general'
          });
          
          return NextResponse.json({
            success: true,
            data: {
              role: 'assistant',
              content: result.advice
            }
          });
        } else if (userMessage.includes('总结') || userMessage.includes('总结')) {
          const conversationHistory = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
          const result = await summarizeInterviewTool.execute({
            conversationHistory,
            jobDescription: context.jobDescription,
            resume: context.resume
          });
          
          return NextResponse.json({
            success: true,
            data: {
              role: 'assistant',
              content: `面试总结：\n\n${result.summary}\n\n优点：${result.strengths.join(', ')}\n\n需要改进：${result.weaknesses.join(', ')}\n\n总体评分：${result.overallScore}/10\n\n建议：${result.recommendations.join(', ')}`
            }
          });
        } else {
          return NextResponse.json({
            success: true,
            data: {
              role: 'assistant',
              content: '我是面试助手，可以帮您生成面试问题、评估答案、提供建议和总结面试。请告诉我您需要什么帮助。'
            }
          });
        }

      default:
        return NextResponse.json({ 
          success: false, 
          error: `Unknown action: ${action}` 
        });
    }
  } catch (error) {
    console.error('Mastra API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      availableActions: [
        'generate_question',
        'evaluate_answer', 
        'provide_advice',
        'summarize_interview',
        'run_agent'
      ],
      description: 'Mastra-powered interview assistant API'
    }
  });
} 
