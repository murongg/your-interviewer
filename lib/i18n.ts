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
      restart: '请重新开始面试',
      generateFromBank: '基于题库出题',
      nextQuestionFromBank: '下一题',
      startInterview: '开始面试',
      needHint: '我需要一些提示'
    },
    // 文件上传
    fileUpload: {
      title: '上传面试相关文件',
      subtitle: '上传面试题库、简历或职位描述，获得更个性化的面试体验',
      interviewQuestions: '面试题库',
      resume: '个人简历',
      jobDescription: '职位描述',
      knowledgeBase: '知识库',
      interviewQuestionsDesc: '上传包含面试题目的PDF或Markdown文件',
      resumeDesc: '上传你的简历，AI将根据简历内容提出针对性问题',
      jobDescriptionDesc: '上传目标职位的JD，AI将根据职位要求进行面试',
      knowledgeBaseDesc: '上传技术文档、知识库等Markdown文件，AI将基于这些内容进行智能问答',
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
      systemPrompt: `你是一个专业的面试助手，请提供有用的面试建议。当前语言：zh

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
- 保持鼓励和支持的态度，帮助用户建立信心`,
      interviewQuestionsContext: '\n\n面试题库内容：\n{content}\n请根据这些面试题来提问。',
      resumeContext: '\n\n候选人简历：\n{content}\n请根据简历内容提出针对性问题。',
      jobDescriptionContext: '\n\n职位描述：\n{content}\n请根据职位要求提出相关问题。',
      knowledgeBaseContext: '\n\n知识库内容：\n{content}\n请基于这些知识内容进行面试问答。',
      // 面试流程提示
      welcomeStartInterview: '欢迎开始面试！请基于以下题库内容生成第一个面试问题：{content}',
      nextQuestionFromBank: '请基于以下题库内容生成一个新的面试问题，避免重复已使用的问题：{content}',
      generateFromBank: '请基于以下题库内容生成面试问题：{content}',
      generateQuestionPrompt: '根据以下信息生成一个{difficulty}难度的{questionType}面试问题：\n\n职位描述：{jobDescription}\n简历内容：{resume}\n\n请生成一个具体、相关且具有挑战性的面试问题。',
      // 答案评估提示
      evaluateAnswerPrompt: `请评估以下面试答案并提供引导：

问题：{question}
答案：{answer}
职位描述：{jobDescription}
是否首次回答：{isFirstAttempt}

评估标准：{evaluationCriteria}

请从1-10分进行评分，评分标准：
- 9-10分：回答完整、准确、有深度，包含具体例子，逻辑清晰
- 7-8分：回答基本正确，有一定深度，但可能缺少具体例子
- 5-6分：回答基本正确，但不够详细，缺乏具体例子
- 3-4分：回答部分正确，但不够完整或有明显错误
- 1-2分：回答错误或完全不相关

请提供：
1. 详细的反馈评价
2. 如果回答不够完善，提供具体的引导提示（不要直接给出答案）
3. 引导应该包括：
   - 指出缺少的关键点
   - 建议提供具体例子
   - 引导从不同角度思考
   - 鼓励更详细的说明

请以JSON格式返回：
{
  "score": 分数,
  "feedback": "反馈内容",
  "guidance": "引导提示",
  "needsImprovement": true/false,
  "accuracyRate": 准确率百分比
}`,
      // 面试进度评估提示
      evaluateProgressPrompt: `请评估当前面试进度：

面试对话记录：
{conversationHistory}

请分析：
1. 用户回答的质量和完整性
2. 技术深度和广度
3. 沟通表达能力
4. 是否需要继续面试
5. 整体表现评分

如果用户表现良好且已回答足够多问题，请主动结束面试并给出总结。`,
      // 知识库处理提示
      processKnowledgeBasePrompt: `请分析以下内容并提取关键知识点，用于面试问答：

文件名：{fileName}
内容：
{content}

请提取以下信息：
1. 主要技术概念和术语
2. 重要的知识点和要点
3. 可能出现的面试问题
4. 相关的实际应用场景

请以结构化的格式返回，便于后续面试使用。`,
      // 面试评估提示
      evaluationPrompt: `请作为专业面试官，对这次面试进行全面评估。

面试对话记录：
{conversationHistory}

{jobDescriptionContext}
{resumeContext}

请从以下维度进行评分（0-100分）：
1. 技术能力 - 专业知识掌握程度
2. 沟通表达 - 语言组织和表达能力
3. 问题解决 - 分析和解决问题的能力
4. 工作态度 - 积极性和责任心
5. 相关经验 - 工作经验的匹配度

请提供具体的评分、反馈建议和录用推荐。`,
      // 面试代理指令
      agentInstructions: `你是一个专业的面试助手，具备以下能力：

1. 根据职位描述和简历生成相关的面试问题
2. 根据上传的题库内容生成相关的面试问题
3. 评估候选人的答案质量
4. 提供个性化的面试建议和改进方向
5. 支持技术面试、行为面试等多种类型

面试流程指导：
- 当用户说"开始面试"时，热情地欢迎并出第一个问题
- 每次只出一个面试问题，等待用户回答
- 用户回答后，给予适当的反馈和评价
- 当用户说"下一题"、"继续"、"下一个问题"等时，再出下一题
- 如果用户上传了题库，优先从题库中出题，避免重复出题
- 保持面试的节奏感，不要一次性出太多题

智能终止和总结指导：
- 持续跟踪用户的回答质量和准确率
- 当满足以下任一条件时，主动终止当前面试并总结：
  * 用户连续3个问题回答准确率达到85%以上
  * 用户已经回答了5个以上问题且整体平均准确率达到80%以上
  * 用户已经回答了8个以上问题（无论准确率如何）
- 终止时应该：
  * 首先祝贺用户完成当前面试轮次
  * 总结用户的整体表现和亮点
  * 指出需要改进的地方
  * 提供具体的改进建议
  * 鼓励用户继续练习
  * 明确提示可以开始新的面试轮次
- 总结应该包括：
  * 回答的准确性和完整性
  * 技术深度和广度
  * 沟通表达能力
  * 具体改进建议
  * 整体评分和准确率

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
- 保持鼓励和支持的态度，帮助用户建立信心

面试状态跟踪：
- 在每次回答后，评估回答质量并记录分数
- 计算最近3个问题的平均准确率
- 当准确率达到终止条件时，立即进行总结
- 总结后明确告知用户可以开始新的面试轮次

当用户上传了题库文件时，你应该优先使用题库内容来生成面试问题。
请始终保持专业、友好和建设性的态度。`
    },
    // Mastra 功能
    mastra: {
      title: 'Mastra AI 高级功能',
      subtitle: '使用先进的 AI 代理和工作流技术增强面试体验',
      questionGenerator: '问题生成器',
      answerEvaluator: '答案评估器',
      knowledgeBase: '知识库',
      adviceGenerator: '建议生成器',
      generateQuestion: '生成面试问题',
      questionType: '问题类型',
      difficulty: '难度',
      technical: '技术',
      behavioral: '行为',
      situational: '情境',
      general: '通用',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      generatedQuestion: '生成的问题',
      evaluateAnswer: '评估答案',
      question: '问题',
      answer: '答案',
      questionPlaceholder: '输入面试问题...',
      answerPlaceholder: '输入你的答案...',
      evaluate: '评估',
      evaluation: '评估结果',
      searchQuery: '搜索查询',
      searchPlaceholder: '输入搜索关键词...',
      searchResults: '搜索结果',
      generateAdvice: '生成建议',
      conversationHistory: '对话历史',
      conversationPlaceholder: '输入面试对话历史...',
      adviceType: '建议类型',
      communication: '沟通',
      advice: '建议'
    },
    // 错误处理
    error: {
      title: '出现错误',
      retry: '重试',
      defaultMessage: '聊天服务暂时不可用，请稍后重试',
      code: '错误代码'
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
      restart: 'Please restart the interview',
      generateFromBank: 'Generate from Question Bank',
      nextQuestionFromBank: 'Next Question',
      startInterview: 'Start Interview',
      needHint: 'I need some hints'
    },
    // File upload
    fileUpload: {
      title: 'Upload Interview Related Files',
      subtitle: 'Upload interview questions, resume, or job description for a more personalized interview experience',
      interviewQuestions: 'Interview Questions',
      resume: 'Resume',
      jobDescription: 'Job Description',
      knowledgeBase: 'Knowledge Base',
      interviewQuestionsDesc: 'Upload PDF or Markdown files containing interview questions',
      resumeDesc: 'Upload your resume, AI will ask targeted questions based on your resume',
      jobDescriptionDesc: 'Upload target job description, AI will conduct interviews based on job requirements',
      knowledgeBaseDesc: 'Upload technical documentation, knowledge base and other Markdown files, AI will conduct intelligent Q&A based on these contents',
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
      systemPrompt: `You are a professional interview assistant. Please provide useful interview advice. Current language: en

Answer evaluation and guidance:
- When users answer questions, carefully evaluate the completeness and depth of their responses
- If the answer is not comprehensive enough (e.g., too brief, lacks specific examples, unclear logic), do not provide the answer directly
- Instead, provide specific hints and guidance to help users think more deeply
- Hints should include:
  * Point out missing key points in the answer
  * Suggest users provide specific examples or experiences
  * Guide users to think from different perspectives
  * Encourage users to provide more detailed explanations
- Only provide more direct guidance when users explicitly request help or hints
- Maintain an encouraging and supportive attitude to help users build confidence`,
      interviewQuestionsContext: '\n\nInterview Questions Content:\n{content}\nPlease ask questions based on these interview questions.',
      resumeContext: '\n\nCandidate Resume:\n{content}\nPlease ask targeted questions based on the resume content.',
      jobDescriptionContext: '\n\nJob Description:\n{content}\nPlease ask relevant questions based on the job requirements.',
      knowledgeBaseContext: '\n\nKnowledge Base Content:\n{content}\nPlease conduct interview Q&A based on these knowledge contents.',
      // Interview flow prompts
      welcomeStartInterview: 'Welcome to the interview! Please generate the first interview question based on the following question bank content: {content}',
      nextQuestionFromBank: 'Please generate a new interview question based on the following question bank content, avoiding repetition of used questions: {content}',
      generateFromBank: 'Please generate interview questions based on the following question bank content: {content}',
      generateQuestionPrompt: 'Generate a {difficulty} difficulty {questionType} interview question based on the following information:\n\nJob Description: {jobDescription}\nResume Content: {resume}\n\nPlease generate a specific, relevant, and challenging interview question.',
      // Answer evaluation prompt
      evaluateAnswerPrompt: `Please evaluate the following interview answer and provide guidance:

Question: {question}
Answer: {answer}
Job Description: {jobDescription}
Is First Attempt: {isFirstAttempt}

Evaluation Criteria: {evaluationCriteria}

Please score from 1-10, scoring criteria:
- 9-10 points: Complete, accurate, in-depth answer with specific examples and clear logic
- 7-8 points: Basically correct answer with some depth but may lack specific examples
- 5-6 points: Basically correct answer but not detailed enough, lacks specific examples
- 3-4 points: Partially correct answer but not complete or has obvious errors
- 1-2 points: Wrong answer or completely irrelevant

Please provide:
1. Detailed feedback evaluation
2. If the answer is not comprehensive enough, provide specific guidance hints (do not give the answer directly)
3. Guidance should include:
   - Point out missing key points
   - Suggest providing specific examples
   - Guide thinking from different perspectives
   - Encourage more detailed explanations

Please return in JSON format:
{
  "score": score,
  "feedback": "feedback content",
  "guidance": "guidance hints",
  "needsImprovement": true/false,
  "accuracyRate": accuracy percentage
}`,
      // Interview progress evaluation prompt
      evaluateProgressPrompt: `Please evaluate the current interview progress:

Interview conversation record:
{conversationHistory}

Please analyze:
1. Quality and completeness of user answers
2. Technical depth and breadth
3. Communication and expression ability
4. Whether to continue the interview
5. Overall performance score

If the user performs well and has answered enough questions, please actively end the interview and provide a summary.`,
      // Knowledge base processing prompt
      processKnowledgeBasePrompt: `Please analyze the following content and extract key knowledge points for interview Q&A:

File name: {fileName}
Content:
{content}

Please extract the following information:
1. Main technical concepts and terms
2. Important knowledge points and key points
3. Possible interview questions
4. Related practical application scenarios

Please return in a structured format for subsequent interview use.`,
      // Interview evaluation prompt
      evaluationPrompt: `Please evaluate this interview as a professional interviewer.

Interview conversation record:
{conversationHistory}

{jobDescriptionContext}
{resumeContext}

Please evaluate from the following dimensions (0-100 points):
1. Technical Skills - Professional knowledge mastery
2. Communication - Language organization and expression ability
3. Problem Solving - Analysis and problem-solving ability
4. Work Attitude - Positivity and responsibility
5. Relevant Experience - Work experience matching

Please provide specific scores, feedback suggestions, and hiring recommendations.`,
      // Interview agent instructions
      agentInstructions: `You are a professional interview assistant with the following capabilities:

1. Generate relevant interview questions based on job descriptions and resumes
2. Generate relevant interview questions based on uploaded question bank content
3. Evaluate candidate answer quality
4. Provide personalized interview advice and improvement directions
5. Support various types of interviews including technical and behavioral interviews

Interview Process Guidance:
- When users say "start interview", warmly welcome them and ask the first question
- Ask only one interview question at a time and wait for user response
- After user answers, provide appropriate feedback and evaluation
- When users say "next question", "continue", "next question", etc., ask the next question
- If users upload a question bank, prioritize questions from the bank and avoid repetition
- Maintain interview rhythm and don't ask too many questions at once

Smart Termination and Summary Guidance:
- Continuously track user answer quality and accuracy rate
- Actively terminate current interview and summarize when any of the following conditions are met:
  * User achieves 85%+ accuracy rate for 3 consecutive questions
  * User has answered 5+ questions with overall average accuracy rate of 80%+
  * User has answered 8+ questions (regardless of accuracy rate)
- When terminating:
  * First congratulate user on completing current interview round
  * Summarize user's overall performance and highlights
  * Point out areas for improvement
  * Provide specific improvement suggestions
  * Encourage user to continue practicing
  * Clearly indicate they can start a new interview round
- Summary should include:
  * Answer accuracy and completeness
  * Technical depth and breadth
  * Communication and expression ability
  * Specific improvement suggestions
  * Overall score and accuracy rate

Answer Evaluation and Guidance:
- When users answer questions, carefully evaluate the completeness and depth of their responses
- If the answer is not comprehensive enough (e.g., too brief, lacks specific examples, unclear logic), do not provide the answer directly
- Instead, provide specific hints and guidance to help users think more deeply
- Hints should include:
  * Point out missing key points in the answer
  * Suggest users provide specific examples or experiences
  * Guide users to think from different perspectives
  * Encourage users to provide more detailed explanations
- Only provide more direct guidance when users explicitly request help or hints
- Maintain an encouraging and supportive attitude to help users build confidence

Interview Status Tracking:
- After each answer, evaluate answer quality and record scores
- Calculate average accuracy rate for the last 3 questions
- When accuracy rate meets termination conditions, immediately provide summary
- After summary, clearly inform users they can start a new interview round

When users upload question bank files, you should prioritize using question bank content to generate interview questions.
Please always maintain a professional, friendly, and constructive attitude.`
    },
    // Mastra features
    mastra: {
      title: 'Mastra AI Advanced Features',
      subtitle: 'Enhance interview experience with advanced AI agents and workflow technology',
      questionGenerator: 'Question Generator',
      answerEvaluator: 'Answer Evaluator',
      knowledgeBase: 'Knowledge Base',
      adviceGenerator: 'Advice Generator',
      generateQuestion: 'Generate Interview Question',
      questionType: 'Question Type',
      difficulty: 'Difficulty',
      technical: 'Technical',
      behavioral: 'Behavioral',
      situational: 'Situational',
      general: 'General',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      generatedQuestion: 'Generated Question',
      evaluateAnswer: 'Evaluate Answer',
      question: 'Question',
      answer: 'Answer',
      questionPlaceholder: 'Enter interview question...',
      answerPlaceholder: 'Enter your answer...',
      evaluate: 'Evaluate',
      evaluation: 'Evaluation Result',
      searchQuery: 'Search Query',
      searchPlaceholder: 'Enter search keywords...',
      searchResults: 'Search Results',
      generateAdvice: 'Generate Advice',
      conversationHistory: 'Conversation History',
      conversationPlaceholder: 'Enter interview conversation history...',
      adviceType: 'Advice Type',
      communication: 'Communication',
      advice: 'Advice'
    },
    // Error handling
    error: {
      title: 'An error occurred',
      retry: 'Retry',
      defaultMessage: 'Chat service is temporarily unavailable, please try again later',
      code: 'Error code'
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
