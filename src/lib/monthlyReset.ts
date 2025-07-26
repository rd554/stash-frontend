import { apiClient } from './api'

export class MonthlyReset {
  private static readonly LAST_RESET_KEY = 'last-monthly-reset'
  
  // Check if we need to reset (called on app startup)
  static async checkAndResetIfNeeded(userId: string): Promise<boolean> {
    try {
      const lastReset = localStorage.getItem(this.LAST_RESET_KEY)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const currentMonthKey = `${currentYear}-${currentMonth}`
      
      // If no reset recorded or different month, perform reset
      if (!lastReset || lastReset !== currentMonthKey) {
        // Clear manual transactions
        const transactionResponse = await apiClient.clearManualTransactions(userId)
        if (!transactionResponse.success) {
          console.error('Failed to clear manual transactions:', transactionResponse.error)
        }
        
        // Clear salary records
        const salaryResponse = await apiClient.clearSalary(userId)
        if (!salaryResponse.success) {
          console.error('Failed to clear salary records:', salaryResponse.error)
        }
        
        localStorage.setItem(this.LAST_RESET_KEY, currentMonthKey)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error during monthly reset check:', error)
      return false
    }
  }
  
  // Manual reset (for testing or admin use)
  static async manualReset(userId: string): Promise<boolean> {
    try {
      // Clear manual transactions
      const transactionResponse = await apiClient.clearManualTransactions(userId)
      if (!transactionResponse.success) {
        console.error('Failed to clear manual transactions:', transactionResponse.error)
      }
      
      // Clear salary records
      const salaryResponse = await apiClient.clearSalary(userId)
      if (!salaryResponse.success) {
        console.error('Failed to clear salary records:', salaryResponse.error)
      }
      
      localStorage.removeItem(this.LAST_RESET_KEY)
      return true
    } catch (error) {
      console.error('Error during manual reset:', error)
      return false
    }
  }
  
  // Get last reset info
  static getLastResetInfo(): { lastReset: string | null; currentMonth: string } {
    const lastReset = localStorage.getItem(this.LAST_RESET_KEY)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentMonthKey = `${currentYear}-${currentMonth}`
    
    return {
      lastReset,
      currentMonth: currentMonthKey
    }
  }
} 