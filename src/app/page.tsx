'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phrases, setPhrases] = useState<string[]>([])
  const [currentPhrase, setCurrentPhrase] = useState(0)

  // Don't auto-redirect to messages anymore

  // Fetch common phrases for rotating display
  useEffect(() => {
    if (session) {
      fetchCommonPhrases()
    }
  }, [session])

  // Rotate phrases every 4 seconds
  useEffect(() => {
    if (phrases.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhrase(prev => (prev + 1) % phrases.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [phrases])

  const fetchCommonPhrases = async () => {
    try {
      const res = await fetch('/api/common-phrases')
      if (res.ok) {
        const data = await res.json()
        setPhrases(data.phrases)
      }
    } catch (error) {
      console.error('Failed to fetch phrases:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600 text-lg font-playfair">Loading...</div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-black text-green-500 scan-lines relative px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="pixel-font-large retro-glow mb-8" style={{ fontSize: '24px' }}>
            &gt; DISCOURS_AMOUREUX.EXE
          </h1>
          
          <p className="pixel-font mb-12 opacity-80">
            SYSTEM_USER: {session?.user?.name?.toUpperCase()}
          </p>

          {/* Rotating Messages Section */}
          {phrases.length > 0 && (
            <div className="mb-16 h-32 flex items-center justify-center">
              <div className="border border-green-500 bg-black/50 p-8 max-w-2xl">
                <div className="pixel-font text-pink-500 mb-2">
                  &gt; INCOMING_MESSAGE.TXT
                </div>
                <div 
                  key={currentPhrase}
                  className="pixel-font-xl retro-glow text-pink-500 rotating-message"
                  style={{ fontSize: '20px', minHeight: '60px' }}
                >
                  "{phrases[currentPhrase]}"
                </div>
                <div className="pixel-font text-green-500 mt-2 opacity-60">
                  MSG_{currentPhrase + 1}/{phrases.length}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Link
              href="/write"
              className="retro-button px-6 py-4 block text-center"
            >
              &gt; WRITE_LETTER.exe
            </Link>
            
            <Link
              href="/photos"
              className="retro-button retro-button-secondary px-6 py-4 block text-center"
            >
              &gt; SEND_IMAGE.exe
            </Link>
            
            <Link
              href="/archive"
              className="retro-button px-6 py-4 block text-center"
            >
              &gt; VIEW_ARCHIVE.exe
            </Link>
          </div>

          {/* Terminal-style info */}
          <div className="border border-green-500 bg-black/30 p-4 text-left pixel-font text-green-400 opacity-70">
            <div>&gt; CONNECTION_STATUS: ESTABLISHED</div>
            <div>&gt; DELAY_MODE: 5_SECONDS [TESTING]</div>
            <div>&gt; ENCRYPTION: LOVE_PROTOCOL_v2.0</div>
            <div>&gt; LAST_HEARTBEAT: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-500 scan-lines relative flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        {/* ASCII Art Title */}
        <div className="pixel-font-large retro-glow mb-8" style={{ fontSize: '20px', lineHeight: '1.2' }}>
          <div>╔══════════════════════════════════╗</div>
          <div>║    DISCOURS_AMOUREUX v2.0        ║</div>
          <div>╚══════════════════════════════════╝</div>
        </div>
        
        <p className="pixel-font mb-8 text-pink-500 opacity-90">
          &gt; LONG_DISTANCE_LOVE_PROTOCOL_INITIALIZED
        </p>

        {/* Features */}
        <div className="border border-green-500 bg-black/30 p-6 mb-12 text-left">
          <div className="pixel-font text-green-400 mb-4">&gt; SYSTEM_FEATURES:</div>
          <div className="space-y-2 text-sm pixel-font opacity-80">
            <div>&gt; DELAYED_MESSAGE_DELIVERY: 5s [TEST_MODE]</div>
            <div>&gt; ENCRYPTED_PHOTO_TRANSMISSION</div>
            <div>&gt; PARCHMENT_ARCHIVE_SYSTEM</div>
            <div>&gt; LOVE_PHRASE_ROTATION</div>
            <div>&gt; RETRO_AESTHETIC_ENGINE</div>
          </div>
        </div>

        {/* Quote */}
        <div className="mb-12 border border-pink-500 bg-black/20 p-4">
          <div className="pixel-font text-pink-500 text-xs mb-2">&gt; QUOTE_OF_THE_DAY.TXT</div>
          <div className="text-pink-400 opacity-80 pixel-font" style={{ fontSize: '11px' }}>
            "L'AMOUR, C'EST L'ESPACE ET LE TEMPS<br />
            RENDUS SENSIBLES AU COEUR"<br />
            — M.PROUST
          </div>
        </div>

        {/* Smaller Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="retro-button px-4 py-2 text-center"
          >
            &gt; NEW_USER.exe
          </Link>
          <Link
            href="/login"
            className="retro-button retro-button-secondary px-4 py-2 text-center"
          >
            &gt; LOGIN.exe
          </Link>
        </div>

        {/* System Info */}
        <div className="mt-12 text-xs pixel-font opacity-50">
          <div>&gt; BUILD_DATE: 2025.01.22</div>
          <div>&gt; STATUS: BETA_TESTING</div>
        </div>
      </div>
    </div>
  )
}