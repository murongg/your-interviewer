'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileArchive, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Language, t } from '@/lib/i18n'

interface ResumeFileUploadProps {
  language: Language
  onFilesUploaded: (files: Array<{ name: string; content: string }>) => void
}

interface ProjectFile {
  name: string
  content: string
  size: number
  type: string
}

export function ResumeFileUpload({ language, onFilesUploaded }: ResumeFileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedFiles, setExtractedFiles] = useState<ProjectFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedFormats = ['.zip', '.rar', '.tar', '.tar.gz', '.7z']

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    const isSupported = supportedFormats.some(format => fileName.endsWith(format))
    
    if (!isSupported) {
      setError(t(language, 'resumeFileUpload.unsupportedFormat'))
      return
    }

    setError(null)
    setUploadedFile(file)
    setExtractedFiles([])
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('type', 'project-archive')

      const response = await fetch('/api/upload-project', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || t(language, 'resumeFileUpload.uploadFailed'))
      }

      const result = await response.json()
      await extractProjectFiles(result.files)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : t(language, 'resumeFileUpload.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  const extractProjectFiles = async (files: any[]) => {
    setExtracting(true)
    setError(null)

    try {
      const extractedFiles: ProjectFile[] = []
      
      for (const file of files) {
        // 过滤掉空文件、纯空白文件、只有注释的文件
        if (file.content && 
            file.content.trim().length > 10 && // 至少10个字符
            !file.content.trim().match(/^\s*$/) && // 不是纯空白文件
            !file.content.trim().match(/^\/\*[\s\S]*\*\/\s*$/) && // 不是只有注释的文件
            !file.content.trim().match(/^\/\/.*$/)) { // 不是只有单行注释的文件
          
          extractedFiles.push({
            name: file.name,
            content: file.content,
            size: file.size || 0,
            type: file.type || 'unknown'
          })
        }
      }

      setExtractedFiles(extractedFiles)
      onFilesUploaded(extractedFiles)
      
    } catch (error) {
      console.error('Extraction error:', error)
      setError(t(language, 'resumeFileUpload.extractionFailed'))
    } finally {
      setExtracting(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setExtractedFiles([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['js', 'ts', 'jsx', 'tsx'].includes(ext || '')) return '📱'
    if (['py'].includes(ext || '')) return '🐍'
    if (['java'].includes(ext || '')) return '☕'
    if (['cpp', 'c', 'h'].includes(ext || '')) return '⚙️'
    if (['html', 'css'].includes(ext || '')) return '🌐'
    if (['json', 'xml', 'yaml', 'yml'].includes(ext || '')) return '📄'
    if (['md', 'txt'].includes(ext || '')) return '📝'
    return '📁'
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-file">
          {t(language, 'resumeFileUpload.selectProjectFile')}
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="project-file"
            ref={fileInputRef}
            type="file"
            accept=".zip,.rar,.tar,.tar.gz,.7z"
            onChange={handleFileSelect}
            className="flex-1"
          />
          {uploadedFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {t(language, 'resumeFileUpload.supportedFormats')}: {supportedFormats.join(', ')}
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {uploadedFile && (
        <Button
          onClick={handleFileUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(language, 'resumeFileUpload.uploading')}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t(language, 'resumeFileUpload.uploadAndExtract')}
            </>
          )}
        </Button>
      )}

      {extracting && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-700">
            {t(language, 'resumeFileUpload.extracting')}
          </span>
        </div>
      )}

      {extractedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileArchive className="h-5 w-5" />
              <span>
                {t(language, 'resumeFileUpload.extractedFiles')} ({extractedFiles.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {extractedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(file.name)}</span>
                    <span className="text-sm text-gray-700 truncate max-w-48">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                {t(language, 'resumeFileUpload.howItWorks')}
              </p>
              <ul className="space-y-1 text-xs">
                <li>• {t(language, 'resumeFileUpload.step1')}</li>
                <li>• {t(language, 'resumeFileUpload.step2')}</li>
                <li>• {t(language, 'resumeFileUpload.step3')}</li>
                <li>• {t(language, 'resumeFileUpload.step4')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
