'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Save, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsConfig {
  baseURL: string
  apiKey: string
  model?: string // 新增模型字段
}

interface SettingsDialogProps {
  language: 'zh' | 'en'
  onSettingsChange?: (settings: SettingsConfig) => void
}

export function SettingsDialog({ language, onSettingsChange }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<SettingsConfig>({
    baseURL: '',
    apiKey: '',
    model: 'gpt-4o-mini', // 默认模型
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('interview-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({
          baseURL: parsed.baseURL || '',
          apiKey: parsed.apiKey || '',
          model: parsed.model || 'gpt-4o-mini',
        })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  // 保存设置到localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('interview-settings', JSON.stringify(settings))
      toast.success(language === 'zh' ? '设置已保存' : 'Settings saved')
      onSettingsChange?.(settings)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(language === 'zh' ? '保存设置失败' : 'Failed to save settings')
    }
  }

  // 重置设置
  const resetSettings = () => {
    setSettings({
      baseURL: '',
      apiKey: '',
      model: 'gpt-4o-mini',
    })
    localStorage.removeItem('interview-settings')
    toast.success(language === 'zh' ? '设置已重置' : 'Settings reset')
  }

  // 测试连接
  const testConnection = async () => {
    if (!settings.apiKey) {
      toast.error(language === 'zh' ? '请先输入API Key' : 'Please enter API Key first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseURL: settings.baseURL,
          apiKey: settings.apiKey,
          model: settings.model || 'gpt-4o-mini'
        })
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '连接测试成功' : 'Connection test successful')
      } else {
        const error = await response.json()
        toast.error(language === 'zh' ? `连接测试失败: ${error.error}` : `Connection test failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Connection test error:', error)
      toast.error(language === 'zh' ? '连接测试失败' : 'Connection test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const t = (key: string) => {
    const translations = {
      zh: {
        title: 'API 设置',
        subtitle: '配置 OpenAI API 连接参数',
        baseURL: 'Base URL',
        baseURLPlaceholder: 'https://api.openai.com/v1 (可选)',
        baseURLHelp: '如果不填写，将使用默认的 OpenAI API 地址',
        apiKey: 'API Key',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHelp: '您的 OpenAI API Key，用于访问 AI 服务',
        save: '保存设置',
        reset: '重置设置',
        testConnection: '测试连接',
        testing: '测试中...',
        showPassword: '显示',
        hidePassword: '隐藏',
        settingsSaved: '设置已保存',
        settingsReset: '设置已重置',
        enterApiKey: '请先输入API Key',
        connectionSuccess: '连接测试成功',
        connectionFailed: '连接测试失败',
        saveFailed: '保存设置失败',
        model: '模型选择',
        modelHelp: '选择用于对话的AI模型',
      },
      en: {
        title: 'API Settings',
        subtitle: 'Configure OpenAI API connection parameters',
        baseURL: 'Base URL',
        baseURLPlaceholder: 'https://api.openai.com/v1 (optional)',
        baseURLHelp: 'If not filled, the default OpenAI API address will be used',
        apiKey: 'API Key',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHelp: 'Your OpenAI API Key for accessing AI services',
        save: 'Save Settings',
        reset: 'Reset Settings',
        testConnection: 'Test Connection',
        testing: 'Testing...',
        showPassword: 'Show',
        hidePassword: 'Hide',
        settingsSaved: 'Settings saved',
        settingsReset: 'Settings reset',
        enterApiKey: 'Please enter API Key first',
        connectionSuccess: 'Connection test successful',
        connectionFailed: 'Connection test failed',
        saveFailed: 'Failed to save settings',
        model: 'Model',
        modelHelp: 'Select the AI model for conversation',
      }
    }
    return translations[language][key as keyof typeof translations.zh] || key
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          {t('title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('subtitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Base URL 设置 */}
              <div className="space-y-2">
                <Label htmlFor="baseURL">{t('baseURL')}</Label>
                <Input
                  id="baseURL"
                  type="url"
                  placeholder={t('baseURLPlaceholder')}
                  value={settings.baseURL}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseURL: e.target.value }))}
                />
                <p className="text-xs text-gray-500">{t('baseURLHelp')}</p>
              </div>

              {/* API Key 设置 */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">{t('apiKey')}</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={t('apiKeyPlaceholder')}
                    value={settings.apiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">{t('apiKeyHelp')}</p>
              </div>

              {/* 模型选择（可自定义输入） */}
              <div className="space-y-2">
                <Label htmlFor="model">{t('model')}</Label>
                <input
                  id="model"
                  className="w-full border rounded px-3 py-2 text-sm"
                  list="model-options"
                  value={settings.model}
                  onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="gpt-4o-mini"
                />
                <datalist id="model-options">
                  <option value="gpt-3.5-turbo" />
                  <option value="gpt-4o-mini" />
                  <option value="gpt-4o" />
                </datalist>
                <p className="text-xs text-gray-500">{t('modelHelp')}</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={saveSettings} 
                  className="flex-1"
                  disabled={!settings.apiKey.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetSettings}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('reset')}
                </Button>
              </div>

              {/* 测试连接按钮 */}
              <Button 
                variant="secondary" 
                onClick={testConnection}
                disabled={isLoading || !settings.apiKey.trim()}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? t('testing') : t('testConnection')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
