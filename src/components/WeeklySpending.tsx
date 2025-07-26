'use client'

import { User } from '@/types'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface WeeklySpendingProps {
  user: User
}

interface WeeklyData {
  day: string
  amount: number
  date: string
  percentage: number
}

export default function WeeklySpending({ user }: WeeklySpendingProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWeeklyData()
    }
  }, [user])

  const loadWeeklyData = async () => {
    try {
      setLoading(true)
      console.log('Loading weekly data for user:', user.username)
      
      const response = await apiClient.getUserWeeklyTransactions(user.username)
      console.log('Weekly spending API response:', response)
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('Setting weekly data:', response.data)
        setWeeklyData(response.data as WeeklyData[])
      } else {
        console.log('API failed, using fallback weekly data')
        // Fallback to empty weekly data
        setWeeklyData(getFallbackWeeklyData())
      }
    } catch (error) {
      console.error('Error loading weekly spending data:', error)
      // Fallback to empty weekly data
      setWeeklyData(getFallbackWeeklyData())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackWeeklyData = (): WeeklyData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    
    return days.map((day, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      
      return {
        day,
        amount: 0,
        date: date.toDateString(),
        percentage: 0
      }
    })
  }

  if (loading) {
    return (
      <div 
        className="bg-white border-[1px] border-[#E5E5E5] rounded-[8px]" 
        style={{ 
          minHeight: '200px', 
          padding: '32px 24px',
          border: '1px solid #000000'
        }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex items-end justify-between h-[80px] mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center w-[30px]">
                <div className="h-12 bg-gray-200 rounded w-[20px]"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="w-[30px] h-4 bg-gray-200 rounded"></div>
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
      <h2 className="text-[#000000] font-bold text-[16px] mb-6">Weekly Spending</h2>
      
      {/* Bar Chart Area */}
      <div className="flex items-end justify-between h-[80px] mb-4">
        {weeklyData && weeklyData.map((data, index) => (
          <div key={data.day} className="flex flex-col items-center w-[30px]">
            <div className="relative flex flex-col justify-end h-[60px] w-[20px]">
              <div 
                className="bg-[#3B82F6] rounded-t-sm transition-all duration-300 hover:bg-[#2563EB]"
                style={{ 
                  height: `${Math.max(data.percentage, 3)}%`,
                  minHeight: data.amount > 0 ? '3px' : '0px'
                }}
                title={`₹${data.amount.toLocaleString()}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Day Labels */}
      <div className="flex justify-between text-[#000000] text-[14px]">
        {weeklyData && weeklyData.map((data) => (
          <span key={data.day} className="w-[30px] text-center">
            {data.day}
          </span>
        ))}
      </div>
    </div>
  )
} 