'use client'

import { User } from '@/types'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Phase4FeaturesProps {
  user: User
  refreshTrigger?: number
}

interface BudgetOptimization {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reasoning: string;
  confidence: number;
  potentialSavings: number;
}

interface FinancialGoal {
  id: string;
  type: 'savings' | 'investment' | 'debt_payoff' | 'emergency_fund';
  name: string;
  targetAmount: number;
  currentAmount: number;
  timeline: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  nextAction: string;
}

interface PersonalizedInsight {
  id: string;
  category: 'spending_pattern' | 'savings_opportunity' | 'investment_advice' | 'risk_assessment';
  title: string;
  content: string;
  confidence: number;
  actionItems: string[];
  relatedTransactions: string[];
}

interface FinancialEducation {
  id: string;
  topic: string;
  title: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relevance: number;
  estimatedReadTime: number;
  tags: string[];
}

export default function Phase4Features({ user, refreshTrigger }: Phase4FeaturesProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'budget' | 'goals' | 'insights' | 'education'>('budget')
  const [optimizations, setOptimizations] = useState<BudgetOptimization[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [insights, setInsights] = useState<PersonalizedInsight[]>([])
  const [education, setEducation] = useState<FinancialEducation[]>([])

  useEffect(() => {
    if (user) {
      loadPhase4Data()
    }
  }, [user, refreshTrigger])

  const loadPhase4Data = async () => {
    try {
      setLoading(true)
      console.log('🚀 PHASE 4: Loading advanced AI features for user:', user.username)
      
      // Load all Phase 4 data
      const [optimizationsRes, goalsRes, insightsRes, educationRes] = await Promise.allSettled([
        apiClient.getBudgetOptimization(user.username),
        apiClient.getFinancialGoals(user.username),
        apiClient.getPersonalizedInsights(user.username),
        apiClient.getFinancialEducation(user.username)
      ])

      // Handle budget optimizations
      if (optimizationsRes.status === 'fulfilled' && optimizationsRes.value.success) {
        setOptimizations((optimizationsRes.value.data as Record<string, unknown>).optimizations as BudgetOptimization[])
      }

      // Handle financial goals
      if (goalsRes.status === 'fulfilled' && goalsRes.value.success) {
        setGoals((goalsRes.value.data as Record<string, unknown>).goals as FinancialGoal[])
      }

      // Handle personalized insights
      if (insightsRes.status === 'fulfilled' && insightsRes.value.success) {
        setInsights((insightsRes.value.data as Record<string, unknown>).insights as PersonalizedInsight[])
      }

      // Handle financial education
      if (educationRes.status === 'fulfilled' && educationRes.value.success) {
        setEducation((educationRes.value.data as Record<string, unknown>).education as FinancialEducation[])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading Phase 4 data:', error)
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600'
      case 'intermediate': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'savings': return '💰'
      case 'investment': return '📈'
      case 'debt_payoff': return '💳'
      case 'emergency_fund': return '🛡️'
      default: return '🎯'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-[12px] shadow-md p-6">
        <div className="flex items-center mb-4">
          <span className="text-[#A855F7] text-[18px] mr-2">🚀</span>
          <h2 className="text-[#111827] text-[15px] font-semibold">Phase 4: Advanced AI Features</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[12px] shadow-md" style={{ border: '1px solid #000000' }}>
      <div className="flex items-center mb-4 p-6 pb-0">
        <span className="text-[#A855F7] text-[18px] mr-2">🚀</span>
        <h2 className="text-[#111827] text-[15px] font-semibold">Phase 4: Advanced AI Features</h2>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-6">
        {[
          { key: 'budget', label: 'Budget AI', icon: '🤖' },
          { key: 'goals', label: 'Smart Goals', icon: '🎯' },
          { key: 'insights', label: 'AI Insights', icon: '🧠' },
          { key: 'education', label: 'Learn', icon: '📚' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'budget' | 'goals' | 'insights' | 'education')}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#A855F7] text-[#A855F7]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'budget' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">AI Budget Optimization</h3>
            {optimizations.length > 0 ? (
              <div className="space-y-4">
                {optimizations.map((opt, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-lg">{opt.category}</span>
                      <span className="text-sm text-gray-500">{(opt.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Current: ₹{opt.currentBudget.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Recommended: ₹{opt.recommendedBudget.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          Potential Savings: ₹{opt.potentialSavings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{opt.reasoning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No budget optimization data available</p>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Smart Financial Goals</h3>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{getGoalIcon(goal.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className={`text-sm ${getPriorityColor(goal.priority)}`}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{goal.recommendation}</p>
                    <p className="text-sm text-blue-600 font-medium">{goal.nextAction}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No financial goals available</p>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <span className="text-sm text-gray-500">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.content}</p>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Action Items:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {insight.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No personalized insights available</p>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Education</h3>
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((topic) => (
                  <div key={topic.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(topic.difficulty)} bg-gray-100`}>
                          {topic.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{topic.estimatedReadTime} min</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{topic.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{topic.relevance}% relevant</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No educational content available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 