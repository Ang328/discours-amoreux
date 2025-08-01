'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10">
          <div className="text-center mb-10">
            <h1 className="elegant-title mb-4" style={{ fontSize: '2.5rem' }}>
              Welcome
            </h1>
            <p className="elegant-subtitle">
              Return to your correspondence
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block elegant-small mb-3">
                Email Address
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
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block elegant-small mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-black/10 border-2 border-stone-400/30 focus:border-rose-300 text-stone-100 placeholder-stone-400 backdrop-blur-sm transition-all duration-300 elegant-body"
                style={{ 
                  backgroundColor: 'rgba(26, 58, 43, 0.1)',
                  fontFamily: 'Optima, sans-serif'
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-300 text-center bg-rose-900/20 p-4 border border-rose-300/30 elegant-small">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full elegant-button elegant-shimmer"
              style={{ padding: '1rem 2rem' }}
            >
              {loading ? 'Signing in...' : 'Enter'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="elegant-small">
              New to correspondence?{' '}
              <Link href="/register" className="text-rose-300 hover:text-rose-200 underline transition-colors">
                Begin here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}