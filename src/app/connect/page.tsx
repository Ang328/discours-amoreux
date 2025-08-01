'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FoundUser {
  id: string
  name: string
  email: string
  city: string
  country: string
}

export default function ConnectPartner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const searchUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')
    setFoundUser(null)

    try {
      const res = await fetch(`/api/partner/search?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (res.ok) {
        setFoundUser(data.user)
      } else {
        setError(data.error || 'User search failed')
      }
    } catch (error) {
      setError('Failed to search for user')
    } finally {
      setLoading(false)
    }
  }

  const connectPartner = async () => {
    if (!foundUser) return

    setConnecting(true)
    setError('')

    try {
      const res = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerEmail: foundUser.email
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Connection failed')
      }
    } catch (error) {
      setError('Failed to connect partner')
    } finally {
      setConnecting(false)
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
            Connected!
          </h1>
          <p className="elegant-body mb-4">
            You are now connected with {foundUser?.name}
          </p>
          <p className="elegant-small">
            Returning to main page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 elegant-small text-stone-300 hover:text-rose-300 transition-colors">
            ← Return to main
          </Link>
          <h1 className="elegant-title mb-4">
            Connect with Your Beloved
          </h1>
          <p className="elegant-subtitle">
            Enter your partner's email address to create your connection
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Search Form */}
        <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10 mb-8">
          <form onSubmit={searchUser} className="space-y-6">
            <div>
              <label className="block elegant-small mb-3">
                Partner's Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-black/10 border-2 border-stone-400/30 focus:border-rose-300 text-stone-100 placeholder-stone-400 backdrop-blur-sm transition-all duration-300 elegant-body"
                style={{ 
                  backgroundColor: 'rgba(26, 58, 43, 0.1)',
                  fontFamily: 'Optima, sans-serif'
                }}
                placeholder="their.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full elegant-button elegant-shimmer"
            >
              {loading ? 'Searching...' : 'Find Partner'}
            </button>
          </form>
        </div>

        {/* Found User */}
        {foundUser && (
          <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10 mb-8">
            <h2 className="elegant-subtitle mb-6">Found User</h2>
            <div className="space-y-4">
              <div>
                <span className="elegant-small">Name:</span>
                <p className="elegant-body">{foundUser.name}</p>
              </div>
              <div>
                <span className="elegant-small">Email:</span>
                <p className="elegant-body">{foundUser.email}</p>
              </div>
              <div>
                <span className="elegant-small">Location:</span>
                <p className="elegant-body">{foundUser.city}, {foundUser.country}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={connectPartner}
                disabled={connecting}
                className="elegant-button elegant-shimmer flex-1"
              >
                {connecting ? 'Connecting...' : 'Connect as Partners'}
              </button>
              <button
                onClick={() => {
                  setFoundUser(null)
                  setEmail('')
                }}
                className="elegant-button elegant-button-secondary flex-1"
              >
                Search Again
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-rose-300 text-center bg-rose-900/20 p-4 border border-rose-300/30 elegant-small mb-8">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center max-w-xl mx-auto">
          <p className="elegant-small">
            Ask your beloved to create an account and share their email address with you. 
            Once connected, you'll be able to send letters and share photos across the distance.
          </p>
        </div>
      </div>
    </div>
  )
}