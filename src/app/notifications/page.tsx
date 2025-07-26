'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface Notification {
  _id: string
  message: string
  type: 'warning' | 'suggestion' | 'celebration' | 'overspending' | 'budget_alert' | 'savings_goal' | 'spending_pattern' | 'bill_reminder'
  severity: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: string
  data?: any
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getNotificationStyle = (type: string, severity: string) => {
    // Success/celebration styles
    if (type === 'celebration' || type === 'savings_goal' || type === 'budget_alert') {
      return {
        container: 'bg-[#f0fdf4]',
        icon: 'text-[#22c55e]',
        iconClass: getIconClass(type)
      }
    }
    
    // Warning styles
    if (type === 'warning' || type === 'bill_reminder' || severity === 'medium') {
      return {
        container: 'bg-[#fefce8]',
        icon: 'text-[#facc15]',
        iconClass: getIconClass(type)
      }
    }
    
    // Error/high severity styles
    if (type === 'overspending' || severity === 'high') {
      return {
        container: 'bg-[#fef2f2]',
        icon: 'text-[#ef4444]',
        iconClass: getIconClass(type)
      }
    }
    
    // Default success
    return {
      container: 'bg-[#f0fdf4]',
      icon: 'text-[#22c55e]',
      iconClass: 'fas fa-info-circle'
    }
  }

  const getIconClass = (type: string) => {
    switch (type) {
      case 'celebration':
      case 'savings_goal':
        return 'fas fa-check-circle'
      case 'warning':
      case 'bill_reminder':
        return 'fas fa-exclamation-triangle'
      case 'overspending':
        return 'fas fa-exclamation-circle'
      case 'spending_pattern':
        return 'fas fa-chart-line'
      case 'budget_alert':
        return 'fas fa-bullseye'
      default:
        return 'fas fa-info-circle'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    } else {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
    }
  }

  const style = getNotificationStyle(notification.type, notification.severity)

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id)
    }
  }

  return (
    <div 
      className={`flex items-start ${style.container} p-4 rounded-[8px] cursor-pointer transition-opacity ${!notification.isRead ? 'opacity-100' : 'opacity-75'}`}
      onClick={handleClick}
    >
      <div className={`${style.icon} text-lg mr-4`}>
        <i className={style.iconClass}></i>
      </div>
      <div className="flex-1">
        <p className={`text-[#000000] font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
          {notification.message}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-[#6b7280] text-sm">
          {formatTimeAgo(notification.createdAt)}
        </p>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('stash-ai-user')
    if (!user) {
      router.push('/')
      return
    }

    fetchNotifications()
  }, [router])

  const applyFilters = useCallback((notifications: Notification[]) => {
    let filtered = notifications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply read/unread filter
    if (filterType === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead)
    } else if (filterType === 'read') {
      filtered = filtered.filter(notification => notification.isRead)
    }

    setFilteredNotifications(filtered)
  }, [searchTerm, filterType])

  useEffect(() => {
    applyFilters(notifications)
  }, [notifications, searchTerm, filterType, applyFilters])

  const fetchNotifications = async () => {
    try {
      const user = localStorage.getItem('stash-ai-user')
      if (!user) return

      const response = await apiClient.getNudges(user)
      if (response.success && response.data) {
        const data = response.data as { nudges: Notification[]; unreadCount: number }
        setNotifications(data.nudges || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await apiClient.markNudgeAsRead(notificationId)
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const user = localStorage.getItem('stash-ai-user')
      if (!user) return

      const response = await apiClient.markAllNudgesAsRead(user)
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#ffffff] min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#ffffff] min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[#000000] text-2xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[#6b7280] text-sm mt-1">
                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`text-sm font-medium ${
              unreadCount > 0
                ? 'text-[#007bff] hover:text-[#0056b3] cursor-pointer'
                : 'text-[#6b7280] cursor-not-allowed'
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'read'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="fas fa-bell-slash"></i>
              </div>
              <p className="text-[#6b7280] text-lg">
                {notifications.length === 0
                  ? 'No notifications yet'
                  : 'No notifications match your filters'}
              </p>
              <p className="text-[#6b7280] text-sm mt-2">
                {notifications.length === 0
                  ? 'We\'ll notify you about important financial insights and spending patterns.'
                  : 'Try adjusting your search or filter settings.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#007bff] hover:text-[#0056b3] font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
} 