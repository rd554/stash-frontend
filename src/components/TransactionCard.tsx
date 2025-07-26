'use client'

import { Transaction } from '@/types'
import { Clock, Tag } from 'lucide-react'

interface TransactionCardProps {
  transaction: Transaction
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food delivery':
      case 'food':
        return '🍕'
      case 'transport':
        return '🚗'
      case 'shopping':
        return '🛍️'
      case 'entertainment':
        return '🎬'
      case 'utilities':
        return '⚡'
      case 'savings':
        return '💰'
      default:
        return '💳'
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {transaction.merchant}
          </h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Tag className="w-3 h-3" />
            <span>{transaction.category}</span>
            <span>•</span>
            <span className="uppercase text-xs">{transaction.paymentMode}</span>
            {transaction.isSimulated && (
              <>
                <span>•</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                  Simulated
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">
          ₹{transaction.amount}
        </p>
        <div className="flex items-center justify-end space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatDate(transaction.date)}</span>
        </div>
      </div>
    </div>
  )
} 