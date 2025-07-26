'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

export default function AgeSelectionPage() {
  const [selectedAge, setSelectedAge] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  // Generate age options (18-80)
  const ageOptions = Array.from({ length: 63 }, (_, i) => (i + 18).toString())

  const handleContinue = () => {
    if (selectedAge) {
      // Save user's age
      localStorage.setItem('stash-ai-user-age', selectedAge)
      
      // Navigate to next step
      router.push('/onboarding/personality')
    }
  }

  return (
    <div className="bg-[#f9f9f9] h-screen flex flex-col justify-center items-center">
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-[36px] md:text-[52px] lg:text-[60px] font-bold text-[#1a1a1a] text-center">
          Help us personalize your experience
        </h1>
      </div>
      
      <div className="w-[320px]" style={{ marginBottom: '40px' }}>
        <label className="text-[22px] md:text-[26px] lg:text-[30px] text-[#1a1a1a] block" style={{ marginBottom: '12px' }}>
          What's your age?
        </label>
        <div className="relative age-select-container">
          <select 
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            className="w-full h-[48px] text-[#1a1a1a] text-[16px] font-medium focus:outline-none appearance-none bg-white age-select-field"
            style={{
              paddingLeft: '16px',
              paddingRight: '40px',
              border: '1px solid #007aff',
              borderRadius: '8px',
              boxSizing: 'border-box',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            } as React.CSSProperties}
          >
            <option value="" disabled style={{ color: '#999' }}>Select your age</option>
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age} years old
              </option>
            ))}
          </select>
          <span 
            className="absolute top-1/2 transform -translate-y-1/2 text-[#1a1a1a] pointer-events-none"
            style={{ 
              right: '12px',
              fontSize: '10px',
              lineHeight: '1',
              zIndex: 10
            }}
          >
            ▼
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <button 
          onClick={handleContinue}
          disabled={!selectedAge}
          className={`w-[320px] h-[48px] text-[16px] font-medium rounded-[8px] ${
            selectedAge 
              ? 'bg-[#000000] text-[#ffffff]' 
              : 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <span className="w-[8px] h-[8px] bg-[#d1d1d1] rounded-full"></span>
        <span className="w-[8px] h-[8px] bg-[#1a1a1a] rounded-full"></span>
        <span className="w-[8px] h-[8px] bg-[#d1d1d1] rounded-full"></span>
      </div>
    </div>
  )
} 