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
        <div className="text-rose-600 text-lg font-playfair">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-rose-600 hover:text-rose-800 transition-colors">
            ← Back to main
          </Link>
          <h1 className="text-4xl font-playfair text-rose-800 mb-2">
            Our Archive
          </h1>
          <p className="text-rose-600 font-inter">
            A collection of your love across distance and time
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 rounded-full p-2 shadow-lg border border-rose-200">
            <button
              onClick={() => setActiveTab('letters')}
              className={`px-8 py-3 rounded-full font-inter transition-all duration-200 ${
                activeTab === 'letters'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              📝 Letters ({textMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 rounded-full font-inter transition-all duration-200 ${
                activeTab === 'photos'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              📸 Photos ({photoMessages.length})
            </button>
          </div>
        </div>

        {/* Letters Archive */}
        {activeTab === 'letters' && (
          <div className="space-y-6">
            {textMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-rose-600 font-inter text-lg mb-4">
                  No letters from your beloved yet
                </p>
                <p className="text-rose-500 font-inter text-sm">
                  Letters you receive will appear here like treasured keepsakes
                </p>
              </div>
            ) : (
              textMessages.map((message) => (
                <div
                  key={message.id}
                  className="relative max-w-4xl mx-auto mb-12"
                >
                  {/* Parchment Paper Effect */}
                  <div 
                    className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 relative"
                    style={{
                      borderRadius: '2px',
                      background: `linear-gradient(135deg, 
                        #fefcf5 0%, 
                        #fdf8e8 25%, 
                        #faf5e0 50%, 
                        #f7f0d8 75%, 
                        #f4ecd0 100%
                      )`,
                      boxShadow: `
                        0 4px 8px rgba(139, 69, 19, 0.1),
                        0 8px 16px rgba(139, 69, 19, 0.05),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6)
                      `,
                    }}
                  >
                    {/* Aged paper texture overlay */}
                    <div 
                      className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
                          radial-gradient(circle at 80% 30%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
                          radial-gradient(circle at 40% 70%, rgba(139, 69, 19, 0.04) 0%, transparent 50%)
                        `
                      }}
                    />
                    
                    {/* Letter Content */}
                    <div className="relative p-12 md:p-16">
                      {/* Date and sender header */}
                      <div className="text-center mb-8 pb-4 border-b border-amber-200/50">
                        <p className="text-amber-800 font-playfair text-sm uppercase tracking-wider mb-1">
                          {formatDate(message.scheduledAt)}
                        </p>
                        <p className="text-amber-700 font-playfair text-lg italic">
                          From your beloved, {message.sender.name}
                        </p>
                      </div>
                      
                      {/* Letter salutation */}
                      <div className="mb-6">
                        <p className="text-amber-800 font-playfair text-lg">
                          My dearest,
                        </p>
                      </div>
                      
                      {/* Letter body */}
                      <div className="prose prose-amber max-w-none">
                        <p 
                          className="text-amber-900 leading-loose font-serif text-lg whitespace-pre-wrap indent-8"
                          style={{ 
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            textAlign: 'justify',
                            lineHeight: '1.8'
                          }}
                        >
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Letter closing */}
                      <div className="mt-8 text-right">
                        <p className="text-amber-800 font-playfair text-lg italic">
                          With all my love,
                        </p>
                        <p className="text-amber-700 font-playfair text-xl mt-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
                          {message.sender.name}
                        </p>
                      </div>
                    </div>

                    {/* Worn edges effect */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-200/30 transform -rotate-12"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-4 bg-amber-200/20 transform rotate-45"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-2 bg-amber-200/25 transform rotate-12"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-200/30 transform -rotate-45"></div>
                  </div>

                  {/* Drop shadow for depth */}
                  <div 
                    className="absolute inset-0 bg-amber-200/20 transform translate-x-1 translate-y-1 -z-10"
                    style={{ borderRadius: '2px' }}
                  ></div>
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
                <div className="text-6xl mb-4">📸</div>
                <p className="text-rose-600 font-inter text-lg mb-4">
                  No photos from your beloved yet
                </p>
                <p className="text-rose-500 font-inter text-sm">
                  Photos you receive will create a beautiful gallery of shared memories
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photoMessages.map((message) => (
                  <div
                    key={message.id}
                    className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedPhoto(message.imageUrl!)}
                  >
                    <Image
                      src={message.imageUrl!}
                      alt="Shared memory"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-xs font-inter">
                          From {message.sender.name}
                        </p>
                        <p className="text-white/80 text-xs font-inter">
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
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl backdrop-blur-sm transition-colors"
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