// Web Speech API 类型声明
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string
  lang: string
  pitch: number
  rate: number
  volume: number
  onstart: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null
  onend: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null
  onerror: ((this: SpeechSynthesisUtterance, ev: Event) => any) | null
}

interface SpeechSynthesis extends EventTarget {
  speak(utterance: SpeechSynthesisUtterance): void
  cancel(): void
  pause(): void
  resume(): void
  getVoices(): SpeechSynthesisVoice[]
}

interface SpeechSynthesisVoice {
  voiceURI: string
  name: string
  lang: string
  localService: boolean
  default: boolean
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
    speechSynthesis: SpeechSynthesis
  }
}

export {}
