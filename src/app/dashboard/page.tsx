'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Transaction } from '@/types'
import FloatingChatbot from '@/components/FloatingChatbot'
import NewTransactionModal from '@/components/NewTransactionModal'
import { apiClient } from '@/lib/api'
import { MonthlyReset } from '@/lib/monthlyReset'
import MetricCards from '@/components/MetricCards'
import AIFinancialInsights from '@/components/AIFinancialInsights'
import WeeklySpending from '@/components/WeeklySpending'
import BudgetOverview from '@/components/BudgetOverview'
import RecentTransactions from '@/components/RecentTransactions'


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false)
  // Remove unused inputMessage state variables
  // const [inputMessage, setInputMessage] = useState('')
  const [contextUpdateTrigger, setContextUpdateTrigger] = useState(0)
  const router = useRouter()

  const generateAgenticInsights = useCallback(async (userId: string, transactions: Transaction[]) => {
    try {
      console.log('Generating agentic insights for user:', userId)
      
      // Get the latest transaction for context
      const latestTransaction = transactions.length > 0 ? transactions[0] : null
      
      const response = await apiClient.generateAgenticInsights(
        userId, 
        latestTransaction ? [{
          id: latestTransaction.id,
          userId: latestTransaction.userId,
          amount: latestTransaction.amount,
          category: latestTransaction.category,
          merchant: latestTransaction.merchant,
          date: latestTransaction.date,
          paymentMode: latestTransaction.paymentMode,
          isSimulated: latestTransaction.isSimulated,
          createdAt: latestTransaction.createdAt
        }] : undefined
      )
      
      if (response.success) {
        console.log('Agentic insights generated successfully')
      }
    } catch (error) {
      console.error('Error generating agentic insights:', error)
    }
  }, [])

  const loadTransactions = useCallback(async (userId: string) => {
    try {
      console.log('Loading transactions for user:', userId)
      
      // Use the new budget transactions API to get all transactions (persona + manual)
      const response = await apiClient.getBudgetTransactions(userId)
      
      if (response.success && response.data) {
        // Properly type the API response
        interface BudgetTransactionsResponse {
          transactions: Transaction[]
          manualCount: number
          personaCount: number
        }
        
        const apiData = response.data as BudgetTransactionsResponse
        const allTransactions = apiData.transactions || []
        
        console.log('Loaded transactions:', allTransactions.length)
        console.log('Manual transactions:', apiData.manualCount)
        console.log('Persona transactions:', apiData.personaCount)
        
        setTransactions(allTransactions)
        
        // Generate agentic insights based on transactions
        await generateAgenticInsights(userId, allTransactions)
      } else {
        console.error('Failed to load transactions from API')
        setTransactions([])
      }
      
    } catch (error) {
      console.error('Failed to load transactions:', error)
      console.log('Setting empty transactions array due to error')
      setTransactions([])
    }
  }, [generateAgenticInsights])

  // Manual transactions are now handled by the backend API
  // No need for localStorage logic anymore

  // Remove unused getPersonalityData function and personalityData variable
  // const getPersonalityData = () => {
  //   if (!user) return { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 }
  //   
  //   const personalityData = {
  //     'Heavy Spender': { salary: 100000, emi: 35000, savings: 2000, emergencyFund: 75000 },
  //     'Medium Spender': { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 },
  //     'Max Saver': { salary: 100000, emi: 5000, savings: 40000, emergencyFund: 75000 }
  //   }
  //   
  //   return personalityData[user.spendingPersonality] || personalityData['Medium Spender']
  // }

  // Remove unused handleSendMessage function
  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim() || !user) return
  //
  //   const newMessage = {
  //     id: Date.now().toString(),
  //     message: inputMessage,
  //     isUser: true,
  //     timestamp: new Date()
  //   }
  //   setInputMessage('')
  //
  //   try {
  //     const response = await apiClient.sendMessage(user.username, newMessage.message)
  //     
  //     if (response.success && response.data) {
  //       // Properly type the AI message response
  //       interface MessageResponse {
  //         aiMessage: {
  //           id: string
  //           message: string
  //           timestamp: string
  //         }
  //       }
  //       
  //       const messageData = response.data as MessageResponse
  //       // Handle AI response if needed
  //       console.log('AI response:', messageData.aiMessage)
  //     }
  //   } catch (error) {
  //     console.error('Failed to send message:', error)
  //   }
  // }

  const handleGetTips = () => {
    console.log('Get Tips clicked - opening chat and triggering context update')
    setShowChat(true)
    // Trigger context update for the chatbot
    setContextUpdateTrigger(prev => prev + 1)
  }

  const handleNewTransaction = () => {
    console.log('New Transaction button clicked')
    console.log('Current showNewTransactionModal state:', showNewTransactionModal)
    setShowNewTransactionModal(true)
    console.log('Set showNewTransactionModal to true')
  }

  const handleCloseModal = () => {
    setShowNewTransactionModal(false)
  }

  const handleTransactionAdded = () => {
    loadTransactions(user?.username || '')
    // Trigger insight refresh by updating context trigger
    setContextUpdateTrigger(prev => prev + 1)
  }

  const handleSignOut = () => {
    console.log('Signing out...')
    
    // Clear all localStorage items
    localStorage.removeItem('stash-ai-user-data')
    localStorage.removeItem('stash-ai-user')
    localStorage.removeItem('stash-ai-user-name')
    localStorage.removeItem('stash-ai-user-age')
    localStorage.removeItem('stash-ai-spending-personality')
    localStorage.removeItem('stash-ai-theme')
    localStorage.removeItem('last-monthly-reset')
    
    // Clear any budget-related localStorage items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('budget-') || key.startsWith('stash-ai-'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('LocalStorage cleared, redirecting to login...')
    
    // Force redirect to login page
    window.location.href = '/'
  }

  useEffect(() => {
    // Check if user is logged in and has completed onboarding
    const userData = localStorage.getItem('stash-ai-user-data')
    const username = localStorage.getItem('stash-ai-user')
    
    if (!userData || !username) {
      router.push('/')
      return
    }

    const parsedUserData = JSON.parse(userData)
    const userObj: User = {
      id: username,
      username: username as 'test1' | 'test2' | 'test3',
      name: parsedUserData.name,
      age: parseInt(parsedUserData.age),
      theme: parsedUserData.theme,
      spendingPersonality: parsedUserData.spendingPersonality,
      createdAt: new Date()
    }
    setUser(userObj)



    // Check for monthly reset and load data
    const initializeDashboard = async () => {
      // Check if monthly reset is needed
      const resetPerformed = await MonthlyReset.checkAndResetIfNeeded(username)
      if (resetPerformed) {
        console.log('Monthly reset completed, refreshing data...')
      }
      
      // Load transactions from API
      loadTransactions(username)
    }
    
    initializeDashboard()
  }, [router, loadTransactions])

  // Handle clicking outside avatar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.avatar-dropdown-container')) {
        setShowAvatarDropdown(false)
      }
    }

    if (showAvatarDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAvatarDropdown])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-0" style={{ paddingLeft: '16px' }}>
              <h1 className="text-2xl font-bold text-[#000000]">
                Stash AI
              </h1>
            </div>
            
            <div 
              className="flex items-center" 
              style={{ gap: '1.5rem', marginRight: '16px' }}
            >
              <button 
                onClick={handleNewTransaction}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#000000] text-white text-base font-semibold rounded-[10px] shadow-lg hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#000000] transition-all"
                style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  minHeight: '40px', 
                  color: 'white', 
                  backgroundColor: '#000000',
                  fontFamily: 'Raleway, sans-serif'
                }}
              >
                <i className="fas fa-plus text-white"></i>
                <span>New Transaction</span>
              </button>
              
              {/* Remove the notification bell button */}
              
              <div className="relative avatar-dropdown-container">
                <button
                  onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                  className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#000000', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: 'none',
                    outline: 'none'
                  }}
                >
                  <span 
                    className="text-white font-semibold text-sm"
                    style={{ 
                      color: 'white', 
                      fontWeight: '600', 
                      fontSize: '16px',
                      fontFamily: 'Raleway, sans-serif'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showAvatarDropdown && (
                  <div 
                    className="absolute mt-2 shadow-lg z-50"
                    style={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #000000',
                      borderRadius: '8px',
                      minWidth: '100px',
                      fontFamily: 'Raleway, sans-serif',
                      right: '0',
                      padding: '6px'
                    }}
                  >
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left text-[#000000] text-[13px] font-medium hover:bg-[#000000] hover:text-white transition-all duration-200 rounded-[4px] group"
                      style={{ 
                        fontFamily: 'Raleway, sans-serif',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                      }}
                    >
                      <i 
                        className="fas fa-sign-out-alt group-hover:text-white" 
                        style={{ 
                          marginRight: '6px', 
                          color: '#000000',
                          fontSize: '13px'
                        }}
                      ></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Container */}
        <div className="bg-white rounded-xl shadow-md p-6" style={{ marginLeft: '16px', marginRight: '16px' }}>
          
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#1a1a1a]">
                Hi {user.name.length <= 3 && user.name === user.name.toUpperCase()
                  ? user.name
                  : user.name.split(' ')[0]
                }—here&apos;s your financial snapshot 😊
              </h1>

            </div>
          </div>

          {/* Metric Cards */}
          <MetricCards user={user} transactions={transactions} />

          {/* Two Column Section - AI Financial Insights & Budget Overview */}
          <div className="bg-[#ffffff]" style={{ padding: '0 32px', marginTop: '1.5rem' }}>
            <div className="flex justify-between" style={{ gap: '1.5rem' }}>
              {/* Left Column - AI Financial Insights + Recent Transactions */}
              <div style={{ width: '70%' }}>
                <AIFinancialInsights user={user} onGetTips={handleGetTips} refreshTrigger={contextUpdateTrigger} />
                {/* Recent Transactions below AI Financial Insights */}
                <div style={{ marginTop: '1.5rem' }}>
                  <RecentTransactions transactions={transactions} />
                </div>
              </div>

              {/* Right Column - Budget Overview + Weekly Spending */}
              <div style={{ width: '30%' }}>
                {/* Budget Overview */}
                <BudgetOverview user={user} transactions={transactions} />
                {/* Weekly Spending - Below Budget Overview */}
                <div style={{ marginTop: '1.5rem' }}>
                  <WeeklySpending user={user} />
                </div>
              </div>
            </div>
          </div>
          {/* No full-width cards below */}
        </div>
      </div>

      {/* Floating Chatbot */}
              {user && <FloatingChatbot user={user} showChat={showChat} onCloseChat={() => setShowChat(false)} contextUpdateTrigger={contextUpdateTrigger} />}

      {/* New Transaction Modal */}
      {user && (
        <NewTransactionModal
          isOpen={showNewTransactionModal}
          onClose={handleCloseModal}
          onTransactionAdded={handleTransactionAdded}
          userId={user.username}
        />
      )}
    </div>
  )
}