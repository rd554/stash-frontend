'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Transaction } from '@/types'
import { apiClient } from '@/lib/api'
import { BudgetCapStorage } from '@/lib/budgetStorage'
import { Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BudgetOverviewProps {
  user: User
  transactions?: Transaction[] // Add transactions prop
}

interface BudgetCategory {
  category: string
  amount: number
  budgetCap: number
  percentage: number
  isOverBudget: boolean
}

// Color coding based on spending status (percentage of budget used)
const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function BudgetOverview({ user, transactions = [] }: BudgetOverviewProps) {
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const getFallbackBudgetData = useCallback((): BudgetCategory[] => {
    if (!user) return []
    
    const personalityData = {
      'Heavy Spender': [
        { category: 'Food & Dining', amount: 25000, budgetCap: 30000, percentage: 83.33, isOverBudget: false },
        { category: 'Transport', amount: 12000, budgetCap: 15000, percentage: 80, isOverBudget: false },
        { category: 'Shopping', amount: 35000, budgetCap: 30000, percentage: 116.67, isOverBudget: true },
        { category: 'Entertainment', amount: 8000, budgetCap: 5000, percentage: 160, isOverBudget: true }
      ],
      'Medium Spender': [
        { category: 'Food & Dining', amount: 18000, budgetCap: 20000, percentage: 90, isOverBudget: false },
        { category: 'Transport', amount: 8000, budgetCap: 10000, percentage: 80, isOverBudget: false },
        { category: 'Shopping', amount: 15000, budgetCap: 20000, percentage: 75, isOverBudget: false },
        { category: 'Entertainment', amount: 4000, budgetCap: 5000, percentage: 80, isOverBudget: false }
      ],
      'Max Saver': [
        { category: 'Food & Dining', amount: 12000, budgetCap: 15000, percentage: 80, isOverBudget: false },
        { category: 'Transport', amount: 5000, budgetCap: 8000, percentage: 62.5, isOverBudget: false },
        { category: 'Shopping', amount: 8000, budgetCap: 12000, percentage: 66.67, isOverBudget: false },
        { category: 'Entertainment', amount: 2000, budgetCap: 3000, percentage: 66.67, isOverBudget: false }
      ]
    }
    
    return personalityData[user.spendingPersonality] || personalityData['Medium Spender']
  }, [user])

  const calculateBudgetDataFromTransactions = useCallback((transactionList: Transaction[] = transactions): BudgetCategory[] => {
    // Get default budget caps based on persona
    const getDefaultBudgetCaps = () => {
      const persona = user?.spendingPersonality || 'Medium Spender'
      switch (persona) {
        case 'Heavy Spender':
          return {
            'Food & Dining': 30000,
            'Transport': 15000,
            'Shopping': 30000,
            'Entertainment': 5000,
            'Healthcare': 25000,
            'Utilities': 20000,
            'Education': 100000,
            'Subscriptions': 5000,
            'Rent': 200000,
            'Other': 50000
          }
        case 'Medium Spender':
          return {
            'Food & Dining': 20000,
            'Transport': 10000,
            'Shopping': 20000,
            'Entertainment': 5000,
            'Healthcare': 20000,
            'Utilities': 15000,
            'Education': 80000,
            'Subscriptions': 3000,
            'Rent': 150000,
            'Other': 30000
          }
        case 'Max Saver':
          return {
            'Food & Dining': 15000,
            'Transport': 8000,
            'Shopping': 12000,
            'Entertainment': 3000,
            'Healthcare': 15000,
            'Utilities': 12000,
            'Education': 60000,
            'Subscriptions': 2000,
            'Rent': 120000,
            'Other': 20000
          }
        default:
          return {
            'Food & Dining': 20000,
            'Transport': 10000,
            'Shopping': 20000,
            'Entertainment': 5000,
            'Healthcare': 20000,
            'Utilities': 15000,
            'Education': 80000,
            'Subscriptions': 3000,
            'Rent': 150000,
            'Other': 30000
          }
      }
    }

    const defaultCaps = getDefaultBudgetCaps()
    const categoryTotals: { [key: string]: number } = {}
    
    // Calculate totals by category
    transactionList.forEach(tx => {
      const category = tx.category
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })
    
    // Create budget categories
    const budgetCategories: BudgetCategory[] = Object.keys(defaultCaps).map(category => {
      const amount = categoryTotals[category] || 0
      const budgetCap = defaultCaps[category as keyof typeof defaultCaps]
      const percentage = budgetCap > 0 ? (amount / budgetCap) * 100 : 0
      const isOverBudget = amount > budgetCap
      
      return {
        category,
        amount,
        budgetCap,
        percentage: Math.round(percentage * 100) / 100,
        isOverBudget
      }
    })
    
    return budgetCategories
  }, [user, transactions])

  const getFullMonthBudgetData = useCallback(async (): Promise<BudgetCategory[] | null> => {
    console.log('🚀 getFullMonthBudgetData() called for user:', user.username)
    try {
      // Get all transactions (persona + manual) from new API
      const response = await apiClient.getBudgetTransactions(user.username)
      console.log('Budget transactions API response:', response)
      
      if (!response.success || !response.data) {
        console.log('Failed to get budget transactions, using fallback')
        return null
      }
      
      // The API client wraps the response, so we need to access response.data.data
      const apiData = ((response.data as Record<string, unknown>).data || response.data) as {
        transactions: Transaction[];
        manualCount: number;
        personaCount: number;
      }
      const allTransactions = apiData.transactions || []
      console.log('Total transactions for budget calculation:', allTransactions.length)
      console.log('Manual transactions count:', apiData.manualCount)
      console.log('Persona transactions count:', apiData.personaCount)
      console.log('Sample transactions:', allTransactions.slice(0, 2))
      
      // Calculate budget data from all transactions
      return calculateBudgetDataFromTransactions(allTransactions)
      
    } catch (error) {
      console.error('Error getting full month budget data:', error)
      return null
    }
  }, [user.username, calculateBudgetDataFromTransactions])

  const loadBudgetData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading budget data for user:', user.username)
      
      let budgetData: BudgetCategory[] = []
      
      // Get full month's transactions (July 1-23) plus manual transactions
      console.log('🔄 Attempting to get full month budget data...')
      const fullMonthData = await getFullMonthBudgetData()
      if (fullMonthData) {
        console.log('✅ Using full month budget data:', fullMonthData)
        budgetData = fullMonthData
      } else {
        console.log('❌ Full month budget data failed, using fallback')
        // Fallback to API or hardcoded data
        const response = await apiClient.getBudgetOverview(user.username)
        console.log('Budget overview API response:', response)
        
        if (response.success && response.data && Array.isArray(response.data)) {
          console.log('✅ Setting budget data from API:', response.data)
          budgetData = response.data as BudgetCategory[]
        } else {
          console.log('❌ API failed, using fallback budget data. Response:', response)
          // Fallback to persona-based budget data
          budgetData = getFallbackBudgetData()
        }
      }
      
      // Apply localStorage budget caps
      const userBudgetCaps = BudgetCapStorage.getAllBudgetCaps(user.username)
      const updatedBudgetData = budgetData.map(item => {
        const customCap = userBudgetCaps[item.category]
        if (customCap !== undefined) {
          const newPercentage = (item.amount / customCap) * 100
          const newIsOverBudget = item.amount > customCap
          return {
            ...item,
            budgetCap: customCap,
            percentage: Math.round(newPercentage * 100) / 100,
            isOverBudget: newIsOverBudget
          }
        }
        return item
      })
      
      setBudgetData(updatedBudgetData)
    } catch (error) {
      console.error('Error loading budget data:', error)
      // Fallback to persona-based budget data
      setBudgetData(getFallbackBudgetData())
    } finally {
      setLoading(false)
    }
  }, [user.username, getFallbackBudgetData, getFullMonthBudgetData])

  useEffect(() => {
    if (user) {
      // Clear expired budget caps on component mount
      BudgetCapStorage.clearExpiredBudgetCaps()
      loadBudgetData()
    }
  }, [user, loadBudgetData]) // Also reload when transactions change

  const handleEdit = (category: string, currentCap: number) => {
    setEditing(category)
    setEditValue(currentCap.toString())
  }

  const handleSave = async (category: string) => {
    try {
      const newCap = parseInt(editValue)
      if (isNaN(newCap) || newCap < 0) {
        toast.error('Please enter a valid amount')
        return
      }

      // Store in localStorage with 48-hour expiration
      BudgetCapStorage.setBudgetCap(user.username, category, newCap)
      
      // Update the local state immediately
      setBudgetData(prevData => 
        prevData.map(item => 
          item.category === category 
            ? {
                ...item,
                budgetCap: newCap,
                percentage: Math.round((item.amount / newCap) * 100 * 100) / 100,
                isOverBudget: item.amount > newCap
              }
            : item
        )
      )
      
      toast.success('Budget cap updated successfully')
    } catch (error) {
      console.error('Error updating budget cap:', error)
      toast.error('Failed to update budget cap')
    } finally {
      setEditing(null)
      setEditValue('')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const getCategoryColor = (percentage: number) => {
    return getProgressBarColor(percentage)
  }

  if (loading) {
    return (
      <div className="bg-white border-[1px] border-[#E5E5E5] rounded-[8px] min-h-[200px] p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white border-[1px] border-[#E5E5E5] rounded-[8px]" 
      style={{ 
        minHeight: '200px', 
        padding: '32px 24px',
        border: '1px solid #000000'
      }}
    >
      <h1 className="text-[#111827] text-[18px] font-semibold mb-2">Budget Overview</h1>
      <p className="text-[#6b7280] text-[14px] mb-6">Monthly spending by category</p>
      
      <div className="mt-4 space-y-4">
        {budgetData && budgetData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center text-[14px] text-[#111827]">
              <span className="flex items-center gap-2 font-medium">
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <span>₹{item.amount.toLocaleString()} / ₹{item.budgetCap.toLocaleString()}</span>
                <button
                  onClick={() => handleEdit(item.category, item.budgetCap)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-105"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
            
            {editing === item.category ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Enter new budget cap"
                  min="0"
                />
                <button
                  onClick={() => handleSave(item.category)}
                  className="text-green-600 hover:text-green-700 transition-colors duration-200"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-full bg-[#e5e7eb] h-[12px] rounded-full mt-1">
                <div 
                  className="h-[12px] rounded-full transition-all duration-300 ease-out" 
                  style={{ 
                    backgroundColor: getCategoryColor(item.percentage),
                    width: `${Math.min(item.percentage, 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 