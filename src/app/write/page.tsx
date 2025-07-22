'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WriteLetter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
        <div className="text-rose-600 text-lg font-playfair">Loading...</div>
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
          <div className="text-6xl mb-6">💌</div>
          <h1 className="text-3xl font-playfair text-rose-800 mb-4">
            Letter Sent!
          </h1>
          <p className="text-rose-600 font-inter mb-4">
            Your words of love are on their way...
          </p>
          <p className="text-sm text-rose-500 font-inter">
            Returning to main page in a moment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-rose-600 hover:text-rose-800 transition-colors">
            ← Back to main
          </Link>
          <h1 className="text-4xl font-playfair text-rose-800 mb-2">
            Write a Letter
          </h1>
          <p className="text-rose-600 font-inter">
            Pour your heart into words that will travel across distance
          </p>
        </div>

        {/* Writing Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-rose-100">
          <form onSubmit={sendMessage} className="space-y-6">
            <div>
              <label className="block text-lg font-playfair text-rose-800 mb-4">
                Dear {session?.user?.name}'s beloved,
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write from your heart... Share your thoughts, dreams, daily moments, or simply how much they mean to you. This letter will arrive in 5 seconds, making the anticipation all the more special."
                className="w-full h-64 px-6 py-4 rounded-xl border-2 border-rose-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 bg-white/90 text-rose-900 placeholder-rose-400 resize-none font-inter text-lg leading-relaxed"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-rose-500 font-inter">
                  {message.length} characters
                </span>
                <span className="text-sm text-rose-500 font-inter">
                  Encourage longer, thoughtful messages 💭
                </span>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-rose-600 font-inter">
                ⏰ This letter will arrive in 5 seconds
              </p>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-inter"
              >
                {loading ? 'Sending with love...' : 'Send Letter 💕'}
              </button>
            </div>
          </form>
        </div>

        {/* Inspiration */}
        <div className="mt-8 text-center">
          <p className="text-rose-500 font-inter italic">
            "The real lover is the man who can thrill you by kissing your forehead<br />
            or smiling into your eyes or just staring into space."
            <br />
            <span className="text-sm">— Marilyn Monroe</span>
          </p>
        </div>
      </div>
    </div>
  )
}