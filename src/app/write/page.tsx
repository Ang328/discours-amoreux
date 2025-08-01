'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Partner {
  id: string
  name: string
  email: string
}

export default function WriteLetter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [partner, setPartner] = useState<Partner | null>(null)

  useEffect(() => {
    if (session) {
      fetchPartner()
    }
  }, [session])

  const fetchPartner = async () => {
    try {
      const res = await fetch('/api/user/partner')
      if (res.ok) {
        const data = await res.json()
        setPartner(data.partner)
      }
    } catch (error) {
      console.error('Failed to fetch partner:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('')
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="elegant-body">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 border border-stone-400/30 flex items-center justify-center">
            <div className="w-8 h-8 border border-stone-400/50"></div>
          </div>
          <h1 className="elegant-title mb-4" style={{ fontSize: '2.5rem' }}>
            Letter Sent
          </h1>
          <p className="elegant-body mb-4">
            Your words of love are on their way...
          </p>
          <p className="elegant-small">
            Returning to main page in a moment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 elegant-small text-stone-300 hover:text-rose-300 transition-colors">
            ← Return to main
          </Link>
          <h1 className="elegant-title mb-4">
            Write a Letter
          </h1>
          <p className="elegant-subtitle">
            Pour your heart into words that will travel across distance
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Writing Form */}
        <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10">
          <form onSubmit={sendMessage} className="space-y-8">
            <div>
              <label className="block elegant-body mb-4">
                Dear {partner?.name || 'my beloved'},
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write from your heart... Share your thoughts, dreams, daily moments, or simply how much they mean to you. This letter will arrive in 15 seconds, making the anticipation all the more special."
                className="w-full h-80 px-6 py-4 bg-black/10 border-2 border-stone-400/30 focus:border-rose-300 text-stone-100 placeholder-stone-400 backdrop-blur-sm transition-all duration-300 elegant-body resize-none"
                style={{ 
                  backgroundColor: 'rgba(26, 58, 43, 0.1)',
                  fontFamily: 'Optima, sans-serif'
                }}
                required
              />
              <div className="flex justify-between items-center mt-3">
                <span className="elegant-small">
                  {message.length} characters
                </span>
                <span className="elegant-small">
                  Encourage longer, thoughtful messages
                </span>
              </div>
            </div>

            {error && (
              <div className="text-rose-300 text-center bg-rose-900/20 p-4 border border-rose-300/30 elegant-small">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="elegant-small text-stone-400">
                This letter will arrive in 15 seconds
              </p>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="elegant-button elegant-shimmer"
              >
                {loading ? 'Sending with love...' : 'Send Letter'}
              </button>
            </div>
          </form>
        </div>

        {/* Inspiration */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <blockquote className="elegant-body text-center" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>
            "The real lover is the man who can thrill you by kissing your forehead or smiling into your eyes or just staring into space."
          </blockquote>
          <cite className="elegant-small block mt-4">
            — Marilyn Monroe
          </cite>
        </div>
      </div>
    </div>
  )
}