'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { User } from '@/types'
import ChatInterface from './ChatInterface'

interface FloatingChatbotProps {
  user: User
  showChat: boolean
  onCloseChat: () => void
  contextUpdateTrigger?: number
}

export default function FloatingChatbot({ user, showChat, onCloseChat, contextUpdateTrigger }: FloatingChatbotProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // When showChat becomes true, expand the chatbot
  useEffect(() => {
    if (showChat) {
      setIsExpanded(true)
    }
  }, [showChat])



  const toggleChatbot = () => {
    if (showChat) {
      onCloseChat()
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <>
      {/* Simple Test Button */}
      <div 
        style={{ 
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          backgroundColor: '#000000',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontFamily: 'Raleway, sans-serif',
          fontWeight: '500',
          fontSize: '14px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={toggleChatbot}
      >
        <MessageCircle size={20} />
        Stash AI chatbot
      </div>

      {/* Expanded Chat Window */}
      {(isExpanded || showChat) && (
        <div 
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            zIndex: 99999,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid #000000',
            overflow: 'hidden',
            fontFamily: 'Raleway, sans-serif'
          }}
        >
          {/* Chat Header */}
          <div 
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'Raleway, sans-serif',
              fontWeight: '600',
              fontSize: '14px',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} />
              Stash AI chatbot
            </div>
            <button
              onClick={() => {
                if (showChat) {
                  onCloseChat()
                } else {
                  toggleChatbot()
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Interface Container */}
          <div style={{ height: 'calc(500px - 57px)' }}>
            <ChatInterface user={user} contextUpdateTrigger={contextUpdateTrigger} />
          </div>
        </div>
      )}
    </>
  )
} 