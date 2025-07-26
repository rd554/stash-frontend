'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TestUser } from '@/types'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate test user credentials
    const validUsers: TestUser[] = ['test1', 'test2', 'test3']
    const validPassword = 'test@123'

    if (!validUsers.includes(username as TestUser)) {
      setError('Invalid username. Use test1, test2, or test3')
      return
    }

    if (password !== validPassword) {
      setError('Invalid password. Use test@123')
      return
    }

    try {
      // Try to login via API
      const response = await apiClient.login(username, password)
      
      if (response.success && response.data && typeof response.data === 'object' && 'user' in response.data) {
        // Store user info and redirect to dashboard
        localStorage.setItem('stash-ai-user', username)
        localStorage.setItem('stash-ai-user-data', JSON.stringify((response.data as any).user))
        toast.success('Login successful!')
        router.push('/dashboard')
      } else {
        // User doesn't exist, redirect to onboarding
        localStorage.setItem('stash-ai-user', username)
        // Set light theme as default since we're removing dark theme support
        localStorage.setItem('stash-ai-theme', 'light')
        toast('New user detected! Please complete onboarding.', { icon: 'ℹ️' })
        router.push('/onboarding/name')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#ffffff] flex items-center justify-center z-50">
      <div className="w-[400px] text-center">
        <h1 className="text-[24px] font-semibold text-[#000000]">Start Your Financial Journey</h1>
        <p className="text-[14px] text-[#6b6b6b] mt-2">Sign in to your Stash AI Account</p>
        
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (test1, test2, test3)"
            className="w-full py-2 px-4 border-[1px] border-[#e0e0e0] rounded-[8px] text-[14px] text-[#6b6b6b] focus:outline-none focus:border-[#000000]"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (test@123)"
            className="w-full mt-4 py-2 px-4 border-[1px] border-[#e0e0e0] rounded-[8px] text-[14px] text-[#6b6b6b] focus:outline-none focus:border-[#000000]"
            required
          />
          
          {error && (
            <div className="text-[12px] text-red-500 mt-2 text-center">
              {error}
            </div>
          )}
          
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] text-[#6b6b6b] hover:underline"
            >
              Cancel
            </button>
          </div>
          
          <button
            type="submit"
            className="w-full mt-6 py-2 bg-[#000000] text-[#ffffff] rounded-[8px] text-[14px] font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-[8px]">
          <p className="text-[12px] text-[#6b6b6b]">
            <strong className="text-[#000000]">Test Users:</strong><br />
            Username: test1, test2, or test3<br />
            Password: test@123
          </p>
        </div>
      </div>
    </div>
  )
} 