export type Theme = 'light'

export type SpendingPersonality = 'Heavy Spender' | 'Medium Spender' | 'Max Saver'

export type TestUser = 'test1' | 'test2' | 'test3'

export interface User {
  id: string
  username: TestUser
  name: string
  age: number
  theme: Theme
  spendingPersonality: SpendingPersonality
  createdAt: Date
}

export interface Transaction {
  id: string
  userId: string
  date: string
  merchant: string
  amount: number
  category: string
  paymentMode: string
  isSimulated: boolean
  createdAt: Date
}

export interface Nudge {
  id: string
  userId: string
  message: string
  type: 'warning' | 'suggestion' | 'celebration'
  isRead: boolean
  createdAt: Date
}

export interface ChatMessage {
  id: string
  userId: string
  message: string
  isUser: boolean
  timestamp: Date
} 