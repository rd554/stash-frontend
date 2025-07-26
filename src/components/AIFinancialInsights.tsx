'use client'

import { User } from '@/types'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface AIFinancialInsightsProps {
  user: User
  onGetTips: () => void
  refreshTrigger?: number
}

// Update Insight interface
type InsightCategory = 'current' | 'predictive' | 'agentic' | 'proactive' | 'analytics';
interface Insight {
  type: 'warning' | 'info' | 'success' | 'tip' | 'current' | 'predictive' | 'agentic' | 'proactive';
  icon: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  message: string;
  hasButton: boolean;
  buttonText: string; // always string
  priority?: 'high' | 'medium' | 'low' | 'critical' | 'warning' | 'tip' | 'info';
  insightId?: string;
  title?: string;
  insightCategory?: InsightCategory;
}

export default function AIFinancialInsights({ user, onGetTips, refreshTrigger }: AIFinancialInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadInsights()
    }
  }, [user, refreshTrigger])

  const loadInsights = async () => {
    try {
      setLoading(true)
      console.log('🔍 AI INSIGHTS DEBUG: Loading agentic AI insights for user:', user.username)
      
      // Try to get agentic insights first
      let agenticResponse;
      try {
        console.log('🔍 AI INSIGHTS DEBUG: About to call getAgenticInsights...')
        agenticResponse = await apiClient.getAgenticInsights(user.username, 6)
        console.log('🔍 AI INSIGHTS DEBUG: Agentic insights API response:', agenticResponse)
        console.log('🔍 AI INSIGHTS DEBUG: Response success:', agenticResponse.success)
        console.log('🔍 AI INSIGHTS DEBUG: Response data type:', typeof agenticResponse.data)
        console.log('🔍 AI INSIGHTS DEBUG: Response data is array:', Array.isArray(agenticResponse.data))
        console.log('🔍 AI INSIGHTS DEBUG: Response data length:', Array.isArray(agenticResponse.data) ? agenticResponse.data.length : 'N/A')
        console.log('🔍 AI INSIGHTS DEBUG: Response data keys:', Object.keys(agenticResponse.data || {}))
        console.log('🔍 AI INSIGHTS DEBUG: Response data stringified:', JSON.stringify(agenticResponse.data))
      } catch (agenticError) {
        console.error('🔍 AI INSIGHTS DEBUG: Agentic insights API call failed:', agenticError)
        throw agenticError // Re-throw to trigger fallback
      }
      
      if (agenticResponse.success && agenticResponse.data && Array.isArray(agenticResponse.data)) {
        console.log('🔍 AI INSIGHTS DEBUG: Setting agentic insights:', agenticResponse.data)
        console.log('🔍 AI INSIGHTS DEBUG: Number of agentic insights:', Array.isArray(agenticResponse.data) ? agenticResponse.data.length : 'N/A')
        
        // In loadInsights, when mapping backend data, set type and insightCategory to the mapped value only
        const agenticInsights = agenticResponse.data.map((insight: any, index: number) => {
          const insightCategory = mapInsightType(insight.type);
          return {
            type: insightCategory, // always one of the four allowed
            icon: getInsightIcon(insight.type),
            bgColor: getInsightBgColor(insight.priority, insightCategory),
            textColor: getInsightTextColor(insight.priority, insightCategory),
            iconColor: getInsightIconColor(insight.priority, insightCategory),
            message: insight.content,
            hasButton: true,
            buttonText: 'Get Tips',
            priority: insight.priority,
            insightId: insight.insightId,
            title: insight.title,
            insightCategory: insightCategory
          } as Insight;
        })
        
        // Remove duplicate insights based on type and content
        const uniqueInsights = agenticInsights.filter((insight, index, self) => 
          index === self.findIndex(i => 
            i.type === insight.type && 
            i.message === insight.message
          )
        )
        
        console.log('🔍 AI INSIGHTS DEBUG: Unique insights after deduplication:', uniqueInsights.length)
        
        // Ensure we have between 3-6 insights
        let finalInsights = uniqueInsights.slice(0, 6)
        
        // If we don't have at least 3 insights, add fallback insights to reach minimum 3
        if (finalInsights.length < 3) {
          console.log('🔍 AI INSIGHTS DEBUG: Adding fallback insights to reach minimum 3 total')
          const fallbackInsights = getFallbackInsights().slice(0, 3 - finalInsights.length)
          finalInsights = [...finalInsights, ...fallbackInsights]
        }
        
        console.log('🔍 AI INSIGHTS DEBUG: Final insights to display:', finalInsights.length)
        setInsights(finalInsights)
      } else {
        console.log('🔍 AI INSIGHTS DEBUG: Agentic insights failed, trying regular insights')
        // Fallback to regular financial insights
        const response = await apiClient.getFinancialInsights(user.username)
        console.log('🔍 AI INSIGHTS DEBUG: Regular AI insights API response:', response)
        
        if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
          console.log('🔍 AI INSIGHTS DEBUG: Setting regular insights:', response.data.data)
          setInsights(response.data.data as Insight[])
        } else {
          console.log('🔍 AI INSIGHTS DEBUG: API failed, using fallback insights')
          setInsights(getFallbackInsights())
        }
      }
    } catch (error) {
      console.error('🔍 AI INSIGHTS DEBUG: Error loading AI insights:', error)
      setInsights(getFallbackInsights())
    } finally {
      setLoading(false)
      console.log('🔍 AI INSIGHTS DEBUG: Loading completed')
    }
  }

  // In mapInsightType, always return one of the five allowed categories
  const mapInsightType = (type: string): InsightCategory => {
    switch (type) {
      case 'burn_risk':
      case 'budget_overrun':
      case 'budget_cap_warning':
        return 'current';
      case 'pattern':
      case 'goal':
      case 'predictive_spending':
        return 'predictive';
      case 'agentic_analysis':
      case 'behavioral_adaptation':
        return 'agentic';
      case 'proactive_action':
      case 'smart_categorization':
        return 'proactive';
      case 'financial_health_analytics':
        return 'analytics';
      default:
        return 'current';
    }
  }

  const getInsightIcon = (type: string): string => {
    switch (type) {
      case 'burn_risk':
      case 'budget_overrun':
      case 'budget_cap_warning':
        return '⚠️'
      case 'savings_opportunity':
        return '💰'
      case 'pattern':
        return '📊'
      case 'goal':
        return '🎯'
      case 'agentic_analysis':
        return '🤖'
      case 'behavioral_adaptation':
        return '🧠'
      case 'proactive_action':
        return '⚡'
      case 'smart_categorization':
        return '🏷️'
      case 'financial_health_analytics':
        return '📈'
      case 'predictive_spending':
        return '🔮'
      default:
        return '💡'
    }
  }

  const getInsightBgColor = (priority: string, insightCategory?: string): string => {
    // First check for insight category (new system)
    if (insightCategory) {
      switch (insightCategory) {
        case 'current':
          return 'bg-[#ffe6e6]' // Darker red for current analysis (like metrics cards)
        case 'predictive':
          return 'bg-[#eaf2ff]' // Darker blue for predictive insights (like metrics cards)
        case 'agentic':
          return 'bg-[#e6f7ff]' // Darker cyan for agentic analysis
        case 'proactive':
          return 'bg-[#e6f9e6]' // Darker green for proactive insights (like metrics cards)
        case 'analytics':
          return 'bg-[#fff7e6]' // Yellow for analytics (like EMI metric card)
        default:
          return 'bg-[#eaf2ff]'
      }
    }
    
    // Fallback to priority-based colors (old system)
    switch (priority) {
      case 'critical':
        return 'bg-[#ffe6e6]'
      case 'warning':
        return 'bg-[#fff7e6]'
      case 'tip':
        return 'bg-[#e6f9e6]'
      default:
        return 'bg-[#eaf2ff]'
    }
  }

  const getInsightTextColor = (priority: string, insightCategory?: string): string => {
    // Use black text for all insights (like metrics cards)
    return 'text-[#000000]'
  }

  const getInsightIconColor = (priority: string, insightCategory?: string): string => {
    // First check for insight category (new system)
    if (insightCategory) {
      switch (insightCategory) {
        case 'current':
          return 'text-[#EF4444]' // Red for current analysis
        case 'predictive':
          return 'text-[#3B82F6]' // Blue for predictive insights
        case 'agentic':
          return 'text-[#0891B2]' // Cyan for agentic analysis
        case 'proactive':
          return 'text-[#16A34A]' // Green for proactive insights
        case 'analytics':
          return 'text-[#F59E0B]' // Yellow for analytics
        default:
          return 'text-[#EF4444]'
      }
    }
    
    // Fallback to priority-based colors (old system)
    switch (priority) {
      case 'critical':
        return 'text-[#EF4444]'
      case 'warning':
        return 'text-[#F59E0B]'
      case 'tip':
        return 'text-[#10B981]'
      default:
        return 'text-[#3B82F6]'
    }
  }

  const handleGetTips = async (insight: Insight) => {
    try {
      if (insight.insightId) {
        // Create chatbot context from insight
        const response = await apiClient.createChatbotContextFromInsight(
          user.username,
          insight.insightId
        )
        
        if (response.success && response.data) {
          // Store context data for chatbot
          localStorage.setItem('stash-ai-chatbot-context', JSON.stringify({
            sessionId: (response.data && typeof response.data === 'object' && 'sessionId' in response.data) ? response.data.sessionId : '',
            suggestedQuestion: (response.data && typeof response.data === 'object' && 'suggestedQuestion' in response.data) ? response.data.suggestedQuestion : '',
            context: (response.data && typeof response.data === 'object' && 'context' in response.data) ? response.data.context : ''
          }))
          
          // Update insight response
          await apiClient.updateInsightResponse(
            user.username,
            insight.insightId!,
            'get_tips_clicked'
          )
        }
      } else {
        // For fallback insights, create context based on insight content
        const suggestedQuestion = generateSuggestedQuestion(insight)
        
        // Store context data for chatbot
        localStorage.setItem('stash-ai-chatbot-context', JSON.stringify({
          sessionId: `fallback_${Date.now()}`,
          suggestedQuestion: suggestedQuestion,
          context: 'get_tips_clicked',
          insightContent: insight.message,
          insightType: insight.type
        }))
      }
      
      // Call the original onGetTips function
      onGetTips()
    } catch (error) {
      console.error('Error creating chatbot context:', error)
      // Fallback to original behavior
      onGetTips()
    }
  }

  const generateSuggestedQuestion = (insight: Insight): string => {
    const message = insight.message.toLowerCase()
    
    if (message.includes('savings') && message.includes('low')) {
      return "What areas can I focus on to increase my savings?"
    } else if (message.includes('average transaction') || message.includes('spending')) {
      return "How can I reduce my average transaction size and spend more wisely?"
    } else if (message.includes('dining') || message.includes('food')) {
      return "What are some ways to reduce my dining out expenses?"
    } else if (message.includes('balance') || message.includes('saving and spending')) {
      return "How can I maintain a better balance between saving and spending?"
    } else if (message.includes('diversifying') || message.includes('investments')) {
      return "What investment options should I consider for better returns?"
    } else if (message.includes('goal') || message.includes('track')) {
      return "How can I accelerate my progress towards my financial goals?"
    } else {
      return "How can I improve my financial health based on this insight?"
    }
  }

  const getFallbackInsights = (): Insight[] => {
    if (!user) return []
    
    const personality = user.spendingPersonality
    
    if (personality === 'Heavy Spender') {
      return [
        {
          type: 'current',
          icon: '⚠️',
          bgColor: 'bg-[#FEF2F2]',
          textColor: 'text-[#991B1B]',
          iconColor: 'text-[#EF4444]',
          message: 'Your savings (₹0) are quite low. Consider reducing non-essential spending.',
          hasButton: true,
          buttonText: 'Get Tips',
          priority: 'high',
          insightId: 'fallback_savings_low',
          title: 'Low Savings Alert',
          insightCategory: 'current'
        },
        {
          type: 'predictive',
          icon: '📊',
          bgColor: 'bg-[#EFF6FF]',
          textColor: 'text-[#1E3A8A]',
          iconColor: 'text-[#3B82F6]',
          message: 'At this rate, you\'ll exceed your budget by ₹15,000 this month.',
          hasButton: true,
          buttonText: 'Get Tips',
          priority: 'medium',
          insightId: 'fallback_budget_prediction',
          title: 'Budget Prediction',
          insightCategory: 'predictive'
        },
        {
          type: 'agentic',
          icon: '🤖',
          bgColor: 'bg-[#F0F9FF]',
          textColor: 'text-[#0C4A6E]',
          iconColor: 'text-[#0891B2]',
          message: 'I notice you spend more on weekends. Consider setting weekend spending limits.',
          hasButton: true,
          buttonText: 'Get Tips',
          priority: 'medium',
          insightId: 'fallback_behavioral_pattern',
          title: 'Behavioral Analysis',
          insightCategory: 'agentic'
        },
        {
          type: 'proactive',
          icon: '⚡',
          bgColor: 'bg-[#F0FDF4]',
          textColor: 'text-[#166534]',
          iconColor: 'text-[#16A34A]',
          message: 'I\'ve automatically categorized your recent transactions for better tracking.',
          hasButton: true,
          buttonText: 'Get Tips',
          priority: 'medium',
          insightId: 'fallback_auto_categorization',
          title: 'Smart Categorization',
          insightCategory: 'proactive'
        }
      ]
    } else if (personality === 'Medium Spender') {
      return [
        {
          type: 'current',
          icon: '✅',
          bgColor: 'bg-[#FEF2F2]',
          textColor: 'text-[#991B1B]',
          iconColor: 'text-[#EF4444]',
          message: 'You\'re on track to hit your savings goal this month! 🎯',
          hasButton: false,
          buttonText: '',
          priority: 'medium',
          insightCategory: 'current'
        },
        {
          type: 'predictive',
          icon: '📊',
          bgColor: 'bg-[#EFF6FF]',
          textColor: 'text-[#1E3A8A]',
          iconColor: 'text-[#3B82F6]',
          message: 'You\'re likely to save ₹25,000 this month based on current patterns.',
          hasButton: false,
          buttonText: '',
          priority: 'low',
          insightCategory: 'predictive'
        }
      ]
    } else { // Max Saver
      return [
        {
          type: 'current',
          icon: '🏦',
          bgColor: 'bg-[#FEF2F2]',
          textColor: 'text-[#991B1B]',
          iconColor: 'text-[#EF4444]',
          message: 'Excellent! You\'re saving 40% of your income this month.',
          hasButton: false,
          buttonText: '',
          priority: 'medium',
          insightCategory: 'current'
        },
        {
          type: 'proactive',
          icon: '⚡',
          bgColor: 'bg-[#F0FDF4]',
          textColor: 'text-[#166534]',
          iconColor: 'text-[#16A34A]',
          message: 'Consider diversifying into investments for better returns.',
          hasButton: true,
          buttonText: 'Get Tips',
          priority: 'medium',
          insightCategory: 'proactive'
        }
      ]
    }
  }

  // Enhanced styling functions for highlighting nudges
  const getInsightBorderColor = (insight: Insight): string => {
    if (insight.priority === 'high') {
      switch (insight.type) {
        case 'warning': return '#EF4444' // Red for high priority warnings
        case 'success': return '#10B981' // Green for high priority success
        case 'info': return '#3B82F6' // Blue for high priority info
        case 'tip': return '#8B5CF6' // Purple for high priority tips
        default: return '#000000'
      }
    }
    return '#E5E7EB' // Default gray border for medium/low priority
  }

  const getInsightShadow = (insight: Insight): string => {
    if (insight.priority === 'high') {
      const borderColor = getInsightBorderColor(insight)
      const rgbColor = borderColor === '#EF4444' ? '239, 68, 68' :
                      borderColor === '#10B981' ? '16, 185, 129' :
                      borderColor === '#3B82F6' ? '59, 130, 246' :
                      borderColor === '#8B5CF6' ? '139, 92, 246' : '0, 0, 0'
      return `0 4px 12px rgba(${rgbColor}, 0.15)`
    }
    return '0 1px 3px rgba(0, 0, 0, 0.1)' // Default shadow
  }

  const getInsightTransform = (insight: Insight): string => {
    return insight.priority === 'high' ? 'scale(1.02)' : 'scale(1)'
  }

  const getInsightFontWeight = (insight: Insight): string => {
    return insight.priority === 'high' ? 'font-semibold' : 'font-normal'
  }

  // Utility: Get darker color for a given insight category
  const getInsightDarkerColor = (insightCategory?: string): string => {
    switch (insightCategory) {
      case 'current':
        return '#e57373'; // Darker red
      case 'predictive':
        return '#4f8edc'; // Darker blue
      case 'agentic':
        return '#1ca3b6'; // Darker cyan
      case 'proactive':
        return '#22a06b'; // Darker green
      case 'analytics':
        return '#f59e0b'; // Yellow for analytics
      default:
        return '#4f8edc';
    }
  }

  if (loading) {
    return (
      <div 
        className="bg-white rounded-[12px] shadow-sm" 
              style={{ 
        minHeight: '180px', 
        padding: '24px 20px',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0,
        flexShrink: 0
      }}
      >
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-gray-100 rounded-[8px]">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-[12px] shadow-md" 
      style={{ 
        minHeight: '180px', 
        padding: '24px 20px',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0,
        flexShrink: 0,
        border: '1px solid #000000'
      }}
    >
      <div className="flex items-center mb-4">
        <span className="text-[#A855F7] text-[18px] mr-2">🤖</span>
        <h2 className="text-[#111827] text-[15px] font-semibold">AI Financial Insights</h2>
      </div>
      
      <div>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div 
              key={index} 
              className={`${insight.bgColor} rounded-[12px] flex items-center transition-all duration-300 ease-in-out shadow-md ${
                insight.priority === 'high' ? 'insight-highlight' : ''
              }`}
              style={{ 
                padding: '8px 16px 10px 16px',
                marginTop: index > 0 ? '0.75rem' : '0',
                transform: getInsightTransform(insight),
                transition: 'all 0.3s ease',
                border: `1.5px solid ${getInsightDarkerColor(insight.insightCategory)}`
              }}
            >
                          {/* Icon in circle */}
            <span 
              className="flex items-center justify-center insight-card-icon"
              style={{
                borderRadius: '50%',
                background: getInsightDarkerColor(insight.insightCategory),
                color: '#fff', fontSize: 20
              }}
            >
              {insight.icon}
            </span>
                              <div className="insight-card-content">
                  <p className={`${insight.textColor} text-[15px] ${insight.hasButton ? 'insight-card-text' : ''} ${getInsightFontWeight(insight)}`}>
                    {insight.message}
                  </p>
                  <div className="flex justify-between items-end">
                    {insight.hasButton && (
                      <button 
                        onClick={() => handleGetTips(insight)}
                        className="px-5 py-2.5 text-[13px] font-medium rounded-[8px] border-[1px] transition-all duration-200 ease-in-out shadow-sm"
                        style={{
                          background: getInsightDarkerColor(insight.insightCategory),
                          borderColor: getInsightDarkerColor(insight.insightCategory),
                          color: '#fff'
                        }}
                      >
                        {insight.buttonText || ''}
                      </button>
                    )}
                    <span 
                      className="insight-card-badge"
                      style={{
                        background: getInsightDarkerColor(insight.insightCategory),
                        borderColor: getInsightDarkerColor(insight.insightCategory),
                        color: '#fff'
                      }}
                    >
                      {insight.insightCategory ? insight.insightCategory.charAt(0).toUpperCase() + insight.insightCategory.slice(1) : 'Insight'}
                    </span>
                  </div>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No insights available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
} 