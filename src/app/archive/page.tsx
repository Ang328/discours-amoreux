'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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

export default function Archive() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<'letters' | 'photos'>('letters')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMessages()
    }
  }, [session])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Only show messages FROM the partner (received messages, like keeping letters you received)
  const textMessages = messages.filter(msg => 
    msg.content && 
    msg.content.trim() && 
    msg.sender.email !== session?.user?.email
  )
  const photoMessages = messages.filter(msg => 
    msg.imageUrl && 
    msg.sender.email !== session?.user?.email
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="elegant-body">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 elegant-small text-stone-300 hover:text-rose-300 transition-colors">
            ← Return to main
          </Link>
          <h1 className="elegant-title mb-4">
            Our Archive
          </h1>
          <p className="elegant-subtitle">
            A collection of your love across distance and time
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-2">
            <button
              onClick={() => setActiveTab('letters')}
              className={`px-8 py-3 elegant-small transition-all duration-200 ${
                activeTab === 'letters'
                  ? 'bg-rose-300/20 text-rose-200 border-b-2 border-rose-300'
                  : 'text-stone-300 hover:text-rose-300'
              }`}
            >
              Letters ({textMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 elegant-small transition-all duration-200 ${
                activeTab === 'photos'
                  ? 'bg-rose-300/20 text-rose-200 border-b-2 border-rose-300'
                  : 'text-stone-300 hover:text-rose-300'
              }`}
            >
              Photos ({photoMessages.length})
            </button>
          </div>
        </div>

        {/* Letters Archive */}
        {activeTab === 'letters' && (
          <div className="space-y-6">
            {textMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 border border-stone-400/30 flex items-center justify-center">
                  <div className="w-8 h-8 border border-stone-400/50"></div>
                </div>
                <p className="elegant-body mb-4">
                  No letters from your beloved yet
                </p>
                <p className="elegant-small">
                  Letters you receive will appear here like treasured keepsakes
                </p>
              </div>
            ) : (
              textMessages.map((message) => (
                <div
                  key={message.id}
                  className="relative max-w-4xl mx-auto mb-12"
                >
                  {/* Letter Container */}
                  <div className="bg-black/20 backdrop-blur-xl border border-stone-400/30 p-10 transform hover:scale-105 transition-transform duration-300 relative"
                    style={{
                      backgroundColor: 'rgba(26, 58, 43, 0.1)'
                    }}
                  >
                    
                    {/* Letter Content */}
                    <div className="relative">
                      {/* Date and sender header */}
                      <div className="text-center mb-8 pb-4 border-b border-stone-400/30">
                        <p className="elegant-small mb-1">
                          {formatDate(message.scheduledAt)}
                        </p>
                        <p className="elegant-body">
                          From your beloved, {message.sender.name}
                        </p>
                      </div>
                      
                      {/* Letter salutation */}
                      <div className="mb-6">
                        <p className="elegant-body">
                          My dearest,
                        </p>
                      </div>
                      
                      {/* Letter body - notebook style with horizontal lines */}
                      <div className="mb-8 relative">
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
                          {message.content}
                        </div>
                      </div>
                      
                      {/* Letter closing */}
                      <div className="text-right">
                        <p className="elegant-body mb-2">
                          With all my love,
                        </p>
                        <p className="elegant-body" style={{ fontFamily: 'Athena, EB Garamond, serif' }}>
                          {message.sender.name}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Photos Gallery */}
        {activeTab === 'photos' && (
          <div>
            {photoMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 border border-stone-400/30 flex items-center justify-center">
                  <div className="w-8 h-8 border border-stone-400/50"></div>
                </div>
                <p className="elegant-body mb-4">
                  No photos from your beloved yet
                </p>
                <p className="elegant-small">
                  Photos you receive will create a beautiful gallery of shared memories
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {photoMessages.map((message) => (
                  <div
                    key={message.id}
                    className="group relative aspect-square bg-black/20 backdrop-blur-xl border border-stone-400/30 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPhoto(message.imageUrl!)}
                  >
                    <Image
                      src={message.imageUrl!}
                      alt="Shared memory"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-stone-100 elegant-small">
                          From {message.sender.name}
                        </p>
                        <p className="text-stone-300 elegant-small">
                          {formatDateShort(message.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={selectedPhoto}
                alt="Full size memory"
                width={800}
                height={600}
                className="object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/30 border border-stone-400/30 backdrop-blur-xl flex items-center justify-center text-stone-100 elegant-small transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}