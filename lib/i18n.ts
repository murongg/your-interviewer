export const translations = {
  zh: {
    // 通用
    common: {
      loading: '加载中...',
      submit: '提交',
      cancel: '取消',
      close: '关闭',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      send: '发送',
      upload: '上传',
      download: '下载',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      confirm: '确认',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息'
    },
    // 主页面
    main: {
      title: 'AI面试助手',
      subtitle: '与AI面试官对话，提升你的面试技能',
      uploadFiles: '上传文件',
      interviewEvaluation: '面试评分',
      evaluating: '评估中...',
      welcome: '欢迎来到AI面试助手！',
      welcomeWithFiles: '已加载你的个性化内容，我们开始面试吧！',
      welcomeDefault: '你可以先上传面试题库、简历或职位描述，获得更个性化的面试体验。',
      aiThinking: 'AI正在思考...',
      you: '你',
      aiInterviewer: 'AI面试官',
      inputPlaceholder: '输入你的回答或问题...',
      quickReplies: '快捷回复：',
      tip: '💡 提示：面试结束后点击"面试评分"获得专业评估报告',
      personalizedContent: '已配置个性化内容'
    },
    // 快捷回复
    quickReplies: {
      helpAnswer: '请帮我回答并解释这个问题',
      getIdeas: '请给我一些回答这个问题的思路',
      nextQuestion: '我准备好下一个问题了',
      restart: '请重新开始面试'
    },
    // 文件上传
    fileUpload: {
      title: '上传面试相关文件',
      subtitle: '上传面试题库、简历或职位描述，获得更个性化的面试体验',
      interviewQuestions: '面试题库',
      resume: '个人简历',
      jobDescription: '职位描述',
      interviewQuestionsDesc: '上传包含面试题目的PDF或Markdown文件',
      resumeDesc: '上传你的简历，AI将根据简历内容提出针对性问题',
      jobDescriptionDesc: '上传目标职位的JD，AI将根据职位要求进行面试',
      clickToUpload: '点击上传文件',
      uploading: '上传中...',
      uploadedFiles: '已上传文件：',
      noFileFound: '没有找到文件',
      uploadFailed: '文件上传失败',
      uploadSuccess: '文件上传成功'
    },
    // 评估报告
    evaluation: {
      title: '面试评估报告',
      overallScore: '总体评分',
      detailedScore: '详细评分',
      strengths: '优势亮点',
      improvements: '改进建议',
      overallEvaluation: '总体评价',
      recommendation: {
        stronglyRecommend: '强烈推荐',
        recommend: '推荐',
        average: '一般',
        notRecommend: '不推荐'
      },
      dimensions: {
        technicalSkills: '技术能力',
        communication: '沟通表达',
        problemSolving: '问题解决',
        attitude: '工作态度',
        experience: '相关经验'
      },
      noMessages: '请先进行面试对话再进行评估',
      evaluationFailed: '评估失败，请重试'
    },
    // AI 系统提示
    aiPrompts: {
      systemPrompt: `你是一位专业的面试官AI助手。你的职责是：

1. 进行模拟面试，根据不同岗位提出相关问题
2. 当用户请求帮助时（如"请帮我回答并解释这个问题"），你需要：
   - 提供一个优秀的回答示例
   - 解释回答的要点和逻辑
   - 给出改进建议
3. 保持专业、友好的语调
4. 根据用户的回答给出建设性的反馈

请用中文进行对话。`,
      interviewQuestionsContext: '\n\n面试题库内容：\n{content}\n请根据这些面试题来提问。',
      resumeContext: '\n\n候选人简历：\n{content}\n请根据简历内容提出针对性问题。',
      jobDescriptionContext: '\n\n职位描述：\n{content}\n请根据职位要求提出相关问题。'
    }
  },
  en: {
    // Common
    common: {
      loading: 'Loading...',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      send: 'Send',
      upload: 'Upload',
      download: 'Download',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
    },
    // Main page
    main: {
      title: 'AI Interview Assistant',
      subtitle: 'Chat with AI interviewer to improve your interview skills',
      uploadFiles: 'Upload Files',
      interviewEvaluation: 'Interview Evaluation',
      evaluating: 'Evaluating...',
      welcome: 'Welcome to AI Interview Assistant!',
      welcomeWithFiles: 'Your personalized content has been loaded. Let\'s start the interview!',
      welcomeDefault: 'You can upload interview questions, resume, or job description first for a more personalized interview experience.',
      aiThinking: 'AI is thinking...',
      you: 'You',
      aiInterviewer: 'AI Interviewer',
      inputPlaceholder: 'Enter your answer or question...',
      quickReplies: 'Quick Replies:',
      tip: '💡 Tip: Click "Interview Evaluation" after the interview to get a professional assessment report',
      personalizedContent: 'Personalized content configured'
    },
    // Quick replies
    quickReplies: {
      helpAnswer: 'Please help me answer and explain this question',
      getIdeas: 'Please give me some ideas for answering this question',
      nextQuestion: 'I\'m ready for the next question',
      restart: 'Please restart the interview'
    },
    // File upload
    fileUpload: {
      title: 'Upload Interview Related Files',
      subtitle: 'Upload interview questions, resume, or job description for a more personalized interview experience',
      interviewQuestions: 'Interview Questions',
      resume: 'Resume',
      jobDescription: 'Job Description',
      interviewQuestionsDesc: 'Upload PDF or Markdown files containing interview questions',
      resumeDesc: 'Upload your resume, AI will ask targeted questions based on your resume',
      jobDescriptionDesc: 'Upload target job description, AI will conduct interviews based on job requirements',
      clickToUpload: 'Click to upload file',
      uploading: 'Uploading...',
      uploadedFiles: 'Uploaded files:',
      noFileFound: 'No file found',
      uploadFailed: 'File upload failed',
      uploadSuccess: 'File uploaded successfully'
    },
    // Evaluation report
    evaluation: {
      title: 'Interview Evaluation Report',
      overallScore: 'Overall Score',
      detailedScore: 'Detailed Score',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      overallEvaluation: 'Overall Evaluation',
      recommendation: {
        stronglyRecommend: 'Strongly Recommend',
        recommend: 'Recommend',
        average: 'Average',
        notRecommend: 'Not Recommend'
      },
      dimensions: {
        technicalSkills: 'Technical Skills',
        communication: 'Communication',
        problemSolving: 'Problem Solving',
        attitude: 'Work Attitude',
        experience: 'Relevant Experience'
      },
      noMessages: 'Please conduct an interview conversation first before evaluation',
      evaluationFailed: 'Evaluation failed, please try again'
    },
    // AI prompts
    aiPrompts: {
      systemPrompt: `You are a professional AI interview assistant. Your responsibilities are:

1. Conduct mock interviews and ask relevant questions based on different positions
2. When users request help (such as "Please help me answer and explain this question"), you need to:
   - Provide an excellent answer example
   - Explain the key points and logic of the answer
   - Give improvement suggestions
3. Maintain a professional and friendly tone
4. Provide constructive feedback based on user responses

Please communicate in English.`,
      interviewQuestionsContext: '\n\nInterview Questions Content:\n{content}\nPlease ask questions based on these interview questions.',
      resumeContext: '\n\nCandidate Resume:\n{content}\nPlease ask targeted questions based on the resume content.',
      jobDescriptionContext: '\n\nJob Description:\n{content}\nPlease ask relevant questions based on the job requirements.'
    }
  }
}

export type Language = 'zh' | 'en'
export type TranslationKey = keyof typeof translations.zh

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

export function t(lang: Language, key: string, params?: Record<string, string>): string {
  let text = getTranslation(lang, key)
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value)
    })
  }
  
  return text
}
