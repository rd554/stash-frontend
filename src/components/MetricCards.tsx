'use client'

import { User, Transaction } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface MetricCardsProps {
  user: User | null
  transactions?: Transaction[] // Add transactions prop
}

interface FinancialMetrics {
  salary: number
  emi: number
  savings: number
  netSpend: number
  totalSpent: number
}

export default function MetricCards({ user, transactions = [] }: MetricCardsProps) {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [currentSalary, setCurrentSalary] = useState(100000) // Track editable salary

  // Debug: Log when metrics change
  useEffect(() => {
    // console.log('Metrics state changed:', metrics)
  }, [metrics])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const getFallbackMetrics = useCallback((): FinancialMetrics => {
    if (!user) return { salary: 100000, emi: 15000, savings: 20000, netSpend: 65000, totalSpent: 0 }
    
    const personalityData = {
      'Heavy Spender': { salary: 100000, emi: 35000, savings: 2000, netSpend: 63000, totalSpent: 0 },
      'Medium Spender': { salary: 100000, emi: 15000, savings: 20000, netSpend: 65000, totalSpent: 0 },
      'Max Saver': { salary: 100000, emi: 5000, savings: 40000, netSpend: 55000, totalSpent: 0 }
    }
    
    return personalityData[user.spendingPersonality] || personalityData['Medium Spender']
  }, [user])

  const loadFinancialMetrics = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await apiClient.getFinancialMetrics(user.username)
      if (response.success && response.data) {
        // Check if the API data is valid (has non-zero values)
        const apiData = response.data as FinancialMetrics
        const hasValidData = apiData && 
          typeof apiData.salary === 'number' && apiData.salary > 0 &&
          typeof apiData.emi === 'number' && apiData.emi > 0 &&
          typeof apiData.savings === 'number' && apiData.savings >= 0 &&
          typeof apiData.netSpend === 'number' && apiData.netSpend >= 0
        
        if (hasValidData) {
          setMetrics(apiData)
          setCurrentSalary(apiData.salary) // Update current salary from API
        }
      }
    } catch (error) {
      console.error('Failed to load financial metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const calculateMetricsFromTransactions = useCallback((transactionList: Transaction[], salaryOverride?: number): FinancialMetrics => {
    const salaryToUse = salaryOverride || currentSalary
    
    // Get current date to filter transactions up to today
    const currentDate = new Date()
    const currentDateString = currentDate.toISOString().split('T')[0]
    
    // Filter transactions up to current date
    const validTransactions = transactionList.filter(tx => {
      const txDate = tx.date
      return txDate <= currentDateString
    })
    
    // Calculate totals by category
    const categoryTotals: { [key: string]: number } = {}
    let totalSpent = 0
    
    validTransactions.forEach(tx => {
      const category = tx.category?.toLowerCase() || ''
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount
      
      if (category === 'savings') {
        // Savings is positive (money saved)
        categoryTotals['savings'] = (categoryTotals['savings'] || 0) + amount
      } else {
        // All other categories are expenses (negative)
        categoryTotals[category] = (categoryTotals[category] || 0) + amount
        totalSpent += amount
      }
    })
    
    // Get EMI based on persona
    const getEMI = () => {
      const persona = user?.spendingPersonality || 'Medium Spender'
      switch (persona) {
        case 'Heavy Spender': return 45000
        case 'Medium Spender': return 20000
        case 'Max Saver': return 12000
        default: return 20000
      }
    }
    
    const emi = getEMI()
    const salary = salaryToUse // Use the provided salary or current salary
    const savings = categoryTotals['savings'] || 0
    const netSpend = salary - emi - savings
    
    const calculatedMetrics: FinancialMetrics = {
      salary,
      emi,
      savings,
      netSpend,
      totalSpent
    }
    
    // console.log('Calculated metrics:', calculatedMetrics)
    return calculatedMetrics
  }, [user, currentSalary])

  const loadSalaryAndMetrics = useCallback(async () => {
    if (!user) return
    
    console.log('MetricCards: loadSalaryAndMetrics started for user:', user.username, 'transactions:', transactions.length)
    setLoading(true)
    
    try {
      // First, get the user's current salary from the database
      let salary = 100000 // Default fallback
      const salaryResponse = await apiClient.getSalary(user.username)
      
      if (salaryResponse.success && salaryResponse.data) {
        // The API client wraps the response, so we need to access response.data.data
        const apiData = (salaryResponse.data as { data?: { salary: number } })?.data || salaryResponse.data
        if (apiData && typeof apiData === 'object' && 'salary' in apiData) {
          salary = (apiData as { salary: number }).salary
        }
      }
      
      console.log('MetricCards: Loaded salary:', salary)
      setCurrentSalary(salary)
      
      if (transactions.length > 0) {
        // Calculate metrics from actual transactions with database salary
        const calculatedMetrics = calculateMetricsFromTransactions(transactions, salary)
        console.log('MetricCards: Calculated metrics from transactions:', calculatedMetrics)
        setMetrics(calculatedMetrics)
      } else {
        // Fallback to API or static data
        const fallbackMetrics = getFallbackMetrics()
        fallbackMetrics.salary = salary // Use database salary
        fallbackMetrics.netSpend = salary - fallbackMetrics.emi - fallbackMetrics.savings
        console.log('MetricCards: Using fallback metrics:', fallbackMetrics)
        setMetrics(fallbackMetrics)
        loadFinancialMetrics()
      }
    } catch (error) {
      console.error('Error loading salary and metrics:', error)
      // Fallback to default
      const fallbackMetrics = getFallbackMetrics()
      setMetrics(fallbackMetrics)
      setCurrentSalary(fallbackMetrics.salary)
    } finally {
      console.log('MetricCards: Setting loading to false')
      setLoading(false)
    }
  }, [user, transactions, getFallbackMetrics, calculateMetricsFromTransactions, loadFinancialMetrics])

  useEffect(() => {
    if (user) {
      console.log('MetricCards: Loading salary and metrics for user:', user.username)
      loadSalaryAndMetrics()
    } else {
      // Initialize with fallback metrics if no user
      console.log('MetricCards: No user, using fallback metrics')
      const fallbackMetrics = getFallbackMetrics()
      setMetrics(fallbackMetrics)
      setCurrentSalary(fallbackMetrics.salary) // Update current salary
      setLoading(false) // Ensure loading is set to false
    }
  }, [user, transactions, loadSalaryAndMetrics, getFallbackMetrics])

  const handleEdit = (field: string, currentValue: number) => {
    setEditing(field)
    setEditValue(currentValue.toString())
  }

  const handleSave = async (field: string) => {
    if (!metrics || !user) return

    try {
      const newValue = parseInt(editValue)
      if (field === 'salary' && newValue < 100000) {
        toast.error('Salary must be at least ₹1,00,000')
        return
      }

                  if (field === 'salary') {
              const response = await apiClient.updateSalary(user.username, newValue)
              
              if (response.success) {
                toast.success('Salary updated successfully')
                setCurrentSalary(newValue) // Update local salary state
                // Recalculate metrics with new salary
                if (transactions.length > 0) {
                  const newMetrics = calculateMetricsFromTransactions(transactions, newValue)
                  setMetrics(newMetrics)
                } else {
                  setMetrics(prev => prev ? {
                    ...prev,
                    salary: newValue,
                    netSpend: newValue - prev.emi - prev.savings
                  } : null)
                }
              } else {
                console.error('Failed to update salary:', response.error)
                toast.error('Failed to update salary')
              }
            }
      
      setEditing(null)
      setEditValue('')
    } catch (error) {
      console.error('Failed to update:', error)
      toast.error('Failed to update')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field)
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (loading) {
    return (
      <div 
        className="flex justify-between bg-[#ffffff]" 
        style={{ 
          gap: '1.5rem', 
          padding: '24px 32px 0 32px'
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="w-[260px] h-[120px] bg-gray-100 rounded-[12px] animate-pulse"
            style={{ padding: '20px 20px 10px 20px' }}
          >
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div 
        className="flex justify-between bg-[#ffffff]" 
        style={{ 
          gap: '1.5rem', 
          padding: '24px 32px 0 32px'
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="w-[260px] h-[120px] bg-gray-100 rounded-[12px] animate-pulse"
            style={{ padding: '20px 20px 10px 20px' }}
          >
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className="flex justify-between bg-[#ffffff]" 
      style={{ 
        gap: '1.5rem', 
        padding: '20px 32px 0 32px'
      }}
    >
      {/* Fixed Salary Card */}
      <div 
        className="flex flex-col items-start justify-between w-[260px] h-[120px] bg-[#eaf2ff] rounded-[12px] shadow-md" 
        style={{ padding: '20px 20px 10px 20px', border: '1px solid #000000' }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#4a90e2] rounded-full">
            <span className="text-white text-[14px] font-bold">₹</span>
          </div>
                      <div className="flex items-center gap-2">
              <div className="text-[#4a90e2] text-[14px]">📈</div>
              <button
                onClick={() => handleEdit('salary', metrics?.salary || 0)}
                className="text-[#4a90e2] hover:text-[#357abd] transition-colors"
              >
                <Edit2 size={14} />
              </button>
            </div>
        </div>
        <div>
          <p className="text-[#4a90e2] text-[12px] font-semibold">Fixed Salary</p>
          {editing === 'salary' ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'salary')}
                onBlur={() => handleSave('salary')}
                className="text-[#000000] text-[18px] font-bold bg-transparent border-b border-[#4a90e2] focus:outline-none w-28"
                autoFocus
              />
              <button
                onClick={() => handleSave('salary')}
                className="text-[#4a90e2] text-sm hover:underline"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-[#000000] text-[18px] font-bold">₹{(metrics?.salary || 0).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* EMI Card */}
      <div 
        className="flex flex-col items-start justify-between w-[260px] h-[120px] bg-[#fff7e6] rounded-[12px] shadow-md" 
        style={{ padding: '20px 20px 10px 20px', border: '1px solid #000000' }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#f5a623] rounded-full">
            <span className="text-white text-[14px]">💳</span>
          </div>
          <div className="text-[#f5a623] text-[14px]">🔒</div>
        </div>
        <div>
          <p className="text-[#f5a623] text-[12px] font-semibold">EMI</p>
          <p className="text-[#000000] text-[18px] font-bold">₹{(metrics?.emi || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Savings Card */}
      <div 
        className="flex flex-col items-start justify-between w-[260px] h-[120px] bg-[#e6f9e6] rounded-[12px] shadow-md" 
        style={{ padding: '20px 20px 10px 20px', border: '1px solid #000000' }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#4caf50] rounded-full">
            <span className="text-white text-[14px]">💰</span>
          </div>
          <div className="text-[#4caf50] text-[14px]">✅</div>
        </div>
        <div>
          <p className="text-[#4caf50] text-[12px] font-semibold">Savings</p>
          <p className="text-[#000000] text-[18px] font-bold">₹{(metrics?.savings || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Net Spend Card */}
      <div 
        className="flex flex-col items-start justify-between w-[260px] h-[120px] bg-[#ffe6e6] rounded-[12px] shadow-md" 
        style={{ padding: '20px 20px 10px 20px', border: '1px solid #000000' }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#e74c3c] rounded-full">
            <span className="text-white text-[14px]">💰</span>
          </div>
          <div className="text-[#e74c3c] text-[14px]">→</div>
        </div>
        <div>
          <p className="text-[#e74c3c] text-[12px] font-semibold">Net Spend</p>
          <p className="text-[#000000] text-[18px] font-bold">₹{(metrics?.netSpend || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
} 