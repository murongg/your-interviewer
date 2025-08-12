'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language: 'zh' | 'en'
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, language, disabled = false, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<any>(null)
  const [browserSupport, setBrowserSupport] = useState({
    speechRecognition: false,
    speechSynthesis: false
  })

  useEffect(() => {
    // 检查浏览器支持
    const checkBrowserSupport = () => {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      const hasSpeechSynthesis = 'speechSynthesis' in window
      
      setBrowserSupport({
        speechRecognition: hasSpeechRecognition,
        speechSynthesis: hasSpeechSynthesis
      })

      if (hasSpeechRecognition) {
        // 创建语音识别实例
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognitionClass()
        
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language === 'zh' ? 'zh-CN' : 'en-US'
        
        recognitionInstance.onstart = () => {
          setIsListening(true)
          setTranscript('')
        }
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          setTranscript(finalTranscript + interimTranscript)
        }
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          
          let errorMessage = '语音识别出错'
          if (language === 'en') {
            errorMessage = 'Speech recognition error'
          }
          
          if (event.error === 'not-allowed') {
            errorMessage = language === 'zh' ? '请允许麦克风权限' : 'Please allow microphone permission'
          } else if (event.error === 'no-speech') {
            errorMessage = language === 'zh' ? '没有检测到语音' : 'No speech detected'
          } else if (event.error === 'audio-capture') {
            errorMessage = language === 'zh' ? '无法捕获音频' : 'Cannot capture audio'
          }
          
          toast.error(errorMessage)
        }
        
        recognitionInstance.onend = () => {
          setIsListening(false)
          if (transcript.trim()) {
            onTranscript(transcript.trim())
            setTranscript('')
          }
        }
        
        setRecognition(recognitionInstance)
      }
    }
    
    checkBrowserSupport()
  }, [language, onTranscript])

  const startListening = () => {
    if (!recognition || disabled) return
    
    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start recognition:', error)
      toast.error(language === 'zh' ? '启动语音识别失败' : 'Failed to start speech recognition')
    }
  }

  const stopListening = () => {
    if (!recognition) return
    recognition.stop()
  }

  const speak = (text: string) => {
    if (!browserSupport.speechSynthesis || disabled) return
    
    // 停止当前播放
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      toast.error(language === 'zh' ? '语音合成出错' : 'Speech synthesis error')
    }
    
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (browserSupport.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!browserSupport.speechRecognition && !browserSupport.speechSynthesis) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="opacity-50"
          title={language === 'zh' ? '浏览器不支持语音功能' : 'Browser does not support voice features'}
        >
          <Mic className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="opacity-50"
          title={language === 'zh' ? '浏览器不支持语音功能' : 'Browser does not support voice features'}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* 语音输入按钮 */}
      {browserSupport.speechRecognition && (
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={handleMicClick}
          disabled={disabled}
          className={`transition-all duration-200 ${
            isListening ? 'animate-pulse' : ''
          }`}
          title={
            isListening
              ? language === 'zh' ? '点击停止录音' : 'Click to stop recording'
              : language === 'zh' ? '点击开始录音' : 'Click to start recording'
          }
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      )}
      
      {/* 语音播放按钮 */}
      {browserSupport.speechSynthesis && (
        <Button
          variant={isSpeaking ? "destructive" : "outline"}
          size="sm"
          onClick={isSpeaking ? stopSpeaking : () => speak('Hello, this is a test message')}
          disabled={disabled}
          className={`transition-all duration-200 ${
            isSpeaking ? 'animate-pulse' : ''
          }`}
          title={
            isSpeaking
              ? language === 'zh' ? '点击停止播放' : 'Click to stop playing'
              : language === 'zh' ? '点击测试语音' : 'Click to test voice'
          }
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      )}
      
      {/* 实时转录显示 */}
      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-lg p-3 shadow-lg max-w-md z-50">
          <div className="text-sm text-gray-600 mb-1">
            {language === 'zh' ? '正在识别...' : 'Recognizing...'}
          </div>
          <div className="text-sm font-medium">{transcript}</div>
        </div>
      )}
    </div>
  )
}
