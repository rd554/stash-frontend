'use client'

import { useState, useEffect } from 'react'
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
  const [inputMessage, setInputMessage] = useState('')
  const [contextUpdateTrigger, setContextUpdateTrigger] = useState(0)
  const router = useRouter()

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
  }, [router])

  // Handle clicking outside avatar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
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

  const loadTransactions = async (userId: string) => {
    try {
      console.log('Loading transactions for user:', userId)
      
      // Use the new budget transactions API to get all transactions (persona + manual)
      const response = await apiClient.getBudgetTransactions(userId)
      
      if (response.success && response.data) {
        // The API client wraps the response, so we need to access response.data.data
        const apiData = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: { transactions: Transaction[]; manualCount: number; personaCount: number } }).data
          : response.data as { transactions: Transaction[]; manualCount: number; personaCount: number }
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
  }

  const generateAgenticInsights = async (userId: string, transactions: Transaction[]) => {
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
  }

  const loadPersonaTransactions = async (spendingPersonality: string, currentDate: string) => {
    try {
      const userTypeMapping: { [key: string]: string } = {
        'Heavy Spender': 'heavy',
        'Medium Spender': 'medium',
        'Max Saver': 'max'
      }
      
      const userType = userTypeMapping[spendingPersonality] || 'medium'
      
      console.log(`Loading latest ${userType} transactions`)
      
      // Use the new transaction service to get latest 10 transactions
      const response = await apiClient.getLatestTransactions(userType, 10)
      console.log('API Response:', response) // Debug log
      console.log('Response success:', response.success) // Debug log
      console.log('Response data:', response.data) // Debug log
      
      if (response.success && response.data && response.data.transactions) {
        console.log(`Loaded ${response.data.transactions.length} latest transactions`)
        setTransactions(response.data.transactions)
      } else {
        console.log('No transactions data received, setting empty array')
        console.log('Response success:', response.success)
        console.log('Response data exists:', !!response.data)
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to load persona transactions:', error)
      console.log('Setting empty transactions array due to error')
      setTransactions([])
    }
  }

  // Manual transactions are now handled by the backend API
  // No need for localStorage logic anymore

  const getPersonalityData = () => {
    if (!user) return { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 }
    
    const personalityData = {
      'Heavy Spender': { salary: 100000, emi: 35000, savings: 2000, emergencyFund: 75000 },
      'Medium Spender': { salary: 100000, emi: 15000, savings: 20000, emergencyFund: 75000 },
      'Max Saver': { salary: 100000, emi: 5000, savings: 40000, emergencyFund: 75000 }
    }
    
    return personalityData[user.spendingPersonality] || personalityData['Medium Spender']
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return

    const newMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    }
    setInputMessage('')

    try {
      const response = await apiClient.sendMessage(user.username, newMessage.message)
      if (response.success && response.data && typeof response.data === 'object' && 'aiMessage' in response.data) {
        const aiMessage = (response.data as { aiMessage: { id: string; message: string; timestamp: string } }).aiMessage
        // Handle AI response if needed
      } else {
        // Fallback AI response
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

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

  const personalityData = getPersonalityData()

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-0">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 400 400" 
                className="w-16 h-16"
              >
                <path d="M120 160L120 320Q120 340 140 340L320 340Q340 340 340 320L340 280L380 280Q400 280 400 260L400 220Q400 200 380 200L340 200L340 160Q340 140 320 140L140 140Q120 140 120 160Z" fill="#1DB584"/>
                <path d="M250 60Q270 60 290 70L380 120Q400 130 400 150L400 200L340 200L340 160Q340 140 320 140L250 140L250 60Z" fill="#0F8A5F"/>
                <rect x="340" y="200" width="60" height="80" rx="10" fill="#0F8A5F"/>
                <circle cx="370" cy="240" r="15" fill="#1DB584"/>
              </svg>
              <h1 className="text-2xl font-bold text-[#000000]" style={{ marginLeft: '-16px' }}>
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