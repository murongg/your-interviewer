'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, AlertCircle, CheckCircle, Award } from 'lucide-react'
import { Language, t } from '@/lib/i18n'

interface EvaluationData {
  overallScore: number
  dimensions: {
    technicalSkills: { score: number; feedback: string }
    communication: { score: number; feedback: string }
    problemSolving: { score: number; feedback: string }
    attitude: { score: number; feedback: string }
    experience: { score: number; feedback: string }
  }
  strengths: string[]
  improvements: string[]
  recommendation: 'stronglyRecommend' | 'recommend' | 'average' | 'notRecommend'
  summary: string
}

interface EvaluationReportProps {
  language: Language
  evaluation: EvaluationData
  onClose: () => void
}

export function EvaluationReport({ language, evaluation, onClose }: EvaluationReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'stronglyRecommend': return 'bg-green-500'
      case 'recommend': return 'bg-blue-500'
      case 'average': return 'bg-yellow-500'
      case 'notRecommend': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 总体评分 */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            {t(language, 'evaluation.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBackground(evaluation.overallScore)} ${getScoreColor(evaluation.overallScore)}`}>
            {evaluation.overallScore}
          </div>
          <p className="text-lg font-semibold mt-2">{t(language, 'evaluation.overallScore')}</p>
          <Badge 
            className={`mt-2 ${getRecommendationColor(evaluation.recommendation)} text-white`}
          >
            {t(language, `evaluation.recommendation.${evaluation.recommendation}`)}
          </Badge>
        </CardContent>
      </Card>

      {/* 各维度评分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {t(language, 'evaluation.detailedScore')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(evaluation.dimensions).map(([key, dimension]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t(language, `evaluation.dimensions.${key}`)}</span>
                <span className={`font-bold ${getScoreColor(dimension.score)}`}>
                  {dimension.score}{language === 'zh' ? '分' : ' pts'}
                </span>
              </div>
              <Progress 
                value={dimension.score} 
                className="h-2"
              />
              <p className="text-sm text-gray-600">{dimension.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 优势亮点 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            {t(language, 'evaluation.strengths')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 改进建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <TrendingUp className="w-5 h-5" />
            {t(language, 'evaluation.improvements')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {evaluation.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 总体评价 */}
      <Card>
        <CardHeader>
          <CardTitle>{t(language, 'evaluation.overallEvaluation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{evaluation.summary}</p>
        </CardContent>
      </Card>
    </div>
  )
}
