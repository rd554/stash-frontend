'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

type SpendingPersonality = 'Heavy Spender' | 'Medium Spender' | 'Max Saver'

export default function PersonalitySelectionPage() {
  const [selectedPersonality, setSelectedPersonality] = useState<SpendingPersonality | ''>('')
  const router = useRouter()

  const personalityOptions = [
    {
      id: 'Heavy Spender' as SpendingPersonality,
      title: 'High Roller',
      description: 'You enjoy spending on experiences and quality items',
      icon: '💰'
    },
    {
      id: 'Medium Spender' as SpendingPersonality,
      title: 'Mindful Spender',
      description: 'You balance spending with saving goals',
      icon: '⚖️'
    },
    {
      id: 'Max Saver' as SpendingPersonality,
      title: 'Savings Champion',
      description: 'You prioritize saving and minimal spending',
      icon: '🏦'
    }
  ]

  const handleContinue = async () => {
    console.log('Continue button clicked, selected personality:', selectedPersonality)
    
    if (selectedPersonality) {
      try {
        console.log('Starting registration process...')
        
        // Save user's spending personality
        localStorage.setItem('stash-ai-spending-personality', selectedPersonality)
        
        // Get user data from localStorage
        const username = localStorage.getItem('stash-ai-user')
        const name = localStorage.getItem('stash-ai-user-name')
        const age = localStorage.getItem('stash-ai-user-age')
        // Always use light theme since we removed dark theme support
        const theme = 'light'
        
        console.log('User data:', { username, name, age, spendingPersonality: selectedPersonality, theme })
        
        // Register user with backend
        const response = await apiClient.register({
          username: username || 'test1',
          name: name || 'User',
          age: age || '25',
          spendingPersonality: selectedPersonality,
          theme: theme
        })
        
        console.log('Registration response:', response)
        
        if (response.success) {
          console.log('Registration successful, redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.error('Registration failed:', response.error)
          toast.error('Registration failed. Please try again.')
        }
      } catch (error) {
        console.error('Registration error:', error)
        toast.error('Registration failed. Please try again.')
      }
    } else {
      console.log('No personality selected')
      toast.error('Please select a spending personality')
    }
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen flex flex-col items-center justify-center">
      <div style={{ marginBottom: '40px' }}>
        <div className="text-center">
          <h1 className="text-[36px] md:text-[52px] lg:text-[60px] font-bold text-[#111827]">
            Help us personalize your experience
          </h1>
          <p className="text-[22px] md:text-[26px] lg:text-[30px] text-[#6B7280] mt-4">
            What kind of spender are you?
          </p>
        </div>
      </div>
      
      <div className="flex flex-col mt-8" style={{ marginBottom: '40px', gap: '20px' }}>
        {personalityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              console.log('Personality selected:', option.id)
              setSelectedPersonality(option.id)
            }}
            className={`text-[18px] font-medium leading-[24px] rounded-[8px] border w-[320px] ${
              selectedPersonality === option.id
                ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                : 'bg-[#FFFFFF] text-[#111827] border-[#E5E7EB]'
            }`}
            style={{
              padding: '16px 24px'
            }}
          >
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{option.icon}</span>
              <div className="text-left">
                <div className="font-semibold text-[16px]">{option.title}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={handleContinue}
          disabled={!selectedPersonality}
          className={`w-[320px] h-[48px] text-[16px] font-medium rounded-[8px] ${
            selectedPersonality
              ? 'bg-[#000000] text-[#FFFFFF]'
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          Let's go
        </button>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <div className="w-[8px] h-[8px] bg-[#D1D5DB] rounded-full"></div>
        <div className="w-[8px] h-[8px] bg-[#D1D5DB] rounded-full"></div>
        <div className="w-[24px] h-[8px] bg-[#111827] rounded-full"></div>
      </div>
    </div>
  )
} 