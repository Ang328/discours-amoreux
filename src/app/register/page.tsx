'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LocationOption {
  city: string
  country: string
  timezone: string
  latitude: number
  longitude: number
}

const locationOptions: LocationOption[] = [
  { city: 'New York', country: 'United States', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.0060 },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 48.8566, longitude: 2.3522 },
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 },
  { city: 'Barcelona', country: 'Spain', timezone: 'Europe/Madrid', latitude: 41.3851, longitude: 2.1734 },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', latitude: 41.9028, longitude: 12.4964 },
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null)
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
          location: selectedLocation,
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
        <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10">
          <div className="text-center mb-10">
            <h1 className="elegant-title mb-4" style={{ fontSize: '2.5rem' }}>
              Begin
            </h1>
            <p className="elegant-subtitle">
              Create your correspondence account
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block elegant-small mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-black/10 border-2 border-stone-400/30 focus:border-rose-300 text-stone-100 placeholder-stone-400 backdrop-blur-sm transition-all duration-300 elegant-body"
                style={{ 
                  backgroundColor: 'rgba(26, 58, 43, 0.1)',
                  fontFamily: 'Optima, sans-serif'
                }}
                placeholder="How shall we address you?"
                required
              />
            </div>

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

            <div>
              <label className="block elegant-small mb-3">
                Your Location
              </label>
              <select
                value={selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : ''}
                onChange={(e) => {
                  const location = locationOptions.find(loc => `${loc.city}, ${loc.country}` === e.target.value)
                  setSelectedLocation(location || null)
                }}
                className="w-full px-4 py-4 bg-black/10 border-2 border-stone-400/30 focus:border-rose-300 text-stone-100 backdrop-blur-sm transition-all duration-300 elegant-body"
                style={{ 
                  backgroundColor: 'rgba(26, 58, 43, 0.1)',
                  fontFamily: 'Optima, sans-serif'
                }}
                required
              >
                <option value="" style={{ color: '#000' }}>Select your city...</option>
                {locationOptions.map((location) => (
                  <option 
                    key={`${location.city}-${location.country}`} 
                    value={`${location.city}, ${location.country}`}
                    style={{ color: '#000' }}
                  >
                    {location.city}, {location.country}
                  </option>
                ))}
              </select>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="elegant-small">
              Already writing letters?{' '}
              <Link href="/login" className="text-rose-300 hover:text-rose-200 underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}