import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { interviewAgent } from '@/lib/mastra';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, context, language = 'zh' } = await req.json();
    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // 构建系统提示
    const systemPrompt = `你是一个专业的面试助手，请提供有用的面试建议。当前语言：${language}`;
    
    // 如果有上下文信息，添加到系统提示中
    let enhancedSystemPrompt = systemPrompt;
    if (context) {
      if (context.jobDescription) {
        enhancedSystemPrompt += `\n\n职位描述：${context.jobDescription}`;
      }
      if (context.resume) {
        enhancedSystemPrompt += `\n\n简历信息：${context.resume}`;
      }
      if (context.interviewQuestions) {
        enhancedSystemPrompt += `\n\n面试题库：${context.interviewQuestions}`;
      }
    }

    // 使用 Mastra Agent 进行流式响应
    const result = await interviewAgent.stream([
      // { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: lastMessage.parts[0].text }
    ]);

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


