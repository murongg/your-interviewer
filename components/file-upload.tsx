'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, User, Briefcase, X, CheckCircle, FileCode } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Language, t } from '@/lib/i18n'

interface FileUploadProps {
  language: Language
  onFilesUploaded: (context: {
    interviewQuestions?: string
    resume?: string
    jobDescription?: string
    knowledgeBase?: string
  }) => void
}

interface UploadedFile {
  name: string
  type: string
  content: string
  size: number
  fileType: string
}

export function FileUpload({ language, onFilesUploaded }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{
    interviewQuestions?: UploadedFile
    resume?: UploadedFile
    jobDescription?: UploadedFile
    knowledgeBase?: UploadedFile
  }>({})
  const [uploading, setUploading] = useState<string | null>(null)

  const handleFileUpload = async (file: File, type: string) => {
    // 前置校验：仅支持 Markdown 文件
    if (!file.name.toLowerCase().endsWith('.md')) {
      alert(t(language, 'fileUpload.onlyMarkdown'))
      return
    }

    setUploading(type)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        // 如果服务端返回错误，尝试读取具体错误信息
        try {
          const err = await response.json()
          throw new Error(err?.error || t(language, 'fileUpload.uploadFailed'))
        } catch (_) {
          throw new Error(t(language, 'fileUpload.uploadFailed'))
        }
      }

      const result = await response.json()
      
      const newFile: UploadedFile = {
        name: result.fileName,
        type: result.fileType,
        content: result.content,
        size: result.size,
        fileType: result.fileType
      }

      const newUploadedFiles = {
        ...uploadedFiles,
        [type]: newFile
      }
      
      setUploadedFiles(newUploadedFiles)
      
      // 通知父组件文件已上传
      const context: any = {}
      if (newUploadedFiles.interviewQuestions) {
        context.interviewQuestions = newUploadedFiles.interviewQuestions.content
      }
      if (newUploadedFiles.resume) {
        context.resume = newUploadedFiles.resume.content
      }
      if (newUploadedFiles.jobDescription) {
        context.jobDescription = newUploadedFiles.jobDescription.content
      }
      if (newUploadedFiles.knowledgeBase) {
        context.knowledgeBase = newUploadedFiles.knowledgeBase.content
      }
      
      onFilesUploaded(context)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(t(language, 'fileUpload.uploadFailed'))
    } finally {
      setUploading(null)
    }
  }

  const removeFile = (type: string) => {
    const newUploadedFiles = { ...uploadedFiles }
    delete newUploadedFiles[type as keyof typeof uploadedFiles]
    setUploadedFiles(newUploadedFiles)
    
    // 更新上下文
    const context: any = {}
    if (newUploadedFiles.interviewQuestions) {
      context.interviewQuestions = newUploadedFiles.interviewQuestions.content
    }
    if (newUploadedFiles.resume) {
      context.resume = newUploadedFiles.resume.content
    }
    if (newUploadedFiles.jobDescription) {
      context.jobDescription = newUploadedFiles.jobDescription.content
    }
    if (newUploadedFiles.knowledgeBase) {
      context.knowledgeBase = newUploadedFiles.knowledgeBase.content
    }
    
    onFilesUploaded(context)
  }

  const FileUploadCard = ({ 
    type, 
    title, 
    description, 
    icon: Icon, 
    accept 
  }: {
    type: string
    title: string
    description: string
    icon: any
    accept: string
  }) => {
    const file = uploadedFiles[type as keyof typeof uploadedFiles]
    const isUploading = uploading === type

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{file.name}</span>
                  {file.fileType && (
                    <Badge variant="outline" className="text-xs">
                      {file.fileType.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(type)}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{description}</p>
              <div className="relative">
                <Input
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      handleFileUpload(selectedFile, type)
                    }
                  }}
                  className="hidden"
                  id={`file-${type}`}
                  disabled={isUploading}
                />
                <Label
                  htmlFor={`file-${type}`}
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? t(language, 'fileUpload.uploading') : t(language, 'fileUpload.clickToUpload')}
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">{t(language, 'fileUpload.title')}</h2>
        <p className="text-sm text-gray-600">{t(language, 'fileUpload.subtitle')}</p>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">{t(language, 'fileUpload.interviewQuestions')}</TabsTrigger>
          <TabsTrigger value="resume">{t(language, 'fileUpload.resume')}</TabsTrigger>
          <TabsTrigger value="job">{t(language, 'fileUpload.jobDescription')}</TabsTrigger>
          <TabsTrigger value="knowledge">{t(language, 'fileUpload.knowledgeBase')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-4">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {language === 'zh' ? '💡 题库功能说明' : '💡 Question Bank Feature'}
              </h3>
              <p className="text-sm text-blue-700">
                {language === 'zh' 
                  ? '上传题库文件后，AI面试官将基于题库内容生成相关面试题，提供更精准的面试体验。'
                  : 'After uploading a question bank file, the AI interviewer will generate relevant interview questions based on the content, providing a more targeted interview experience.'
                }
              </p>
            </div>
            <FileUploadCard
              type="interviewQuestions"
              title={t(language, 'fileUpload.interviewQuestions')}
              description={t(language, 'fileUpload.interviewQuestionsDesc')}
              icon={FileText}
              accept=".md"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="resume" className="mt-4">
          <FileUploadCard
            type="resume"
            title={t(language, 'fileUpload.resume')}
            description={t(language, 'fileUpload.resumeDesc')}
            icon={User}
            accept=".md"
          />
        </TabsContent>
        
        <TabsContent value="job" className="mt-4">
          <FileUploadCard
            type="jobDescription"
            title={t(language, 'fileUpload.jobDescription')}
            description={t(language, 'fileUpload.jobDescriptionDesc')}
            icon={Briefcase}
            accept=".md"
          />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <FileUploadCard
            type="knowledgeBase"
            title={t(language, 'fileUpload.knowledgeBase')}
            description={t(language, 'fileUpload.knowledgeBaseDesc')}
            icon={FileCode}
            accept=".md"
          />
        </TabsContent>
      </Tabs>

      {Object.keys(uploadedFiles).length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">{t(language, 'fileUpload.uploadedFiles')}</h3>
          <div className="space-y-1">
            {uploadedFiles.interviewQuestions && (
              <Badge variant="outline" className="mr-2">{t(language, 'fileUpload.interviewQuestions')}: {uploadedFiles.interviewQuestions.name}</Badge>
            )}
            {uploadedFiles.resume && (
              <Badge variant="outline" className="mr-2">{t(language, 'fileUpload.resume')}: {uploadedFiles.resume.name}</Badge>
            )}
            {uploadedFiles.jobDescription && (
              <Badge variant="outline" className="mr-2">{t(language, 'fileUpload.jobDescription')}: {uploadedFiles.jobDescription.name}</Badge>
            )}
            {uploadedFiles.knowledgeBase && (
              <Badge variant="outline" className="mr-2">{t(language, 'fileUpload.knowledgeBase')}: {uploadedFiles.knowledgeBase.name}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
