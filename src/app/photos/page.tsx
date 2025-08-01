'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SharePhoto() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  const sendPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) return

    setLoading(true)
    setError('')

    try {
      const imageUrl = await uploadImage(selectedImage)
      
      if (!imageUrl) {
        setError('Failed to upload image')
        return
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '',
          imageUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSelectedImage(null)
        setImagePreview(null)
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Failed to send photo')
      }
    } catch (error) {
      setError('Failed to send photo')
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
          <div className="text-6xl mb-6">📸</div>
          <h1 className="text-3xl font-playfair text-rose-800 mb-4">
            Photo Sent!
          </h1>
          <p className="text-rose-600 font-inter mb-4">
            Your memory is on its way to your beloved...
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 elegant-small text-stone-300 hover:text-rose-300 transition-colors">
            ← Return to main
          </Link>
          <h1 className="elegant-title mb-4">
            Share a Memory
          </h1>
          <p className="elegant-subtitle">
            Send a photograph to bridge the distance between hearts
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Photo Upload Form */}
        <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10">
          <form onSubmit={sendPhoto} className="space-y-8">
            <div className="text-center">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-stone-400/50 hover:border-rose-300/70 bg-black/10 hover:bg-rose-900/10 transition-all duration-300 cursor-pointer group"
                  style={{ backgroundColor: 'rgba(45, 74, 62, 0.05)' }}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                        <p className="elegant-body text-stone-100 bg-black/60 px-6 py-3 backdrop-blur-sm">
                          Click to change photograph
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 mx-auto mb-6 border border-stone-400/30 flex items-center justify-center">
                        <div className="w-8 h-8 border border-stone-400/50"></div>
                      </div>
                      <p className="elegant-body text-stone-200 mb-3">
                        Select a photograph
                      </p>
                      <p className="elegant-small text-stone-400">
                        Share a moment, a smile, or a view from your world
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="text-rose-300 text-center bg-rose-900/20 p-4 border border-rose-300/30 elegant-small">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="elegant-small text-stone-400">
                This photograph will arrive in 5 seconds
              </p>
              <button
                type="submit"
                disabled={loading || !selectedImage}
                className="elegant-button elegant-button-secondary elegant-shimmer"
              >
                {loading ? 'Sending memory...' : 'Send Photograph'}
              </button>
            </div>
          </form>
        </div>

        {/* Inspiration */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <blockquote className="elegant-body text-center" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>
            "A picture is worth a thousand words, but a memory shared is worth a thousand pictures."
          </blockquote>
        </div>
      </div>
    </div>
  )
}