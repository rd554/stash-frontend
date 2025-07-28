import { apiClient } from './api'

export interface PersonalitySession {
  originalPersonality: string
  temporaryPersonality: string
  username: string
  expiresAt: number
  createdAt: number
}

export class SessionManager {
  private static readonly SESSION_KEY = 'stash-ai-personality-session'
  private static readonly SESSION_DURATION = 48 * 60 * 60 * 1000 // 48 hours in milliseconds

  // Start a temporary personality session
  static async startTemporarySession(
    username: string, 
    originalPersonality: string, 
    temporaryPersonality: string
  ): Promise<boolean> {
    try {
      const session: PersonalitySession = {
        originalPersonality,
        temporaryPersonality,
        username,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION
      }

      // Update backend personality
      const response = await apiClient.updateSpendingPersonality(username, temporaryPersonality)
      if (!response.success) {
        console.error('Failed to update personality in backend:', response.error)
        return false
      }

      // Store session in localStorage
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
      
      // Update user data in localStorage
      const userData = localStorage.getItem('stash-ai-user-data')
      if (userData) {
        const parsedData = JSON.parse(userData)
        parsedData.spendingPersonality = temporaryPersonality
        localStorage.setItem('stash-ai-user-data', JSON.stringify(parsedData))
      }

      console.log(`Started 48-hour session: ${originalPersonality} → ${temporaryPersonality}`)
      return true
    } catch (error) {
      console.error('Error starting temporary session:', error)
      return false
    }
  }

  // Check if there's an active session and if it's expired
  static async checkAndManageSession(): Promise<{ 
    hasActiveSession: boolean
    session?: PersonalitySession 
    wasExpired?: boolean 
  }> {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) {
        return { hasActiveSession: false }
      }

      const session: PersonalitySession = JSON.parse(sessionData)
      const now = Date.now()

      // Check if session has expired
      if (now > session.expiresAt) {
        console.log('48-hour session expired, reverting to original personality')
        
        // Revert to original personality
        const reverted = await this.revertToOriginalPersonality(session)
        return { 
          hasActiveSession: false, 
          session, 
          wasExpired: true 
        }
      }

      return { 
        hasActiveSession: true, 
        session 
      }
    } catch (error) {
      console.error('Error checking session:', error)
      return { hasActiveSession: false }
    }
  }

  // Manually end session (logout or user choice)
  static async endSession(): Promise<boolean> {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) {
        return true // No session to end
      }

      const session: PersonalitySession = JSON.parse(sessionData)
      return await this.revertToOriginalPersonality(session)
    } catch (error) {
      console.error('Error ending session:', error)
      return false
    }
  }

  // Revert to original personality
  private static async revertToOriginalPersonality(session: PersonalitySession): Promise<boolean> {
    try {
      // Update backend personality back to original
      const response = await apiClient.updateSpendingPersonality(
        session.username, 
        session.originalPersonality
      )
      
      if (!response.success) {
        console.error('Failed to revert personality in backend:', response.error)
        return false
      }

      // Update user data in localStorage
      const userData = localStorage.getItem('stash-ai-user-data')
      if (userData) {
        const parsedData = JSON.parse(userData)
        parsedData.spendingPersonality = session.originalPersonality
        localStorage.setItem('stash-ai-user-data', JSON.stringify(parsedData))
      }

      // Clear session
      localStorage.removeItem(this.SESSION_KEY)
      
      console.log(`Reverted personality: ${session.temporaryPersonality} → ${session.originalPersonality}`)
      return true
    } catch (error) {
      console.error('Error reverting personality:', error)
      return false
    }
  }

  // Get current session info
  static getCurrentSession(): PersonalitySession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null
      
      const session: PersonalitySession = JSON.parse(sessionData)
      const now = Date.now()
      
      // Return null if expired
      if (now > session.expiresAt) return null
      
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  }

  // Get time remaining in session
  static getTimeRemaining(): { hours: number; minutes: number } | null {
    const session = this.getCurrentSession()
    if (!session) return null

    const remaining = session.expiresAt - Date.now()
    if (remaining <= 0) return null

    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

    return { hours, minutes }
  }
} 