'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react'
import { Language, t } from '@/lib/i18n'
import { useRouter, usePathname } from 'next/navigation'

interface LanguageSwitcherProps {
  currentLang: Language
  onLanguageChange: (newLang: Language) => void
}

export function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLang: Language) => {
    onLanguageChange(newLang)
    const newPath = `/${newLang}${pathname.substring(3)}` // /zh/path -> /en/path
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {currentLang === 'zh' ? '中文' : 'English'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('zh')}>
          中文
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
