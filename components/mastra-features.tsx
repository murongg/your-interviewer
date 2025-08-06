'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MastraResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function MastraFeatures() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [questionType, setQuestionType] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState('');
  const [adviceType, setAdviceType] = useState('general');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const callMastraAPI = async (action: string, data: any): Promise<MastraResponse> => {
    try {
      const response = await fetch('/api/mastra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const handleGenerateQuestion = async () => {
    setLoading(true);
    const result = await callMastraAPI('generate_question', {
      jobDescription,
      resume,
      questionType,
      difficulty
    });
    setResponse(result);
    setLoading(false);
  };

  const handleEvaluateAnswer = async () => {
    setLoading(true);
    const result = await callMastraAPI('evaluate_answer', {
      question,
      answer,
      jobDescription
    });
    setResponse(result);
    setLoading(false);
  };

  const handleProvideAdvice = async () => {
    setLoading(true);
    const result = await callMastraAPI('provide_advice', {
      conversationHistory,
      jobDescription,
      adviceType
    });
    setResponse(result);
    setLoading(false);
  };

  const handleSummarizeInterview = async () => {
    setLoading(true);
    const result = await callMastraAPI('summarize_interview', {
      conversationHistory,
      jobDescription,
      resume
    });
    setResponse(result);
    setLoading(false);
  };

  const handleRunAgent = async () => {
    setLoading(true);
    const result = await callMastraAPI('run_agent', {
      messages: [
        { role: 'user', content: '请生成一个面试问题' }
      ],
      context: {
        jobDescription,
        resume
      }
    });
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Mastra 面试助手功能演示</h1>
        <p className="text-muted-foreground">
          使用 Mastra 框架的 Agent 和工具功能
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>输入职位描述和简历信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobDescription">职位描述</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="请输入职位描述..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="resume">简历内容</Label>
                <Textarea
                  id="resume"
                  placeholder="请输入简历内容..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>问题生成</CardTitle>
              <CardDescription>使用 Mastra 工具生成面试问题</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionType">问题类型</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">通用</SelectItem>
                      <SelectItem value="technical">技术</SelectItem>
                      <SelectItem value="behavioral">行为</SelectItem>
                      <SelectItem value="situational">情境</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">难度</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">简单</SelectItem>
                      <SelectItem value="medium">中等</SelectItem>
                      <SelectItem value="hard">困难</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleGenerateQuestion} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '生成中...' : '生成面试问题'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>答案评估</CardTitle>
              <CardDescription>使用 Mastra 工具评估面试答案</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">面试问题</Label>
                <Input
                  id="question"
                  placeholder="请输入面试问题..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="answer">候选答案</Label>
                <Textarea
                  id="answer"
                  placeholder="请输入候选人的答案..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleEvaluateAnswer} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '评估中...' : '评估答案'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>面试建议</CardTitle>
              <CardDescription>使用 Mastra 工具提供面试建议</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="conversationHistory">对话历史</Label>
                <Textarea
                  id="conversationHistory"
                  placeholder="请输入面试对话历史..."
                  value={conversationHistory}
                  onChange={(e) => setConversationHistory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="adviceType">建议类型</Label>
                <Select value={adviceType} onValueChange={setAdviceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">通用建议</SelectItem>
                    <SelectItem value="technical">技术建议</SelectItem>
                    <SelectItem value="communication">沟通建议</SelectItem>
                    <SelectItem value="confidence">自信建议</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleProvideAdvice} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '生成中...' : '生成建议'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>面试总结</CardTitle>
              <CardDescription>使用 Mastra 工具总结面试表现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSummarizeInterview} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '总结中...' : '总结面试'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>智能代理</CardTitle>
              <CardDescription>使用 Mastra Agent 进行智能处理</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRunAgent} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '处理中...' : '运行智能代理'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 输出区域 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Mastra 响应结果</CardTitle>
              <CardDescription>查看 Mastra 工具和 Agent 的响应</CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={response.success ? "default" : "destructive"}>
                      {response.success ? "成功" : "失败"}
                    </Badge>
                    {response.error && (
                      <Badge variant="outline">错误: {response.error}</Badge>
                    )}
                  </div>
                  
                  {response.data && (
                    <div className="space-y-4">
                      <Separator />
                      
                      {response.data.question && (
                        <div>
                          <h4 className="font-semibold mb-2">生成的面试问题</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{response.data.question}</p>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="secondary">类型: {response.data.type}</Badge>
                            <Badge variant="secondary">难度: {response.data.difficulty}</Badge>
                          </div>
                        </div>
                      )}

                      {response.data.score !== undefined && (
                        <div>
                          <h4 className="font-semibold mb-2">评估结果</h4>
                          <div className="p-3 bg-muted rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">评分:</span>
                              <Badge variant="outline">{response.data.score}/10</Badge>
                            </div>
                            <div>
                              <span className="font-medium">反馈:</span>
                              <p className="text-sm mt-1">{response.data.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {response.data.advice && (
                        <div>
                          <h4 className="font-semibold mb-2">面试建议</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{response.data.advice}</p>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary">类型: {response.data.type}</Badge>
                          </div>
                        </div>
                      )}

                      {response.data.summary && (
                        <div>
                          <h4 className="font-semibold mb-2">面试总结</h4>
                          <div className="p-3 bg-muted rounded-md space-y-3">
                            <div>
                              <span className="font-medium">总结:</span>
                              <p className="text-sm mt-1">{response.data.summary}</p>
                            </div>
                            {response.data.strengths && response.data.strengths.length > 0 && (
                              <div>
                                <span className="font-medium">优点:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {response.data.strengths.map((strength: string, index: number) => (
                                    <Badge key={index} variant="outline">{strength}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {response.data.weaknesses && response.data.weaknesses.length > 0 && (
                              <div>
                                <span className="font-medium">需要改进:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {response.data.weaknesses.map((weakness: string, index: number) => (
                                    <Badge key={index} variant="destructive">{weakness}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {response.data.overallScore !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">总体评分:</span>
                                <Badge variant="outline">{response.data.overallScore}/10</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {response.data.content && (
                        <div>
                          <h4 className="font-semibold mb-2">智能代理响应</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{response.data.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  点击左侧按钮开始使用 Mastra 功能
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
