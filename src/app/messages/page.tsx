'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  imageUrl?: string
  scheduledAt: string
  deliveredAt?: string
  isDelivered: boolean
  sender: {
    id: string
    name: string
    email: string
  }
  receiver: {
    id: string
    name: string
    email: string
  }
}

export default function Messages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [hasPartner, setHasPartner] = useState(false)
  const [partnerInfo, setPartnerInfo] = useState<{ name: string; email: string } | null>(null)
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isCountingDown, setIsCountingDown] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMessages()
      checkPartnerStatus()
      checkPendingMessages()
      
      // Poll for pending messages every 2 seconds
      const interval = setInterval(() => {
        if (!isCountingDown) {
          checkPendingMessages()
        }
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [session, isCountingDown])

  const checkPartnerStatus = async () => {
    try {
      const res = await fetch('/api/user-info')
      if (res.ok) {
        const data = await res.json()
        const partnerExists = !!data.partner
        setHasPartner(partnerExists)
        setPartnerInfo(data.partner)
      } else {
        console.error('Failed to fetch user info:', res.status)
      }
    } catch (error) {
      console.error('Failed to check partner status:', error)
    }
  }

  const checkPendingMessages = async () => {
    try {
      const res = await fetch('/api/pending-messages')
      if (res.ok) {
        const data = await res.json()
        console.log('Pending messages response:', data) // Debug log
        setPendingCount(data.count)
      } else {
        console.error('Failed to fetch pending messages:', res.status)
      }
    } catch (error) {
      console.error('Failed to check pending messages:', error)
    }
  }

  const startCountdown = () => {
    console.log('Starting countdown, pending count:', pendingCount) // Debug log
    if (pendingCount === 0) return
    
    setShowCountdown(true)
    setIsCountingDown(true)
    setCountdown(5)
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        console.log('Countdown:', prev) // Debug log
        if (prev <= 1) {
          clearInterval(timer)
          setShowCountdown(false)
          setIsCountingDown(false)
          setPendingCount(0)
          console.log('Countdown finished, fetching messages') // Debug log
          fetchMessages() // Refresh messages when countdown ends
          return 5
        }
        return prev - 1
      })
    }, 1000)
  }

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...') // Debug log
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched messages:', data.messages.length) // Debug log
        setMessages(data.messages)
      } else {
        console.error('Failed to fetch messages:', res.status)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        return data.imageUrl
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
    return null
  }

  const connectPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/connect-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerEmail,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setHasPartner(true)
        setPartnerInfo(data.partner)
        setPartnerEmail('')
        setShowConnectForm(false)
        setError('')
      } else {
        setError(data.error || 'Failed to connect')
      }
    } catch (error) {
      setError('Failed to connect to partner')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedImage) return

    setLoading(true)
    setError('')

    try {
      let imageUrl = null
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          imageUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setNewMessage('')
        setSelectedImage(null)
        setImagePreview(null)
        setError('')
        fetchMessages()
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600 text-lg font-playfair">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative text-center mb-8">
          <h1 className="text-4xl font-playfair text-rose-800 mb-2">
            Discours Amoureux
          </h1>
          <p className="text-rose-600 font-inter">
            {hasPartner ? `Connected with ${partnerInfo?.name} 💕` : 'Connect with your lover to begin correspondence'}
          </p>
          
          {/* Action Icons */}
          {hasPartner && (
            <div className="absolute top-0 right-0 flex gap-2">
              {/* Back to Main Icon */}
              <button
                onClick={() => router.push('/')}
                className="p-3 rounded-full bg-white/80 hover:bg-white shadow-lg border border-rose-200 transition-all duration-200"
                title="Back to main"
              >
                <svg 
                  className="w-6 h-6 text-rose-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" 
                  />
                </svg>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={startCountdown}
                  className="relative p-3 rounded-full bg-white/80 hover:bg-white shadow-lg border border-rose-200 transition-all duration-200"
                  disabled={isCountingDown}
                  title={pendingCount > 0 ? `${pendingCount} message(s) waiting` : 'No pending messages'}
                >
                  {/* Notification Bell Icon */}
                  <svg 
                    className="w-6 h-6 text-rose-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                  
                  {/* Red dot notification */}
                  {pendingCount > 0 && !showCountdown && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {pendingCount}
                      </span>
                    </div>
                  )}
                  
                  {/* Countdown display */}
                  {showCountdown && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {countdown}
                      </span>
                    </div>
                  )}
                </button>
                
                {/* Loading animation during countdown */}
                {showCountdown && (
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin"></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!hasPartner && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-playfair text-amber-800 mb-2">
                Connect with your lover
              </h2>
              <p className="text-amber-700 font-inter">
                You need to connect with your partner before sending letters
              </p>
            </div>
            
            {!showConnectForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowConnectForm(true)}
                  className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Connect with Partner
                </button>
              </div>
            ) : (
              <form onSubmit={connectPartner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Your lover's email address
                  </label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-transparent bg-white/80 text-amber-900 placeholder-amber-400"
                    placeholder="their.email@example.com"
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectForm(false)
                      setPartnerEmail('')
                      setError('')
                    }}
                    className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-2xl ${
                message.sender.email === session?.user?.email
                  ? 'ml-auto bg-gradient-to-r from-rose-100 to-amber-100'
                  : 'mr-auto bg-white/80'
              } rounded-2xl p-6 shadow-lg border border-rose-200/50 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-playfair text-rose-800 text-lg">
                  {message.sender.email === session?.user?.email ? 'You' : message.sender.name}
                </div>
                <div className="text-sm text-rose-600">
                  {formatDate(message.scheduledAt)}
                </div>
              </div>
              
              {message.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={message.imageUrl}
                    alt="Shared memory"
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <p className="text-rose-900 leading-relaxed font-inter whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          ))}
        </div>

        {/* Compose Message */}
        {hasPartner && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-rose-100">
            <h2 className="text-2xl font-playfair text-rose-800 mb-4">
              Écrire une lettre à {partnerInfo?.name}
            </h2>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Pour mon amour..."
                  className="w-full h-32 px-4 py-3 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/80 text-rose-900 placeholder-rose-400 resize-none font-inter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-700 mb-2">
                  Attach a photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full text-rose-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-rose-600 font-inter">
                  ⏰ This letter will arrive in 5 seconds (testing mode)
                </p>
                <button
                  type="submit"
                  disabled={loading || (!newMessage.trim() && !selectedImage)}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Sending...' : 'Envoyer avec amour 💕'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}