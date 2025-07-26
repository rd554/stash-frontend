'use client'

import { User, Transaction } from '@/types'

interface SavingsVsSpendingProps {
  user: User | null
  transactions: Transaction[]
}

interface PersonalityData {
  salary: number
  emi: number
  savings: number
  emergencyFund: number
}

export default function SavingsVsSpending({ user, transactions }: SavingsVsSpendingProps) {
  const getPersonalityData = (): PersonalityData => {
    if (!user) return { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 }
    
    const personalityData = {
      'Heavy Spender': { salary: 100000, emi: 35000, savings: 2000, emergencyFund: 75000 },
      'Medium Spender': { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 },
      'Max Saver': { salary: 100000, emi: 5000, savings: 40000, emergencyFund: 75000 }
    }
    
    return personalityData[user.spendingPersonality] || personalityData['Medium Spender']
  }

  const getMonthlyData = () => {
    const data = getPersonalityData()
    const months = ['Jan', 'Feb', 'Mar', 'Apr']
    
    // Calculate total spending from transactions
    const totalSpent = transactions.reduce((sum, txn) => sum + txn.amount, 0)
    
    // For demo purposes, we'll show consistent data across months
    // In a real app, this would be historical monthly data
    const actualSavings = data.savings
    const actualSpending = data.salary - data.emi - actualSavings
    
    return months.map(month => {
      // Add some variation to make it more realistic
      const variation = Math.random() * 0.2 - 0.1 // ±10% variation
      const savingsAmount = Math.max(actualSavings * (1 + variation), 0)
      const spendingAmount = Math.max(actualSpending * (1 + variation), 0)
      
      // Calculate heights for visual representation (max 100px total height)
      const total = savingsAmount + spendingAmount
      const maxHeight = 100
      
      const savingsHeight = Math.round((savingsAmount / total) * maxHeight)
      const spendingHeight = Math.round((spendingAmount / total) * maxHeight)
      
      return {
        month,
        savings: savingsAmount,
        spending: spendingAmount,
        savingsHeight: Math.max(savingsHeight, 10), // Minimum 10px for visibility
        spendingHeight: Math.max(spendingHeight, 10)
      }
    })
  }

  const monthlyData = getMonthlyData()

  return (
    <div className="bg-white border-[1px] border-[#d1d5db] rounded-[8px] p-4 w-[300px]">
      <h2 className="text-[#000000] font-bold text-[16px] mb-4">Savings vs Spending</h2>
      
      <div className="flex justify-between items-end mb-4 h-[120px]">
        {monthlyData.map((data, index) => (
          <div key={data.month} className="flex flex-col items-center">
            <div className="flex flex-col justify-end h-[100px]">
              {/* Savings bar (green, on top) */}
              <div 
                className="w-[20px] bg-[#22c55e]"
                style={{ height: `${data.savingsHeight}px` }}
                title={`Savings: ₹${Math.round(data.savings).toLocaleString()}`}
              ></div>
              {/* Spending bar (red, on bottom) */}
              <div 
                className="w-[20px] bg-[#ef4444]"
                style={{ height: `${data.spendingHeight}px` }}
                title={`Spending: ₹${Math.round(data.spending).toLocaleString()}`}
              ></div>
            </div>
            <span className="text-[#000000] text-[14px] mt-2">{data.month}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        <div className="flex items-center">
          <div className="h-[10px] w-[10px] bg-[#22c55e] rounded-full mr-2"></div>
          <span className="text-[#000000] text-[14px]">Savings</span>
        </div>
        <div className="flex items-center">
          <div className="h-[10px] w-[10px] bg-[#ef4444] rounded-full mr-2"></div>
          <span className="text-[#000000] text-[14px]">Spending</span>
        </div>
      </div>
    </div>
  )
} 