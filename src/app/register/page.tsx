'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (res.ok) {
        router.push('/login?message=Account created successfully')
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-rose-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair text-rose-800 mb-2">
              Créer un compte
            </h1>
            <p className="text-rose-600 font-inter">
              Begin your correspondence journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/80 text-rose-900 placeholder-rose-400"
                placeholder="Your beautiful name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/80 text-rose-900 placeholder-rose-400"
                placeholder="mon.amour@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/80 text-rose-900 placeholder-rose-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating account...' : 'Créer un compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-rose-600">
              Already have an account?{' '}
              <Link href="/login" className="text-rose-800 hover:text-rose-900 font-medium underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}