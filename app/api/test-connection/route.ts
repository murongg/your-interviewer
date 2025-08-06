import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: NextRequest) {
  try {
    const { baseURL, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    // 创建临时的AI实例来测试连接
    const testAI = createOpenAI({
      apiKey: apiKey,
      baseURL: baseURL || undefined,
    });

    // 尝试调用一个简单的API来测试连接
    try {
      const response = await testAI('gpt-4o-mini').generateText({
        prompt: 'Hello',
        maxTokens: 10,
      });

      return NextResponse.json({
        success: true,
        message: 'Connection test successful',
        model: 'gpt-4o-mini'
      });
    } catch (apiError: any) {
      console.error('API test error:', apiError);
      
      // 提供更友好的错误信息
      let errorMessage = 'Connection test failed';
      
      if (apiError.message) {
        if (apiError.message.includes('401') || apiError.message.includes('Unauthorized')) {
          errorMessage = 'Invalid API Key';
        } else if (apiError.message.includes('404') || apiError.message.includes('Not Found')) {
          errorMessage = 'Invalid Base URL';
        } else if (apiError.message.includes('timeout') || apiError.message.includes('network')) {
          errorMessage = 'Network timeout or connection error';
        } else if (apiError.message.includes('quota') || apiError.message.includes('billing')) {
          errorMessage = 'API quota exceeded or billing issue';
        } else {
          errorMessage = apiError.message;
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Test connection error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 