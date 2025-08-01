'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface PendingMessage {
  id: string
  content: string
  imageUrl?: string
  scheduledAt: string
  sender: {
    id: string
    name: string
    email: string
  }
}

interface UnlockedMessage extends PendingMessage {
  isDelivered: boolean
  deliveredAt?: string
}

interface WeatherInfo {
  temperature: number
  description: string
  icon: string
  localTime: string
  city: string
  country: string
  name: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phrases, setPhrases] = useState<string[]>([])
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])
  const [nextMessage, setNextMessage] = useState<PendingMessage | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [unlockedMessage, setUnlockedMessage] = useState<UnlockedMessage | null>(null)
  const [userWeather, setUserWeather] = useState<WeatherInfo | null>(null)
  const [partnerWeather, setPartnerWeather] = useState<WeatherInfo | null>(null)
  const [greeting, setGreeting] = useState<string>('Discours Amoureux')
  const [hasPartner, setHasPartner] = useState<boolean | null>(null)

  // Don't auto-redirect to messages anymore

  // Fetch pending messages, common phrases, and weather info
  useEffect(() => {
    if (session) {
      fetchPendingMessages()
      fetchCommonPhrases()
      fetchWeatherInfo()
      // Refresh pending messages every 30 seconds
      const interval = setInterval(fetchPendingMessages, 30000)
      // Refresh weather info every 5 minutes
      const weatherInterval = setInterval(fetchWeatherInfo, 5 * 60 * 1000)
      return () => {
        clearInterval(interval)
        clearInterval(weatherInterval)
      }
    }
  }, [session])

  // Update countdown timer every second
  useEffect(() => {
    if (nextMessage) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const scheduledTime = new Date(nextMessage.scheduledAt).getTime()
        const remaining = Math.max(0, scheduledTime - now)

        setTimeRemaining(remaining)

        // If message is ready, refresh pending messages
        if (remaining === 0) {
          fetchPendingMessages()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [nextMessage])

  // Rotate phrases every 4 seconds (when no pending messages)
  useEffect(() => {
    if (phrases.length > 0 && !nextMessage) {
      const interval = setInterval(() => {
        setCurrentPhrase(prev => (prev + 1) % phrases.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [phrases, nextMessage])

  const fetchPendingMessages = async () => {
    try {
      const res = await fetch('/api/messages/pending')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched pending messages:', data.pendingMessages?.length || 0)
        setPendingMessages(data.pendingMessages)
        // Set the next message to be delivered
        if (data.pendingMessages.length > 0) {
          setNextMessage(data.pendingMessages[0])
        } else {
          setNextMessage(null)
        }
      } else {
        console.error('Failed to fetch pending messages:', res.status)
      }
    } catch (error) {
      console.error('Failed to fetch pending messages:', error)
    }
  }

  const fetchCommonPhrases = async () => {
    try {
      const res = await fetch('/api/common-phrases')
      if (res.ok) {
        const data = await res.json()
        setPhrases(data.phrases)
      }
    } catch (error) {
      console.error('Failed to fetch phrases:', error)
    }
  }

  const fetchWeatherInfo = async () => {
    try {
      const res = await fetch('/api/user/weather-info')
      if (res.ok) {
        const data = await res.json()
        setUserWeather(data.user)
        setPartnerWeather(data.partner)
        setGreeting(data.greeting)
        setHasPartner(!!data.partner)
      } else {
        // If 404 or other error, user might not have partner
        setHasPartner(false)
      }
    } catch (error) {
      console.error('Failed to fetch weather info:', error)
      setHasPartner(false)
    }
  }

  const handleUnlockMessage = async () => {
    if (!nextMessage || timeRemaining > 0) return

    try {
      const res = await fetch('/api/messages/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: nextMessage.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setUnlockedMessage(data.message)
        setShowMessageModal(true)
        // refresh pending messages to remove this one
        fetchPendingMessages()
      }
    } catch (error) {
      console.error('Failed to unlock message:', error)
    }
  }

  const formatTimeRemaining = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600 text-lg font-playfair">Loading...</div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen relative px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="elegant-title elegant-glow mb-6">
              {greeting},  {session?.user?.name}
            </h1>
            {/* <p className="elegant-subtitle mb-4">
              Welcome back, {session?.user?.name}
            </p> */}
            {partnerWeather && (
              <h2 className="elegant-small mb-4">
                It's {partnerWeather.localTime} in {partnerWeather.city}, and it's {partnerWeather.description} {partnerWeather.icon}
              </h2>
            )}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto"></div>
          </div>

          {/* Action Buttons */}
          {hasPartner === false ? (
            // Show connect partner option if no partner
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10 mb-8">
                <h2 className="elegant-subtitle mb-4">Connect with Your Beloved</h2>
                <p className="elegant-body mb-6">
                  To start your correspondence journey, you need to connect with your partner first.
                </p>
                <Link
                  href="/connect"
                  className="elegant-button elegant-shimmer inline-block"
                >
                  Find & Connect Partner
                </Link>
              </div>
            </div>
          ) : hasPartner === true ? (
            // Show normal options if has partner
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <Link
                href="/write"
                className="elegant-button elegant-shimmer block text-center"
              >
                Write a Letter
              </Link>

              <Link
                href="/photos"
                className="elegant-button elegant-button-secondary elegant-shimmer block text-center"
              >
                Share a Memory
              </Link>

              <Link
                href="/archive"
                className="elegant-button elegant-shimmer block text-center"
              >
                View Archive
              </Link>
            </div>
          ) : (
            // Loading state
            <div className="text-center mb-16">
              <div className="elegant-body">Loading...</div>
            </div>
          )}

          {/* Connection Info and Logout */}
          <div className="text-center mb-12">
            <div className="elegant-small mb-6">
              Connected • Delay: 5 seconds • Last sync: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="elegant-button elegant-button-secondary elegant-shimmer"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Notification Marquee or Scrolling Messages */}
        <div className="fixed bottom-0 left-0 right-0 marquee-container py-4">
          {nextMessage ? (
            <div
              className={`elegant-body ${timeRemaining === 0 ? 'scrolling-marquee cursor-pointer hover:text-rose-200' : 'text-center px-4'}`}
              style={{ color: 'var(--elegant-accent)' }}
              onClick={timeRemaining === 0 ? handleUnlockMessage : undefined}
            >
              {timeRemaining > 0 ? (
                <>The message will be ready in {formatTimeRemaining(timeRemaining)}</>
              ) : (
                <>💌 Your message from {nextMessage.sender.name} is ready! Click to unlock • 💌 Your message from {nextMessage.sender.name} is ready! Click to unlock • 💌 Your message from {nextMessage.sender.name} is ready! Click to unlock</>
              )}
            </div>
          ) : phrases.length > 0 ? (
            <div className="scrolling-marquee elegant-body" style={{ color: 'var(--elegant-accent)' }}>
              {phrases.join(' • ')} • {phrases.join(' • ')} • {phrases.join(' • ')}
            </div>
          ) : (
            <div className="text-center elegant-small" style={{ color: 'var(--elegant-accent)' }}>
              Debug: nextMessage={nextMessage ? 'exists' : 'null'}, pendingMessages={pendingMessages.length}, phrases={phrases.length}
            </div>
          )}
        </div>

        {/* Message Modal */}
        {showMessageModal && unlockedMessage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10 elegant-shimmer">
              <div className="text-center mb-8">
                <h2 className="elegant-title mb-4" style={{ fontSize: '2rem' }}>
                  New Message
                </h2>
                <p className="elegant-subtitle">
                  From your beloved, {unlockedMessage.sender.name}
                </p>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-4"></div>
              </div>

              {unlockedMessage.imageUrl ? (
                <div className="mb-8 relative w-full h-96">
                  <Image
                    src={unlockedMessage.imageUrl}
                    alt="Shared memory"
                    fill
                    className="object-contain rounded-lg border border-stone-400/30"
                  />
                </div>
              ) : (
                <div className="mb-8">
                  <div className="elegant-small mb-4">My dearest,</div>
                  <div
                    className="relative text-stone-100 whitespace-pre-wrap py-6"
                    style={{
                      fontFamily: 'Optima, sans-serif',
                      fontSize: '1.1rem',
                      lineHeight: '2.2rem',
                      minHeight: '200px',
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 2.1rem, rgba(193, 154, 154, 0.2) 2.1rem, rgba(193, 154, 154, 0.2) 2.2rem)',
                      paddingTop: '0.6rem'
                    }}
                  >
                    {unlockedMessage.content}
                  </div>
                  <div className="text-right elegant-small mt-4">
                    With all my love,<br />
                    {unlockedMessage.sender.name}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="elegant-small">
                  Delivered: {new Date(unlockedMessage.deliveredAt || unlockedMessage.scheduledAt).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    setShowMessageModal(false)
                    setUnlockedMessage(null)
                  }}
                  className="elegant-button elegant-shimmer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl text-center">
        {/* Main Title - Eve Babitz book cover style */}
        <div className="mb-16">
          <h1 className="elegant-title elegant-glow mb-8" style={{ fontSize: '5rem' }}>
            Discours<br />Amoureux
          </h1>
          <p className="elegant-subtitle mb-8">
            Letters of love across distance and time
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto"></div>
        </div>

        {/* Quote */}
        <div className="mb-16 max-w-2xl mx-auto">
          <blockquote className="elegant-body text-center mb-4" style={{ fontSize: '1.4rem', fontStyle: 'italic' }}>
            "L'amour, c'est l'espace et le temps rendus sensibles au cœur."
          </blockquote>
          <cite className="elegant-small block">
            — Marcel Proust
          </cite>
        </div>

        {/* Features in elegant prose */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="elegant-body text-center space-y-3" style={{ fontSize: '1.2rem' }}>
            <p>Send letters that arrive with the weight of anticipation.</p>
            <p>Share photographs that bridge the miles between hearts.</p>
            <p>Preserve your correspondence in an archive of intimate moments.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link
            href="/register"
            className="elegant-button elegant-shimmer"
          >
            Begin Correspondence
          </Link>
        </div>

        {/* Subtle footer */}
        <div className="elegant-small opacity-60">
          A space for lovers separated by distance, by Ang
        </div>
      </div>
    </div>
  )
}