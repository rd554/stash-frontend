'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NameInputPage() {
  const [name, setName] = useState('')
  const router = useRouter()

  const handleContinue = () => {
    if (name.trim()) {
      // Save user's name
      localStorage.setItem('stash-ai-user-name', name.trim())
      
      // Navigate to next step
      router.push('/onboarding/age')
    }
  }

  return (
    <div className="bg-[#F9F9F9] h-screen flex flex-col justify-center items-center px-4">
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-[36px] md:text-[52px] lg:text-[60px] font-bold text-[#0F172A] text-center">
          Help us personalize your experience
        </h1>
      </div>
      
      <div className="w-[320px]" style={{ marginBottom: '40px' }}>
        <label
          htmlFor="name"
          className="text-[22px] md:text-[26px] lg:text-[30px] text-[#0F172A] block"
          style={{ marginBottom: '12px' }}
        >
          What should I call you?
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-white focus:outline-none focus:border-black text-[18px] placeholder-gray-500"
          style={{ 
            border: '2px solid #E2E8F0', 
            padding: '0.75rem 2.5rem', 
            borderRadius: '16px', 
            boxSizing: 'border-box',
            color: name.trim() ? '#0F172A' : '#94A3B8'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={handleContinue}
          disabled={!name.trim()}
          className={`w-[320px] h-[48px] text-[16px] font-medium rounded-[8px] ${
            name.trim()
              ? 'bg-[#000000] text-[#FFFFFF] cursor-pointer'
              : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <span className="w-[8px] h-[8px] bg-[#0F172A] rounded-full"></span>
        <span className="w-[8px] h-[8px] bg-[#E2E8F0] rounded-full"></span>
        <span className="w-[8px] h-[8px] bg-[#E2E8F0] rounded-full"></span>
      </div>
    </div>
  )
} 