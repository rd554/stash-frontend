'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TestUser } from '@/types'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (userData: { username: string; name: string; age: string; theme: string; spendingPersonality: string }) => {
    setError('')
    setIsLoading(true)

    // Validate test user credentials
    const validUsers: TestUser[] = ['test1', 'test2', 'test3']
    const validPassword = 'test@123'

    if (!validUsers.includes(username as TestUser)) {
      setError('Invalid username. Use test1, test2, or test3')
      setIsLoading(false)
      return
    }

    if (password !== validPassword) {
      setError('Invalid password. Use test@123')
      setIsLoading(false)
      return
    }

    try {
      // Try to login via API
      const response = await apiClient.login(username, password)
      
      console.log('Login response:', response)
      
      if (response.success && response.data && (response.data as { user: { username: string; name: string; age: number; theme: string; spendingPersonality: string } }).user) {
        // User exists - store user info and redirect to dashboard
        console.log('User exists, redirecting to dashboard')
        localStorage.setItem('stash-ai-user', username)
        localStorage.setItem('stash-ai-user-data', JSON.stringify((response.data as { user: { username: string; name: string; age: number; theme: string; spendingPersonality: string } }).user))
        router.push('/dashboard')
      } else if (!response.success && response.error && response.error.includes('not found')) {
        // User doesn't exist, redirect to onboarding
        console.log('User not found, redirecting to onboarding')
        localStorage.setItem('stash-ai-user', username)
        // Set light theme as default since we're removing dark theme support
        localStorage.setItem('stash-ai-theme', 'light')
        router.push('/onboarding/name')
      } else {
        // Other error
        setError(response.error || 'Login failed. Please try again.')
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#ffffff] h-screen login-page">
      {/* Logo and Branding - Top Left */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-0">
          <img 
            src="/stash_logo.png" 
            alt="Stash AI Logo" 
            className="w-16 h-16"
            style={{ width: '64px', height: '64px' }}
          />
          <h1 className="text-2xl font-bold text-[#000000]" style={{ marginLeft: '-16px' }}>
            Stash AI
          </h1>
        </div>
      </div>

      {/* Entire Content - Below Navbar */}
      <div className="pt-48 flex justify-center" style={{ paddingTop: '12rem' }}>
        <div className="w-[400px] text-center bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-2xl">
          <h2 className="text-[36px] md:text-[52px] lg:text-[60px] font-bold text-[#000000] mb-8 text-center whitespace-nowrap" style={{ textAlign: 'center' }}>
            AI in your wallet
          </h2>
          <p className="text-[22px] md:text-[26px] lg:text-[30px] text-[#000000] mb-12">
            Sign in to your Stash AI Account
          </p>
          
          <div className="mb-0">
            <div style={{ marginBottom: '32px' }}>
              <input
                type="text"
                placeholder="Username (test1, test2, test3)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin({ username, name: '', age: '', theme: '', spendingPersonality: '' })}
                className="w-full bg-white focus:outline-none focus:border-black text-[18px] placeholder-gray-200"
                style={{ border: '2px solid #9CA3AF', padding: '0.75rem 2.5rem', borderRadius: '16px', boxSizing: 'border-box', color: '#000000' }}
              />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <input
                type="password"
                placeholder="Password (test@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin({ username, name: '', age: '', theme: '', spendingPersonality: '' })}
                className="w-full bg-white focus:outline-none focus:border-black text-[18px] placeholder-gray-200"
                style={{ border: '2px solid #9CA3AF', padding: '0.75rem 2.5rem', borderRadius: '16px', boxSizing: 'border-box', color: '#000000' }}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}
          
          <div className="w-full">
            <button
              onClick={() => handleLogin({ username, name: '', age: '', theme: '', spendingPersonality: '' })}
              disabled={isLoading}
              className="w-full bg-[#000000] text-[#ffffff] text-[18px] font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={{ padding: '0.75rem 2.5rem', borderRadius: '16px', boxSizing: 'border-box' }}
            >
              {isLoading ? 'Logging in...' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
