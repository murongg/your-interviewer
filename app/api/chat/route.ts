import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { t } from '@/lib/i18n';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context, language = 'zh' } = await req.json();
  
  // 构建系统提示，包含上传的文件内容
  let systemPrompt = t(language, 'aiPrompts.systemPrompt');

  // 如果有上传的文件内容，添加到系统提示中
  if (context) {
    if (context.interviewQuestions) {
      systemPrompt += t(language, 'aiPrompts.interviewQuestionsContext', { content: context.interviewQuestions });
    }
    
    if (context.resume) {
      systemPrompt += t(language, 'aiPrompts.resumeContext', { content: context.resume });
    }
    
    if (context.jobDescription) {
      systemPrompt += t(language, 'aiPrompts.jobDescriptionContext', { content: context.jobDescription });
    }
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
