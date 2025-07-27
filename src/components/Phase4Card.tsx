'use client'

import { User } from '@/types'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Phase4CardProps {
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

export default function Phase4Card({ user, refreshTrigger }: Phase4CardProps) {
  const [loading, setLoading] = useState(true)
  const [optimizations, setOptimizations] = useState<BudgetOptimization[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0)
  const [highPriorityGoals, setHighPriorityGoals] = useState(0)

  useEffect(() => {
    if (user) {
      loadPhase4Summary()
    }
  }, [user, refreshTrigger])

  const loadPhase4Summary = async () => {
    try {
      setLoading(true)
      
      // Load budget optimization and goals for summary
      const [optimizationsRes, goalsRes] = await Promise.allSettled([
        apiClient.getBudgetOptimization(user.username),
        apiClient.getFinancialGoals(user.username)
      ])

      if (optimizationsRes.status === 'fulfilled' && optimizationsRes.value.success) {
        setOptimizations((optimizationsRes.value.data as any).optimizations)
        setTotalPotentialSavings((optimizationsRes.value.data as any).totalPotentialSavings)
      }

      if (goalsRes.status === 'fulfilled' && goalsRes.value.success) {
        setGoals((goalsRes.value.data as any).goals)
        setHighPriorityGoals((goalsRes.value.data as any).highPriorityGoals)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading Phase 4 summary:', error)
      setLoading(false)
    }
  }

  const getTopOptimization = () => {
    return optimizations.length > 0 ? optimizations[0] : null
  }

  const getTopGoal = () => {
    return goals.filter(g => g.priority === 'high').length > 0 
      ? goals.filter(g => g.priority === 'high')[0] 
      : goals.length > 0 ? goals[0] : null
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="elegant-card elegant-card-padding">
        <div className="flex items-center mb-3">
          <h3 className="elegant-heading text-[14px]">AI Features</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const topOptimization = getTopOptimization()
  const topGoal = getTopGoal()

  return (
    <div className="elegant-card elegant-card-padding">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="elegant-heading text-[14px]">AI Features</h3>
        </div>
        <span className="text-[11px] text-gray-500">Phase 4</span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Budget Optimization Summary */}
        {topOptimization && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="elegant-text text-[12px] font-medium">Top Budget Tip</span>
              <span className="text-[10px] text-gray-500">{(topOptimization.confidence * 100).toFixed(0)}% confidence</span>
            </div>
            <p className="elegant-text text-[11px] mb-2">{topOptimization.category}</p>
            <div className="flex justify-between text-[11px]">
              <span className="elegant-text">Current: ₹{topOptimization.currentBudget.toLocaleString()}</span>
              <span className="elegant-success font-medium">Save: ₹{topOptimization.potentialSavings.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Financial Goal Summary */}
        {topGoal && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <p className="elegant-text text-[11px] font-medium">{topGoal.name}</p>
                <p className={`text-[10px] ${getPriorityColor(topGoal.priority)}`}>
                  {topGoal.priority.charAt(0).toUpperCase() + topGoal.priority.slice(1)} Priority
                </p>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="elegant-text">Progress</span>
                <span className="elegant-text">₹{topGoal.currentAmount.toLocaleString()} / ₹{topGoal.targetAmount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min((topGoal.currentAmount / topGoal.targetAmount) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="elegant-success text-[12px] font-medium">₹{totalPotentialSavings.toLocaleString()}</p>
            <p className="elegant-text text-[10px]">Potential Savings</p>
          </div>
          <div className="text-center">
            <p className="elegant-primary text-[12px] font-medium">{highPriorityGoals}</p>
            <p className="elegant-text text-[10px]">High Priority Goals</p>
          </div>
        </div>
      </div>
    </div>
  )
} 