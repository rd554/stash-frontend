'use client'

import { Transaction } from '@/types'
import { useEffect } from 'react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}



export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // console.log('RecentTransactions component received:', transactions)
  
  // Get the last 10 transactions, sorted by date (most recent first)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    
  // console.log('Processed recent transactions:', recentTransactions)
  
  // Debug: Check if inline styles are working
  useEffect(() => {
    // Debug code commented out
    // const cards = document.querySelectorAll('[data-transaction-id]');
    // console.log('Found transaction cards:', cards.length);
    // cards.forEach((card, index) => {
    //   const computedStyle = window.getComputedStyle(card);
    //   console.log(`Card ${index} background:`, computedStyle.backgroundColor);
    // });
    
    // Check container spacing - debug code commented out
    // const container = document.querySelector('.space-y-6');
    // if (container) {
    //   const containerStyle = window.getComputedStyle(container);
    //   console.log('Container gap:', containerStyle.gap);
    // }
  }, [recentTransactions]);



  const getCategoryIcon = (category: string, merchant?: string) => {
    // console.log('Getting icon for category:', category, 'merchant:', merchant)
    
    // Check for metro in merchant name first (more specific)
    if (merchant && merchant.toLowerCase().includes('metro')) {
      // console.log('Found metro in merchant name, using train emoji')
      return {
        icon: '🚇',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600'
      }
    }
    
    // Simple, direct mapping with fallback
    const iconMap: { [key: string]: string } = {
      'food': '🍕',
      'dining': '🍕',
      'Food & Dining': '🍕',
      'food & dining': '🍕',
      'metro': '🚇',
      'Metro': '🚇',
      'metro card': '🚇',
      'Metro Card': '🚇',
      'transport': '🚗',
      'Transport': '🚗',
      'shopping': '🛍️',
      'Shopping': '🛍️',
      'entertainment': '🎬',
      'Entertainment': '🎬',
      'groceries': '🛒',
      'Groceries': '🛒',
      'utilities': '⚡',
      'Utilities': '⚡',
      'savings': '💰',
      'Savings': '💰',
      'travel': '✈️',
      'Travel': '✈️',
      'income': '⬇️',
      'Income': '⬇️',
      'emi': '🏠',
      'EMI': '🏠',
      'investment': '📈',
      'Investment': '📈',
      'rent': '🏠',
      'Rent': '🏠',
      'housing': '🏠',
      'Housing': '🏠',
      'healthcare': '❤️',
      'Healthcare': '❤️',
      'education': '🎓',
      'Education': '🎓',
      'subscriptions': '🔄',
      'Subscriptions': '🔄'
    }
    
    const icon = iconMap[category] || '●'
    // console.log('Icon for category', category, ':', icon)
    
    // Return consistent styling for all icons
    return {
      icon: icon,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today'
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }



  const formatAmount = (amount: number, category: string) => {
    const isIncome = category === 'Income' || amount > 50000 // Salary/large credits
    const sign = isIncome ? '+' : '-'
    const color = isIncome ? 'text-[#22c55e]' : 'text-[#ef4444]'
    
    return {
      text: `${sign}₹${Math.abs(amount).toLocaleString()}`,
      color
    }
  }

  const getPaymentModeDisplay = (paymentMode: string) => {
    // console.log('Getting payment mode for:', paymentMode)
    
    // Simple mapping for payment methods
    const modeMap: { [key: string]: string } = {
      'Credit Card': 'Credit Card',
      'Debit Card': 'Debit Card',
      'UPI': 'UPI',
      'NetBanking': 'Net Banking',
      'Net Banking': 'Net Banking',
      'Cash': 'Cash',
      'Bank Transfer': 'Bank Transfer',
      'Auto Debit': 'Auto Debit',
      'Card': 'Card',
      'card': 'Card'
    }
    
    const text = modeMap[paymentMode] || paymentMode || 'Unknown'
    // console.log('Payment mode text:', text)
    return { text: text, color: 'text-gray-500' }
  }

  return (
    <div 
      className="bg-white rounded-[12px] shadow-sm" 
      style={{ 
        padding: '32px 24px', 
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0,
        flexShrink: 0,
        border: '1px solid #000000'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#111827] text-[18px] font-semibold">Recent Transactions</h2>
        <a href="#" className="text-[#6b7280] text-[14px] font-medium flex items-center hover:text-[#374151] transition-colors">
          View All <span className="ml-2">→</span>
        </a>
      </div>
      
      <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {recentTransactions.map((transaction, index) => {
          // console.log('Rendering transaction:', transaction)
          const amountData = formatAmount(transaction.amount, transaction.category)
          const paymentModeData = getPaymentModeDisplay(transaction.paymentMode)
          
          // console.log('Amount data:', amountData)
          // console.log('Payment mode data:', paymentModeData)
          
          return (
            <div 
              key={`${transaction.merchant}-${index}`} 
              className="rounded-lg space-y-3"
              style={{ 
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px 20px'
              }}
              onClick={() => {
                // console.log('Card clicked - checking background color');
                // Debug code for checking styles - commented out
                // const element = document.querySelector(`[data-transaction-id="${transaction.id}"]`);
                // if (element) {
                //   const computedStyle = window.getComputedStyle(element);
                //   console.log('Computed background color:', computedStyle.backgroundColor);
                // }
              }}
              data-transaction-id={transaction.id}
            >
              {/* First Line: Emoji + Transaction Name + Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Emoji Icon */}
                  <span className="text-xl">
                    {getCategoryIcon(transaction.category, transaction.merchant).icon}
                  </span>
                  
                  {/* Transaction Name */}
                  <span className="font-semibold text-gray-900">
                    {transaction.merchant}
                  </span>
                </div>
                
                {/* Amount */}
                <span className={`${amountData.color} font-semibold`}>
                  {amountData.text}
                </span>
              </div>
              
              {/* Second Line: Date • Category • Payment Method */}
              <div className="ml-8">
                <p className="text-[12px] text-gray-500 font-normal font-['Raleway']">
                  {formatDate(transaction.date)} • {transaction.category} • {paymentModeData.text}
                </p>
              </div>
            </div>
          )
        })}
        
        {recentTransactions.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 text-[14px]">No recent transactions found</p>
          </div>
        )}
      </div>
    </div>
  )
} 