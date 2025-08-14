'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileCode, Download, RefreshCw, Upload, Sparkles, Settings } from 'lucide-react'
import { ResumeFileUpload } from '@/components/resume-file-upload'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MarkdownMessage } from '@/components/markdown-message'
import { Toaster } from 'sonner'
import { Language, t } from '@/lib/i18n'

export default function ResumeGenerator() {
  const [language, setLanguage] = useState<Language>('zh')
  const [generating, setGenerating] = useState(false)
  const [resume, setResume] = useState<string>('')
  const [projectFiles, setProjectFiles] = useState<Array<{ name: string; content: string }>>([])
  const [apiKey, setApiKey] = useState<string>('')
  const [apiUrl, setApiUrl] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini')
  const [customModel, setCustomModel] = useState<string>('')
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false)

  // 从localStorage加载语言设置和API配置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('interview-language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }

        // 从localStorage加载API配置
    const savedApiKey = localStorage.getItem('openai-api-key')
    const savedApiUrl = localStorage.getItem('openai-api-url')
    const savedModel = localStorage.getItem('openai-model')
    const savedCustomModel = localStorage.getItem('openai-custom-model')
    const savedIsCustomModel = localStorage.getItem('openai-is-custom-model')
    
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    if (savedApiUrl) {
      setApiUrl(savedApiUrl)
    }
    if (savedModel) {
      setSelectedModel(savedModel)
    }
    if (savedCustomModel) {
      setCustomModel(savedCustomModel)
    }
    if (savedIsCustomModel) {
      setIsCustomModel(savedIsCustomModel === 'true')
    }
  }, [])

  // 保存语言设置到localStorage
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('interview-language', newLanguage)
  }

  // 保存API key到localStorage
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey)
    localStorage.setItem('openai-api-key', newApiKey)
  }

  // 保存API URL到localStorage
  const handleApiUrlChange = (newApiUrl: string) => {
    setApiUrl(newApiUrl)
    localStorage.setItem('openai-api-url', newApiUrl)
  }

  // 保存选择的模型到localStorage
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel)
    setIsCustomModel(false)
    localStorage.setItem('openai-model', newModel)
    localStorage.setItem('openai-is-custom-model', 'false')
  }

  // 保存自定义模型到localStorage
  const handleCustomModelChange = (newCustomModel: string) => {
    setCustomModel(newCustomModel)
    setIsCustomModel(true)
    localStorage.setItem('openai-custom-model', newCustomModel)
    localStorage.setItem('openai-is-custom-model', 'true')
  }

  // 处理项目文件上传
  const handleProjectFilesUploaded = (files: Array<{ name: string; content: string }>) => {
    setProjectFiles(files)
  }

  // 生成简历
  const generateResume = async () => {
    if (!apiKey.trim()) {
      alert('请输入OpenAI API Key')
      return
    }

    if (projectFiles.length === 0) {
      alert(t(language, 'resumeGenerator.uploadFilesFirst'))
      return
    }

    setGenerating(true)
    setResume('') // 清空之前的简历

    try {
      const response = await fetch('/api/resume-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectFiles,
          language,
          apiKey,
          apiUrl,
          model: isCustomModel ? customModel : selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error(t(language, 'resumeGenerator.generationFailed'))
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const resumeContent = line.slice(6)
              if (resumeContent.trim()) {
                // 尝试解析JSON
                try {
                  const parsed = JSON.parse(resumeContent)

                  switch (parsed.type) {
                    case 'start':
                      // 开始消息，可以显示进度
                      console.log('开始:', parsed.message)
                      break
                    case 'progress':
                      // 进度消息，可以显示进度
                      console.log('进度:', parsed.message)
                      break
                    case 'text-chunk':
                      // 流式文本块，追加到简历内容
                      setResume(prev => prev + parsed.text)
                      break
                    case 'complete':
                      // 完成消息，设置简历内容
                      if (parsed.resume) {
                        setResume(parsed.resume)
                      }
                      break
                    case 'error':
                      // 错误消息
                      throw new Error(parsed.error)
                    default:
                      // 其他情况，尝试设置简历内容
                      if (parsed.text) {
                        setResume(parsed.text)
                      } else if (typeof parsed === 'string') {
                        setResume(parsed)
                      }
                  }
                } catch (jsonError) {
                  // 如果不是JSON，直接使用文本内容
                  setResume(resumeContent)
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse resume data:', parseError)
            }
          }
        }
      }

    } catch (error) {
      console.error('Resume generation error:', error)
      alert(error instanceof Error ? error.message : t(language, 'resumeGenerator.generationFailed'))
    } finally {
      setGenerating(false)
    }
  }

  // 下载简历
  const downloadResume = () => {
    if (!resume) return

    const blob = new Blob([resume], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t(language, 'resumeGenerator.title')}
              </h1>
              <p className="text-gray-600">
                {t(language, 'resumeGenerator.subtitle')}
              </p>
            </div>
          </div>
          <LanguageSwitcher currentLang={language} onLanguageChange={handleLanguageChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：文件上传和生成 */}
          <div className="space-y-6">
            {/* API配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>API配置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key *
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Base URL (可选)
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => handleApiUrlChange(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择模型
                  </label>
                  <div className="space-y-2">
                    <select
                      value={isCustomModel ? 'custom' : selectedModel}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomModel(true)
                          localStorage.setItem('openai-is-custom-model', 'true')
                        } else {
                          handleModelChange(e.target.value)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (推荐)</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="custom">自定义模型</option>
                    </select>
                    
                    {isCustomModel && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customModel}
                          onChange={(e) => handleCustomModelChange(e.target.value)}
                          placeholder="输入模型名称，如: gpt-4-1106-preview"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          支持OpenAI、Anthropic等平台的模型名称
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 文件上传 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>{t(language, 'resumeGenerator.uploadProject')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResumeFileUpload
                  language={language}
                  onFilesUploaded={handleProjectFilesUploaded}
                />
              </CardContent>
            </Card>

            {/* 生成按钮 */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={generateResume}
                  disabled={generating || projectFiles.length === 0 || !apiKey.trim()}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      {t(language, 'resumeGenerator.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t(language, 'resumeGenerator.generateResume')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 项目文件列表 */}
            {projectFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t(language, 'resumeGenerator.uploadedFiles')} ({projectFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-2 pr-4">
                      {projectFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <FileCode className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Math.round(file.content.length / 1024)}KB
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Badge variant="secondary" className="text-xs">
                              {file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：生成的简历 */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileCode className="h-5 w-5" />
                    <span>{t(language, 'resumeGenerator.generatedResume')}</span>
                  </CardTitle>
                  {resume && (
                    <Button
                      onClick={downloadResume}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t(language, 'resumeGenerator.download')}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {resume ? (
                  // <ScrollArea className="w-full h-[600px]">

                  // </ScrollArea>
                  <div className="min-w-full">
                    <MarkdownMessage content={resume} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[600px] text-gray-500">
                    <div className="text-center">
                      <FileCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>{t(language, 'resumeGenerator.noResumeYet')}</p>
                      <p className="text-sm">{t(language, 'resumeGenerator.uploadAndGenerate')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
