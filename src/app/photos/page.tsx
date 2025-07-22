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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-rose-600 hover:text-rose-800 transition-colors">
            ← Back to main
          </Link>
          <h1 className="text-4xl font-playfair text-rose-800 mb-2">
            Share a Memory
          </h1>
          <p className="text-rose-600 font-inter">
            Send a photograph to bridge the distance between your hearts
          </p>
        </div>

        {/* Photo Upload Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-rose-100">
          <form onSubmit={sendPhoto} className="space-y-6">
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
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-rose-300 rounded-xl bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <p className="text-white font-inter bg-black/50 px-4 py-2 rounded-lg">
                          Click to change photo
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-6xl text-rose-400 mb-4">📸</div>
                      <p className="text-rose-600 font-inter text-lg mb-2">
                        Click to select a photo
                      </p>
                      <p className="text-rose-500 font-inter text-sm">
                        Share a moment, a smile, or a view from your world
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-rose-600 font-inter">
                ⏰ This photo will arrive in 5 seconds
              </p>
              <button
                type="submit"
                disabled={loading || !selectedImage}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-inter"
              >
                {loading ? 'Sending memory...' : 'Send Photo 📸'}
              </button>
            </div>
          </form>
        </div>

        {/* Inspiration */}
        <div className="mt-8 text-center">
          <p className="text-rose-500 font-inter italic">
            "A picture is worth a thousand words,<br />
            but a memory shared is worth a thousand pictures."
          </p>
        </div>
      </div>
    </div>
  )
}