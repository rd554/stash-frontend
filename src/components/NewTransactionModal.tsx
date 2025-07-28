'use client'

import { useState, useEffect, useCallback } from 'react'
// Remove unused X import
// import { X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onTransactionAdded: () => void
  userId: string
}

export default function NewTransactionModal({ isOpen, onClose, onTransactionAdded, userId }: NewTransactionModalProps) {
  // console.log('NewTransactionModal rendered with isOpen:', isOpen)
  
  // Helper function to get current date/time in the correct format
  const getCurrentDateTimeString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  interface FormData {
    amount: string;
    transactionName: string;
    dateTime: string;
    category: string;
    paymentMethod: string;
  }

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    transactionName: '',
    dateTime: getCurrentDateTimeString(), // Format for datetime-local
    category: '',
    paymentMethod: ''
  })

  // Reset form data with current date/time when modal opens
  const resetFormData = useCallback(() => {
    setFormData({
      amount: '',
      transactionName: '',
      dateTime: getCurrentDateTimeString(), // Always set to current date/time
      category: '',
      paymentMethod: ''
    })
  }, [])
  const [isLoading, setIsLoading] = useState(false)

  // Reset form data with current date/time when modal opens
  useEffect(() => {
    if (isOpen) {
      resetFormData()
    }
  }, [isOpen, resetFormData])

  const categories = [
    'Transport',
    'Food & Dining', 
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Education',
    'Subscriptions',
    'Rent',
    'Other'
  ]

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: 'fas fa-mobile-alt' },
    { id: 'Card', label: 'Card', icon: 'fas fa-credit-card' },
    { id: 'NetBanking', label: 'NetBanking', icon: 'fas fa-university' },
    { id: 'Cash', label: 'Cash', icon: 'fas fa-money-bill-wave' }
  ]

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Don't allow changes to dateTime field since it's read-only
    if (field === 'dateTime') return
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePaymentMethodSelect = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // console.log('Form submitted with data:', formData)
    
    if (!formData.amount || !formData.transactionName || !formData.category || !formData.paymentMethod) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate amount
    const amount = Number(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Check for unrealistic amounts with soft warning
    const categoryLimits: { [key: string]: number } = {
      'Food & Dining': 3000,
      'Transport': 1500,
      'Shopping': 30000,
      'Entertainment': 5000,
      'Healthcare': 25000,
      'Utilities': 20000,
      'Education': 100000,
      'Subscriptions': 5000,
      'Rent': 200000,
      'Other': 50000
    }

    const warningLimit = categoryLimits[formData.category] || 10000
    if (amount > warningLimit) {
      const confirm = window.confirm(`₹${amount} seems high for ${formData.category}. Are you sure you want to continue?`)
      if (!confirm) {
        return
      }
    }

    setIsLoading(true)

    try {
      // Save to database via API
      const response = await apiClient.addTransaction(userId, {
        date: formData.dateTime,
        merchant: formData.transactionName,
        amount: amount,
        category: formData.category,
        paymentMode: formData.paymentMethod
      })

      if (response.success) {
        toast.success('Transaction added successfully!')
      } else {
        toast.error(response.error || 'Failed to add transaction')
        return
      }
      
      // Reset form
      setFormData({
        amount: '',
        transactionName: '',
        dateTime: new Date().toISOString().slice(0, 16),
        category: '',
        paymentMethod: ''
      })
      
      // Notify parent to refresh data
      onTransactionAdded()
      onClose()
      
    } catch (error) {
      console.error('Error adding manual transaction:', error)
      toast.error('Failed to add transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      amount: '',
      transactionName: '',
      dateTime: new Date().toISOString().slice(0, 16),
      category: '',
      paymentMethod: ''
    })
    onClose()
  }

  if (!isOpen) {
    // console.log('Modal not open, returning null')
    return null
  }

  // console.log('Modal is open, rendering modal content')

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-[12px] shadow-lg max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'white',
          width: '500px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          padding: '32px 24px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid #000000',
          fontFamily: 'Raleway, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 className="text-[#000000] text-[20px] font-bold" style={{ fontFamily: 'Raleway, sans-serif' }}>Add New Transaction</h2>
          <button 
            onClick={handleCancel}
            className="text-[#000000] text-[20px] font-bold hover:text-gray-600"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-[#000000] text-[14px] font-medium" style={{ marginBottom: '0.75rem', fontFamily: 'Raleway, sans-serif' }}>
              Amount *
            </label>
            <div 
              className="flex items-center rounded-[8px] bg-[#f8f9fa]"
              style={{ border: '1px solid #000000', padding: '12px 16px' }}
            >
              <span className="text-[#000000]" style={{ fontFamily: 'Raleway, sans-serif' }}>₹</span>
              <input
                type="number"
                placeholder="e.g. 750"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[14px]"
                style={{ marginLeft: '8px', fontFamily: 'Raleway, sans-serif' }}
                required
              />
            </div>
          </div>

          {/* Transaction Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-[#000000] text-[14px] font-medium" style={{ marginBottom: '0.75rem', fontFamily: 'Raleway, sans-serif' }}>
              Transaction Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rent Transfer, Metro Card"
              value={formData.transactionName}
              onChange={(e) => handleInputChange('transactionName', e.target.value)}
              className="w-full rounded-[8px] bg-[#f8f9fa] text-[#000000] text-[14px] outline-none"
              style={{ border: '1px solid #000000', padding: '12px 16px', fontFamily: 'Raleway, sans-serif' }}
              required
            />
          </div>

          {/* Date & Time */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-[#000000] text-[14px] font-medium" style={{ marginBottom: '0.75rem', fontFamily: 'Raleway, sans-serif' }}>
              Date & Time (Current)
            </label>
            <div 
              className="flex items-center rounded-[8px] bg-[#f8f9fa]"
              style={{ border: '1px solid #000000', padding: '12px 16px' }}
            >
              <input
                type="datetime-local"
                value={formData.dateTime}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-[#000000] text-[14px]"
                style={{ fontFamily: 'Raleway, sans-serif', cursor: 'not-allowed' }}
              />
              <span className="text-[#000000]" style={{ marginLeft: '8px', fontFamily: 'Raleway, sans-serif' }}>
                <i className="fas fa-calendar-alt"></i>
              </span>
            </div>
            <p className="text-[#6b7280] text-[12px] mt-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Automatically set to current date and time
            </p>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-[#000000] text-[14px] font-medium" style={{ marginBottom: '0.75rem', fontFamily: 'Raleway, sans-serif' }}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full rounded-[8px] bg-[#f8f9fa] text-[#000000] text-[14px] outline-none"
              style={{ border: '1px solid #000000', padding: '12px 16px', fontFamily: 'Raleway, sans-serif' }}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="block text-[#000000] text-[14px] font-medium" style={{ marginBottom: '0.75rem', fontFamily: 'Raleway, sans-serif' }}>
              Payment Method *
            </label>
            <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  className="flex items-center justify-center rounded-[8px] text-[14px] transition-colors"
                  style={{ 
                    border: '1px solid #000000',
                    padding: '12px 8px',
                    fontFamily: 'Raleway, sans-serif',
                    backgroundColor: formData.paymentMethod === method.id ? '#000000' : '#f8f9fa',
                    color: formData.paymentMethod === method.id ? 'white' : '#000000'
                  }}
                >
                  <i 
                    className={`${method.icon}`} 
                    style={{ 
                      marginRight: '6px',
                      color: formData.paymentMethod === method.id ? 'white' : '#000000'
                    }}
                  ></i>
                  <span style={{ color: formData.paymentMethod === method.id ? 'white' : '#000000' }}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center" style={{ marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleCancel}
              className="text-[#000000] text-[14px] font-medium hover:text-gray-600"
              style={{ 
                fontFamily: 'Raleway, sans-serif',
                padding: '12px 24px',
                border: '1px solid #000000',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center rounded-[8px] transition-colors hover:bg-[#333333]"
              style={{ 
                backgroundColor: '#000000',
                color: 'white',
                padding: '12px 24px',
                fontFamily: 'Raleway, sans-serif',
                border: '1px solid #000000'
              }}
            >
              <i className="fas fa-save" style={{ marginRight: '8px', color: 'white' }}></i>
              <span style={{ color: 'white' }}>
                {isLoading ? 'Saving...' : 'Save Transaction'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 