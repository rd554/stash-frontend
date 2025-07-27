'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Bot } from 'lucide-react'
import { User, ChatMessage } from '@/types'
import { apiClient } from '@/lib/api'
// Remove unused toast import
// import toast from 'react-hot-toast'

interface ChatInterfaceProps {
  user: User
  contextUpdateTrigger?: number // Add this to trigger context updates
}

export default function ChatInterface({ user, contextUpdateTrigger }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestedQuestion, setSuggestedQuestion] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadChatHistory = useCallback(async () => {
    try {
      console.log('Loading chat history for user:', user.username)
      const response = await apiClient.getChatHistory(user.username, 50)
      
      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('Loaded chat history:', response.data.length, 'messages')
        setMessages(response.data.map((msg: { id: string; userId: string; message: string; isUser: boolean; timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } else {
        console.log('No chat history found or API failed')
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setMessages([])
    }
  }, [user.username])

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
    checkForContext()
  }, [loadChatHistory])

  // Check for context updates when trigger changes
  useEffect(() => {
    console.log('Context update trigger changed:', contextUpdateTrigger)
    if (contextUpdateTrigger) {
      console.log('Triggering context check...')
      checkForContext()
    }
  }, [contextUpdateTrigger])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea only when user interacts with it
  useEffect(() => {
    if (textareaRef.current && !isInitialLoad && inputMessage.length > 0) {
      // Reset to base height first with !important to override any CSS
      textareaRef.current.style.setProperty('height', '44px', 'important');
      
      // Calculate the required height
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Only expand if content actually overflows the single line
      if (scrollHeight > 44) {
        textareaRef.current.style.setProperty('height', Math.min(scrollHeight, 120) + 'px', 'important');
      }
    }
  }, [inputMessage, isInitialLoad])

  // Mark initial load as complete after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Ensure textarea starts with correct height on mount and after context is loaded
  useEffect(() => {
    if (textareaRef.current) {
      // Force the height to be exactly what we want
      textareaRef.current.style.setProperty('height', '44px', 'important');
      textareaRef.current.style.setProperty('min-height', '44px', 'important');
      textareaRef.current.style.setProperty('max-height', '44px', 'important');
    }
  }, [suggestedQuestion]);

  // Set initial height when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        // Force the height to be exactly what we want
        textareaRef.current.style.setProperty('height', '44px', 'important');
        textareaRef.current.style.setProperty('min-height', '44px', 'important');
        textareaRef.current.style.setProperty('max-height', '44px', 'important');
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);



  const checkForContext = () => {
    try {
      const contextData = localStorage.getItem('stash-ai-chatbot-context')
      console.log('Checking for context, localStorage data:', contextData)
      if (contextData) {
        const context = JSON.parse(contextData)
        console.log('Found context data:', context)
        setSessionId(context.sessionId)
        setSuggestedQuestion(context.suggestedQuestion)
        
        // Pre-fill input with suggested question
        if (context.suggestedQuestion) {
          setInputMessage(context.suggestedQuestion)
          console.log('Input message set to:', context.suggestedQuestion)
        }
        
        // Clear the context from localStorage only after setting the input
        setTimeout(() => {
          localStorage.removeItem('stash-ai-chatbot-context')
          console.log('Context cleared from localStorage')
        }, 100)
        
        console.log('Context loaded and applied:', context.suggestedQuestion)
        console.log('SessionId set to:', context.sessionId)
      } else {
        console.log('No context data found in localStorage')
      }
    } catch (error) {
      console.error('Error loading context:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.username,
      message: inputMessage,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      let response;
      
      if (sessionId) {
        // Use agentic chatbot with context
        console.log('Using agentic chatbot with sessionId:', sessionId)
        console.log('Sending message:', currentMessage)
        response = await apiClient.sendChatbotMessage(user.username, currentMessage, sessionId)
        console.log('Agentic chatbot response:', response)
        
        if (response.success && response.data) {
          console.log('Response data structure:', response.data)
          console.log('Response.data.message:', (response.data as Record<string, unknown>).message)
          console.log('Response.data type:', typeof response.data)
          console.log('Response.data keys:', Object.keys(response.data))
          
          // Handle double-nested response structure
          let messageContent = 'No message received'
          const responseData = response.data as Record<string, unknown>
          const nestedData = responseData.data as Record<string, unknown> | undefined
          if (nestedData && typeof nestedData === 'object' && 'message' in nestedData) {
            // Double-nested structure: response.data.data.message
            messageContent = String(nestedData.message || '')
          } else if (responseData.message) {
            // Single-nested structure: response.data.message
            messageContent = String(responseData.message || '')
          }
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            userId: user.username,
            message: messageContent,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiMessage])
          console.log('AI message added to chat:', aiMessage)
        } else {
          console.error('Agentic chatbot response failed:', response)
          // Fallback to regular chat
          console.log('Falling back to regular chat')
          const fallbackResponse = await apiClient.sendMessage(user.username, currentMessage)
          console.log('Fallback chat response:', fallbackResponse)
          
          if (fallbackResponse.success && fallbackResponse.data && typeof fallbackResponse.data === 'object') {
            const data = fallbackResponse.data as Record<string, unknown>
            if (data.aiMessage) {
              const aiMessage = data.aiMessage as Record<string, unknown>
              const aiMessageWithDate = {
                id: String(aiMessage._id) || (Date.now() + 1).toString(),
                userId: String(aiMessage.userId),
                message: String(aiMessage.message),
                isUser: false,
                timestamp: new Date(String(aiMessage.timestamp))
              }
              setMessages(prev => [...prev, aiMessageWithDate])
            }
          }
        }
      } else {
        // Use regular chat
        console.log('Using regular chat')
        response = await apiClient.sendMessage(user.username, currentMessage)
        console.log('Regular chat response:', response)
        
        if (response.success && response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>
          if (data.aiMessage) {
            const aiMessage = data.aiMessage as Record<string, unknown>
            const aiMessageWithDate = {
              id: String(aiMessage._id) || (Date.now() + 1).toString(),
              userId: String(aiMessage.userId),
              message: String(aiMessage.message),
              isUser: false,
              timestamp: new Date(String(aiMessage.timestamp))
            }
            setMessages(prev => [...prev, aiMessageWithDate])
          }
        } else {
          console.error('Regular chat response failed:', response)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      console.error('Error details:', {
        message: currentMessage,
        sessionId,
        userId: user.username,
        error: error instanceof Error ? error.message : error
      })
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: user.username,
        message: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div 
      className="h-full flex flex-col" 
      style={{ 
        fontFamily: 'Raleway, sans-serif',
        backgroundColor: '#ffffff'
      }}
    >

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto" 
        style={{ 
          padding: '1rem',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start ${
                  message.isUser ? 'flex-row-reverse' : ''
                }`}
                style={{ 
                  gap: '12px',
                  maxWidth: '80%'
                }}
              >
                <div 
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    backgroundColor: message.isUser ? '#000000' : '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {message.isUser ? (
                    <span 
                      className="text-white font-semibold"
                      style={{ 
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'Raleway, sans-serif'
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Bot className="text-gray-600" style={{ width: '16px', height: '16px' }} />
                  )}
                </div>
                
                <div
                  className="rounded-lg"
                  style={{
                    padding: '12px 16px',
                    backgroundColor: message.isUser ? '#000000' : '#f8f9fa',
                    color: message.isUser ? '#ffffff' : '#374151',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'Raleway, sans-serif',
                    minWidth: '120px'
                  }}
                >
                  <p 
                    className="text-sm" 
                    style={{ 
                      lineHeight: '1.4',
                      margin: '0',
                      color: message.isUser ? '#ffffff' : '#1f2937',
                      fontFamily: 'Raleway, sans-serif',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {message.message}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ 
                      marginTop: '6px',
                      margin: '6px 0 0 0',
                      color: message.isUser ? 'rgba(255,255,255,0.8)' : '#4b5563',
                      fontFamily: 'Raleway, sans-serif',
                      fontSize: '11px',
                      fontWeight: '400'
                    }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
          
          {isLoading && (
            <div className="flex justify-start">
              <div 
                className="flex items-start" 
                style={{ 
                  gap: '12px', 
                  maxWidth: '80%' 
                }}
              >
                <div 
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <Bot className="text-gray-600" style={{ width: '16px', height: '16px' }} />
                </div>
                <div 
                  className="rounded-lg"
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    minWidth: '60px'
                  }}
                >
                  <div className="flex" style={{ gap: '4px' }}>
                    <div 
                      className="rounded-full animate-bounce" 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af' 
                      }}
                    ></div>
                    <div 
                      className="rounded-full animate-bounce" 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af',
                        animationDelay: '0.1s' 
                      }}
                    ></div>
                    <div 
                      className="rounded-full animate-bounce" 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af',
                        animationDelay: '0.2s' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div 
        style={{ 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="flex" style={{ alignItems: 'flex-end', gap: '0' }}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              // Only expand if there's actual content that needs more space
              if (textareaRef.current && inputMessage.length > 0) {
                textareaRef.current.style.setProperty('height', '44px', 'important');
                const scrollHeight = textareaRef.current.scrollHeight;
                // Only expand if content actually overflows
                if (scrollHeight > 44) {
                  textareaRef.current.style.setProperty('height', Math.min(scrollHeight, 120) + 'px', 'important');
                }
              }
            }}
            placeholder="Ask me about your finances..."
            className="flex-1"
            rows={1}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderRight: '1px solid #e5e7eb',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              resize: 'none',
              maxHeight: '120px',
              overflowY: 'auto',
              lineHeight: '1.4',
              minHeight: '20px',
              boxSizing: 'border-box'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="transition-all duration-200"
            style={{
              padding: '16px',
              backgroundColor: !inputMessage.trim() || isLoading ? '#f3f4f6' : '#000000',
              color: !inputMessage.trim() || isLoading ? '#9ca3af' : '#ffffff',
              border: 'none',
              cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Raleway, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.backgroundColor = '#374151'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.currentTarget.style.backgroundColor = '#000000'
              }
            }}
          >
            <Send style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  )
} 