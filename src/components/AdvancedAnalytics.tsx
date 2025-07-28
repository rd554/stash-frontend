'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'
import { apiClient } from '@/lib/api'

interface AdvancedAnalyticsProps {
  user: User
  refreshTrigger?: number
}

interface SpendingTrend {
  period: string;
  totalSpent: number;
  categoryBreakdown: Record<string, number>;
  averageTransaction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface FinancialHealthScore {
  overall: number;
  spending: number;
  savings: number;
  budgeting: number;
  recommendations: string[];
}

interface MoodSpendCorrelation {
  dayOfWeek: string;
  averageSpend: number;
  moodIndicator: string;
  correlation: number;
}

interface PredictivePattern {
  category: string;
  predictedSpend: number;
  confidence: number;
  nextOccurrence: Date;
  recommendation: string;
}

interface CategoryInsight {
  category: string;
  amount: number;
  percentage: number;
  insight: string;
  recommendation: string;
}

export default function AdvancedAnalytics({ user, refreshTrigger }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'health' | 'mood' | 'predictions' | 'categories'>('trends')
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<SpendingTrend[]>([])
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null)
  const [correlations, setCorrelations] = useState<MoodSpendCorrelation[]>([])
  const [predictions, setPredictions] = useState<PredictivePattern[]>([])
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([])

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      // console.log('📊 ADVANCED ANALYTICS: Loading analytics for user:', user.username)
      
      // Load all analytics data
      const [trendsRes, healthRes, correlationsRes, predictionsRes, categoriesRes] = await Promise.allSettled([
        apiClient.getSpendingTrends(user.username, 3),
        apiClient.getFinancialHealthScore(user.username),
        apiClient.getMoodSpendCorrelation(user.username),
        apiClient.getPredictivePatterns(user.username),
        apiClient.getCategoryInsights(user.username)
      ])

      // Handle trends
      if (trendsRes.status === 'fulfilled' && trendsRes.value.success) {
        setTrends((trendsRes.value.data as { trends: SpendingTrend[] }).trends)
      }

      // Handle health score
      if (healthRes.status === 'fulfilled' && healthRes.value.success) {
        setHealthScore((healthRes.value.data as { healthScore: FinancialHealthScore }).healthScore)
      }

      // Handle correlations
      if (correlationsRes.status === 'fulfilled' && correlationsRes.value.success) {
        setCorrelations((correlationsRes.value.data as { correlations: MoodSpendCorrelation[] }).correlations)
      }

      // Handle predictions
      if (predictionsRes.status === 'fulfilled' && predictionsRes.value.success) {
        setPredictions((predictionsRes.value.data as { predictions: PredictivePattern[] }).predictions)
      }

      // Handle category insights
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.success) {
        setCategoryInsights((categoriesRes.value.data as { categoryInsights: CategoryInsight[] }).categoryInsights)
      }

    } catch (error) {
      console.error('📊 ADVANCED ANALYTICS: Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [user.username])

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, refreshTrigger, loadAnalytics])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈'
      case 'decreasing': return '📉'
      default: return '➡️'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'high_spending': return '😰'
      case 'low_spending': return '😊'
      default: return '😐'
    }
  }

  if (loading) {
    return (
      <div className="elegant-card elegant-card-padding">
        <div className="flex items-center mb-4">
          <h2 className="elegant-heading text-[15px]">Advanced Analytics</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="elegant-card">
      <div className="flex items-center mb-4 p-6 pb-0">
        <h2 className="elegant-heading text-[15px]">Advanced Analytics</h2>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-6">
        {[
          { key: 'trends', label: 'Trends' },
          { key: 'health', label: 'Health Score' },
          { key: 'mood', label: 'Mood Analysis' },
          { key: 'predictions', label: 'Predictions' },
          { key: 'categories', label: 'Categories' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'trends' | 'health' | 'mood' | 'predictions' | 'categories')}
            className={`elegant-tab flex items-center px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key
                ? 'elegant-tab-active border-transparent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
            {trends.length > 0 ? (
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{trend.period}</span>
                      <span className="text-2xl">{getTrendIcon(trend.trend)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Total Spent: ₹{trend.totalSpent.toLocaleString()}</p>
                      <p>Average Transaction: ₹{trend.averageTransaction.toLocaleString()}</p>
                      <p>Trend: {trend.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No trend data available</p>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Health Score</h3>
            {healthScore ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getHealthColor(healthScore.overall)}`}>
                    {healthScore.overall}/100
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-xl font-semibold ${getHealthColor(healthScore.spending)}`}>
                      {healthScore.spending}
                    </div>
                    <p className="text-xs text-gray-600">Spending</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-semibold ${getHealthColor(healthScore.savings)}`}>
                      {healthScore.savings}
                    </div>
                    <p className="text-xs text-gray-600">Savings</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-semibold ${getHealthColor(healthScore.budgeting)}`}>
                      {healthScore.budgeting}
                    </div>
                    <p className="text-xs text-gray-600">Budgeting</p>
                  </div>
                </div>

                {healthScore.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {healthScore.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Health score not available</p>
            )}
          </div>
        )}

        {activeTab === 'mood' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Mood-Spend Correlation</h3>
            {correlations.length > 0 ? (
              <div className="space-y-3">
                {correlations.map((correlation, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getMoodIcon(correlation.moodIndicator)}</span>
                      <div>
                        <p className="font-medium">{correlation.dayOfWeek}</p>
                        <p className="text-sm text-gray-600">₹{correlation.averageSpend.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(correlation.correlation * 100)}%</p>
                      <p className="text-xs text-gray-600">Correlation</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No mood correlation data available</p>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Predictive Patterns</h3>
            {predictions.length > 0 ? (
              <div className="space-y-3">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{prediction.category}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Predicted: ₹{prediction.predictedSpend.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Next: {new Date(prediction.nextOccurrence).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700">{prediction.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No prediction data available</p>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Category Insights</h3>
            {categoryInsights.length > 0 ? (
              <div className="space-y-3">
                {categoryInsights.map((insight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{insight.category}</span>
                      <span className="text-sm font-medium">{insight.percentage}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      ₹{insight.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">{insight.insight}</p>
                    <p className="text-xs text-gray-500">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No category insights available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 