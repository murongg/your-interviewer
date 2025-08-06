import { NextRequest, NextResponse } from 'next/server';
import { interviewAgent, createUserAI, createLanguageAwareInterviewAgent } from '@/lib/mastra';
import { t } from '@/lib/i18n';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, context, language = 'en', userSettings } = await req.json();
    
    // 添加请求日志
    console.log('Chat API request received:', {
      messageCount: messages?.length,
      hasContext: !!context,
      language,
      lastMessage: messages?.[messages.length - 1]
    });

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      console.error('No valid user message found:', { messages });
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // 验证消息内容
    const userMessageText = lastMessage.content || lastMessage.parts?.[0]?.text;
    if (!userMessageText || userMessageText.trim() === '') {
      console.error('Empty user message:', { lastMessage });
      return NextResponse.json(
        { error: 'Empty user message' },
        { status: 400 }
      );
    }

    // 构建系统提示
    const systemPrompt = t(language, 'aiPrompts.systemPrompt');

    // 如果有上下文信息，添加到系统提示中
    let enhancedSystemPrompt = systemPrompt;
    if (context) {
      if (context.jobDescription) {
        enhancedSystemPrompt += t(language, 'aiPrompts.jobDescriptionContext', { content: context.jobDescription });
      }
      if (context.resume) {
        enhancedSystemPrompt += t(language, 'aiPrompts.resumeContext', { content: context.resume });
      }
      if (context.interviewQuestions) {
        enhancedSystemPrompt += t(language, 'aiPrompts.interviewQuestionsContext', { content: context.interviewQuestions });
      }
      if (context.knowledgeBase) {
        enhancedSystemPrompt += t(language, 'aiPrompts.knowledgeBaseContext', { content: context.knowledgeBase });
      }
    }

    // 构建用户消息，如果用户要求生成问题且有题库内容，则自动调用题库生成工具
    let userMessage = userMessageText;

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

    console.log('Processing message:', {
      userMessage,
      isRequestingQuestions,
      isStartingInterview,
      isRequestingNextQuestion,
      isRequestingHelp,
      hasInterviewQuestions: !!context?.interviewQuestions
    });

    const newMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages.map((msg: any) => {
        const content = msg.parts?.[0]?.text || msg.content || '';
        if (!content) {
          console.warn('Empty message content found:', { msg });
        }
        return { role: msg.role, content };
      }).filter((msg: any) => msg.content && msg.content.trim() !== ''),
      { role: 'user', content: userMessage }
    ];

    if ((isRequestingQuestions || isRequestingNextQuestion || isStartingInterview) && context?.interviewQuestions) {
      // 根据不同的请求类型生成不同的提示
      let prompt = '';
      if (isStartingInterview) {
        prompt = t(language, 'aiPrompts.welcomeStartInterview', { content: context.interviewQuestions });
      } else if (isRequestingNextQuestion) {
        prompt = t(language, 'aiPrompts.nextQuestionFromBank', { content: context.interviewQuestions });
      } else {
        prompt = t(language, 'aiPrompts.generateFromBank', { content: context.interviewQuestions });
      }

      console.log('Generating question from bank with prompt:', prompt);

      try {
        // 如果用户提供了设置，创建新的AI实例
        let agentToUse = createLanguageAwareInterviewAgent(language);
        if (userSettings?.apiKey) {
          const userAI = createUserAI(userSettings);
          const userModel = userAI(userSettings.model || 'gpt-4o-mini');
          
          // 创建使用用户API配置的agent
          const { Agent } = await import('@mastra/core');
          agentToUse = new Agent({
            name: 'interview_assistant',
            description: language === 'zh' ? '专业的面试助手，能够生成问题、评估答案、提供建议' : 'Professional interview assistant that can generate questions, evaluate answers, and provide advice',
            instructions: t(language, 'aiPrompts.agentInstructions'),
            model: userModel,
            tools: createLanguageAwareInterviewAgent(language).tools,
          });
        }

        const result = await agentToUse.stream(newMessages);
        
        console.log('Question generation successful');
        return result.toTextStreamResponse();
      } catch (error) {
        console.error('Question generation failed:', error);
        return NextResponse.json(
          { error: 'Failed to generate question', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // 如果是请求帮助，提供更直接的指导
    if (isRequestingHelp) {
      console.log('Providing help for user request');
      try {
        // 构建完整的消息历史，确保AI能理解上下文
        const helpMessages = [
          { role: 'system', content: enhancedSystemPrompt },
          ...messages.map((msg: any) => {
            const content = msg.parts?.[0]?.text || msg.content || '';
            if (!content) {
              console.warn('Empty message content found:', { msg });
            }
            return { role: msg.role, content };
          }).filter((msg: any) => msg.content && msg.content.trim() !== ''),
          { role: 'user', content: userMessage }
        ];

        // 如果用户提供了设置，创建新的AI实例
        let agentToUse = createLanguageAwareInterviewAgent(language);
        if (userSettings?.apiKey) {
          const userAI = createUserAI(userSettings);
          const userModel = userAI(userSettings.model || 'gpt-4o-mini');
          
          // 创建使用用户API配置的agent
          const { Agent } = await import('@mastra/core');
          agentToUse = new Agent({
            name: 'interview_assistant',
            description: language === 'zh' ? '专业的面试助手，能够生成问题、评估答案、提供建议' : 'Professional interview assistant that can generate questions, evaluate answers, and provide advice',
            instructions: t(language, 'aiPrompts.agentInstructions'),
            model: userModel,
            tools: createLanguageAwareInterviewAgent(language).tools,
          });
        }

        const result = await agentToUse.stream(helpMessages);
        
        console.log('Help response generated successfully');
        return result.toTextStreamResponse();
      } catch (error) {
        console.error('Help generation failed:', error);
        return NextResponse.json(
          { error: 'Failed to provide help', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // 使用 Mastra Agent 进行流式响应

    console.log('Sending messages to interview agent:', {
      messageCount: newMessages.length,
      systemPromptLength: enhancedSystemPrompt.length,
      userMessageLength: userMessage.length
    });

    try {
      // 如果用户提供了设置，创建新的AI实例
      let agentToUse = createLanguageAwareInterviewAgent(language);
      if (userSettings?.apiKey) {
        const userAI = createUserAI(userSettings);
        const userModel = userAI(userSettings.model || 'gpt-4o-mini');
        
        // 创建使用用户API配置的agent
        const { Agent } = await import('@mastra/core');
        agentToUse = new Agent({
          name: 'interview_assistant',
          description: language === 'zh' ? '专业的面试助手，能够生成问题、评估答案、提供建议' : 'Professional interview assistant that can generate questions, evaluate answers, and provide advice',
          instructions: t(language, 'aiPrompts.agentInstructions'),
          model: userModel,
          tools: createLanguageAwareInterviewAgent(language).tools,
        });
      }

      const result = await agentToUse.stream(newMessages);
      
      console.log('Interview agent response generated successfully');
      return result.toTextStreamResponse();
    } catch (error) {
      console.error('Interview agent failed:', error);
      
      // 提供更友好的错误信息
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        return NextResponse.json(
          { error: 'API configuration error. Please check your OpenAI API key.' },
          { status: 500 }
        );
      } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        return NextResponse.json(
          { error: 'Network timeout. Please try again.' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to generate response', details: errorMessage },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


