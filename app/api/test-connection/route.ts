import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { baseURL, apiKey, model = 'gpt-4o-mini' } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    // 创建 AI 实例
    const ai = createOpenAI({
      apiKey: apiKey,
      baseURL: baseURL || 'https://api.openai.com/v1',
    });

    const aiModel = ai(model);

    // 发送一个简单的测试请求
    const response = await generateText({
      model: aiModel,
      prompt: 'Hello, this is a test message. Please respond with "Connection successful!"',
      maxTokens: 10,
    });

    return NextResponse.json({
      success: true,
      message: 'Connection test successful',
      response: response.text,
    });

  } catch (error) {
    console.error('Connection test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // 提供更友好的错误信息
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your API key.' },
        { status: 401 }
      );
    } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Model not found or not available. Please check the model name.' },
        { status: 400 }
      );
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return NextResponse.json(
        { error: 'Network timeout. Please check your internet connection and base URL.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { error: 'Connection test failed', details: errorMessage },
        { status: 500 }
      );
    }
  }
} 
