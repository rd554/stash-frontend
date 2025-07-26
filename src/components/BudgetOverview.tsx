'use client'

import { User, Transaction } from '@/types'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { BudgetCapStorage } from '@/lib/budgetStorage'

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
  if (percentage <= 80) {
    return '#10b981' // Green - safe zone
  } else if (percentage <= 100) {
    return '#f59e0b' // Yellow - warning zone
  } else {
    return '#ef4444' // Red - over budget
  }
}

export default function BudgetOverview({ user, transactions = [] }: BudgetOverviewProps) {
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    if (user) {
      // Clear expired budget caps on component mount
      BudgetCapStorage.clearExpiredBudgetCaps()
      loadBudgetData()
    }
  }, [user, transactions]) // Also reload when transactions change

  const loadBudgetData = async () => {
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
  }

  const getFullMonthBudgetData = async (): Promise<BudgetCategory[] | null> => {
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
      const apiData = response.data.data || response.data
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
  }

  const calculateBudgetDataFromTransactions = (transactionList: Transaction[] = transactions): BudgetCategory[] => {
    // Get default budget caps based on persona
    const getDefaultBudgetCaps = () => {
      const persona = user.spendingPersonality
      
      if (persona === 'Heavy Spender') {
        return {
          'Entertainment': 12000,
          'Dining': 10000,
          'Groceries': 12000,
          'Shopping': 15000,
          'Transport': 4000
        }
      } else if (persona === 'Medium Spender') {
        return {
          'Dining': 6000,
          'Groceries': 7000,
          'savings': 25000,
          'Shopping': 20000,
          'Transport': 6000
        }
      } else { // Max Saver
        return {
          'Transport': 5000,
          'Groceries': 6000,
          'travel': 4000,
          'utilities': 7000,
          'savings': 6000
        }
      }
    }

    const defaultCaps = getDefaultBudgetCaps()
    
    // Calculate totals from actual transactions
    const categoryTotals: { [key: string]: number } = {}
    
    transactionList.forEach(transaction => {
      const category = transaction.category
      
      if (category) {
        // Normalize category names to match budget caps
        let normalizedCategory = category
        if (category === 'Food & Dining' || category === 'food & dining') normalizedCategory = 'Dining'
        if (category === 'food') normalizedCategory = 'Dining'
        if (category === 'entertainment') normalizedCategory = 'Entertainment'
        if (category === 'transport') normalizedCategory = 'Transport'
        if (category === 'shopping') normalizedCategory = 'Shopping'
        if (category === 'groceries') normalizedCategory = 'Groceries'
        if (category === 'savings') normalizedCategory = 'savings'
        if (category === 'travel') normalizedCategory = 'travel'
        if (category === 'utilities') normalizedCategory = 'utilities'
        
        const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
        const previousTotal = categoryTotals[normalizedCategory] || 0
        categoryTotals[normalizedCategory] = previousTotal + amount
      }
    })

    // Create budget data from calculated totals
    const budgetData: BudgetCategory[] = []
    
    Object.keys(defaultCaps).forEach(category => {
      const amount = categoryTotals[category] || 0
      const budgetCap = defaultCaps[category]
      const percentage = budgetCap > 0 ? (amount / budgetCap) * 100 : 0
      const isOverBudget = amount > budgetCap
      
      budgetData.push({
        category,
        amount,
        budgetCap,
        percentage: Math.round(percentage * 100) / 100,
        isOverBudget
      })
    })

    return budgetData
  }

  const getFallbackBudgetData = (): BudgetCategory[] => {
    const persona = user.spendingPersonality
    
    if (persona === 'Heavy Spender') {
      return [
        { category: 'Entertainment', amount: 37988, budgetCap: 12000, percentage: 316.57, isOverBudget: true },
        { category: 'Dining', amount: 11286, budgetCap: 10000, percentage: 112.86, isOverBudget: true },
        { category: 'Groceries', amount: 18858, budgetCap: 12000, percentage: 157.15, isOverBudget: true },
        { category: 'Shopping', amount: 28483, budgetCap: 15000, percentage: 189.89, isOverBudget: true },
        { category: 'Transport', amount: 2602, budgetCap: 4000, percentage: 65.05, isOverBudget: false }
      ]
    } else if (persona === 'Medium Spender') {
      return [
        { category: 'Dining', amount: 9873, budgetCap: 6000, percentage: 164.6, isOverBudget: true },
        { category: 'Groceries', amount: 10251, budgetCap: 7000, percentage: 146.4, isOverBudget: true },
        { category: 'savings', amount: 20502, budgetCap: 25000, percentage: 82, isOverBudget: false },
        { category: 'Shopping', amount: 22321, budgetCap: 20000, percentage: 111.6, isOverBudget: true },
        { category: 'Transport', amount: 12899, budgetCap: 6000, percentage: 215, isOverBudget: true }
      ]
    } else { // Max Saver
      return [
        { category: 'Transport', amount: 14966, budgetCap: 5000, percentage: 299.3, isOverBudget: true },
        { category: 'Groceries', amount: 9183, budgetCap: 6000, percentage: 153.1, isOverBudget: true },
        { category: 'travel', amount: 7145, budgetCap: 4000, percentage: 178.6, isOverBudget: true },
        { category: 'utilities', amount: 6060, budgetCap: 7000, percentage: 86.6, isOverBudget: false },
        { category: 'savings', amount: 5092, budgetCap: 6000, percentage: 84.9, isOverBudget: false }
      ]
    }
  }

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