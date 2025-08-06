'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, MessageSquare, Lightbulb, RefreshCw, Upload, Settings, BarChart3 } from 'lucide-react'
import { FileUpload } from '@/components/file-upload'
import { EvaluationReport } from '@/components/evaluation-report'
import { LanguageSwitcher } from '@/components/language-switcher' // 导入新的 LanguageSwitcher
import { Language, t } from '@/lib/i18n'

export default function InterviewAssistant() {
  const [language, setLanguage] = useState<Language>('zh')
  const [context, setContext] = useState<{
    interviewQuestions?: string
    resume?: string
    jobDescription?: string
  }>({})
  
  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    body: { context, language }
  })
  
  const [inputValue, setInputValue] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  // 从localStorage加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('interview-language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // 保存语言设置到localStorage
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('interview-language', newLanguage)
  }
  
  // 快捷回复选项
  const quickReplies = [
    {
      text: t(language, 'quickReplies.helpAnswer'),
      icon: HelpCircle,
      variant: "default" as const
    },
    {
      text: t(language, 'quickReplies.getIdeas'),
      icon: Lightbulb,
      variant: "outline" as const
    },
    {
      text: t(language, 'quickReplies.nextQuestion'),
      icon: MessageSquare,
      variant: "outline" as const
    },
    {
      text: t(language, 'quickReplies.restart'),
      icon: RefreshCw,
      variant: "outline" as const
    }
  ]

  const handleQuickReply = (text: string) => {
    setInputValue(text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    const message = inputValue.trim()
    setInputValue('')
    
    await append({
      role: 'user',
      content: message
    })
  }

  const handleFilesUploaded = (newContext: typeof context) => {
    setContext(newContext)
    setShowUpload(false)
  }

  const handleEvaluate = async () => {
    if (messages.length === 0) {
      alert(t(language, 'evaluation.noMessages'))
      return
    }

    setEvaluating(true)
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          context,
          language
        })
      })

      if (!response.ok) {
        throw new Error('Evaluation failed')
      }

      const evaluationData = await response.json()
      setEvaluation(evaluationData)
      setShowEvaluation(true)
    } catch (error) {
      console.error('Evaluation error:', error)
      alert(t(language, 'evaluation.evaluationFailed'))
    } finally {
      setEvaluating(false)
    }
  }

  const hasUploadedFiles = Object.keys(context).length > 0
  const hasMessages = messages.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t(language, 'main.title')}</h1>
              <p className="text-gray-600">{t(language, 'main.subtitle')}</p>
            </div>
            <LanguageSwitcher 
              currentLang={language} 
              onLanguageChange={handleLanguageChange} 
            />
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {t(language, 'main.uploadFiles')}
                  {hasUploadedFiles && (
                    <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t(language, 'fileUpload.title')}</DialogTitle>
                </DialogHeader>
                <FileUpload language={language} onFilesUploaded={handleFilesUploaded} />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEvaluate}
              disabled={!hasMessages || evaluating}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {evaluating ? t(language, 'main.evaluating') : t(language, 'main.interviewEvaluation')}
            </Button>
          </div>
        </div>

        <Card className="h-[70vh] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                {t(language, 'main.aiInterviewer')}
              </div>
              {hasUploadedFiles && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Settings className="w-3 h-3" />
                  {t(language, 'main.personalizedContent')}
                </div>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t(language, 'main.welcome')}</p>
                  {hasUploadedFiles ? (
                    <p className="text-sm mt-2">{t(language, 'main.welcomeWithFiles')}</p>
                  ) : (
                    <p className="text-sm mt-2">{t(language, 'main.welcomeDefault')}</p>
                  )}
                </div>
              )}
              
              {messages.map(message => (
                <div key={message.id} className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white ml-auto' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.role === 'user' ? t(language, 'main.you') : t(language, 'main.aiInterviewer')}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>{language === 'zh' ? '我' : 'Me'}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="text-left mb-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="text-sm text-gray-500 ml-2">{t(language, 'main.aiThinking')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t bg-gray-50 flex-col gap-4">
            {/* 快捷回复按钮 */}
            <div className="w-full">
              <div className="text-sm text-gray-600 mb-2">{t(language, 'main.quickReplies')}</div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => {
                  const Icon = reply.icon
                  return (
                    <Button
                      key={index}
                      variant={reply.variant}
                      size="sm"
                      onClick={() => handleQuickReply(reply.text)}
                      className="text-xs"
                      disabled={isLoading}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {reply.text}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* 输入框 */}
            <form onSubmit={onSubmit} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder={t(language, 'main.inputPlaceholder')}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {t(language, 'common.send')}
              </Button>
            </form>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>{t(language, 'main.tip')}</p>
        </div>

        {/* 评估报告对话框 */}
        <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t(language, 'evaluation.title')}</DialogTitle>
            </DialogHeader>
            {evaluation && (
              <EvaluationReport 
                language={language}
                evaluation={evaluation} 
                onClose={() => setShowEvaluation(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
