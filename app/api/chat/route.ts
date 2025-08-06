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
    const systemPrompt = `你是一个专业的面试助手，请提供有用的面试建议。当前语言：${language}

回答评估和引导指导：
- 当用户回答问题时，仔细评估回答的完整性和深度
- 如果回答不够完善（如过于简短、缺乏具体例子、逻辑不清晰等），不要直接给出答案
- 而是给出具体的提示和引导，帮助用户思考更深入
- 提示应该包括：
  * 指出回答中缺少的关键点
  * 建议用户提供具体的例子或经历
  * 引导用户从不同角度思考问题
  * 鼓励用户展开更详细的说明
- 只有当用户明确请求帮助或提示时，才提供更直接的指导
- 保持鼓励和支持的态度，帮助用户建立信心`;

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
      if (context.knowledgeBase) {
        enhancedSystemPrompt += `\n\n知识库内容：${context.knowledgeBase}`;
      }
    }

    // 构建用户消息，如果用户要求生成问题且有题库内容，则自动调用题库生成工具
    let userMessage = lastMessage.parts[0].text;

    // 检查是否是请求生成面试题的消息
    const isRequestingQuestions = /(生成|出|给|提供|问).*(问题|面试题|题目)/.test(userMessage) ||
      /(next|generate|ask).*(question|problem)/i.test(userMessage);

    // 检查是否是开始面试的消息
    const isStartingInterview = /(开始面试|开始|开始吧|我们开始|可以开始了)/.test(userMessage) ||
      /(start|begin|let\'s start|ready to start)/i.test(userMessage);

    // 检查是否是请求下一题的消息
    const isRequestingNextQuestion = /(下一题|下一个|继续|下一个问题|再来一题|出下一题)/.test(userMessage) ||
      /(next|continue|another|next question)/i.test(userMessage);

    // 检查是否是请求帮助或提示的消息
    const isRequestingHelp = /(请帮我|给我提示|我不太清楚|能给我一些建议|帮我回答)/.test(userMessage) ||
      /(help|hint|suggestion|advice|not sure)/i.test(userMessage);

    // 提取已使用的问题
    const usedQuestions: string[] = [];
    messages.forEach((msg: any) => {
      if (msg.role === 'assistant' && msg.content) {
        // 简单提取问题（以问号结尾的句子）
        const questions = msg.content.match(/[^。！？]*[？?]/g);
        if (questions) {
          usedQuestions.push(...questions.map((q: string) => q.trim()));
        }
      }
    });

    if ((isRequestingQuestions || isRequestingNextQuestion || isStartingInterview) && context?.interviewQuestions) {
      // 根据不同的请求类型生成不同的提示
      let prompt = '';
      if (isStartingInterview) {
        prompt = `欢迎开始面试！请基于以下题库内容生成第一个面试问题：${context.interviewQuestions}`;
      } else if (isRequestingNextQuestion) {
        prompt = `请基于以下题库内容生成一个新的面试问题，避免重复已使用的问题：${context.interviewQuestions}`;
      } else {
        prompt = `请基于以下题库内容生成面试问题：${context.interviewQuestions}`;
      }

      const result = await interviewAgent.stream([
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: prompt }
      ]);
      return result.toTextStreamResponse();
    }

    // 如果是请求帮助，提供更直接的指导
    if (isRequestingHelp) {
      const result = await interviewAgent.stream([
        { role: 'system', content: enhancedSystemPrompt },
        { role: 'user', content: `用户请求帮助：${userMessage}。请提供具体的指导和建议，帮助用户更好地回答问题。` }
      ]);
      return result.toTextStreamResponse();
    }

    // 使用 Mastra Agent 进行流式响应
    const newMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.parts[0].text })),
      { role: 'user', content: userMessage }
    ]

    const result = await interviewAgent.stream(newMessages);

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


