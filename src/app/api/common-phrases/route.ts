import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all messages from partner
    const messages = await prisma.message.findMany({
      where: {
        receiverId: user.id,
        content: {
          not: ''
        }
      },
      select: {
        content: true
      }
    })

    // Extract common phrases (simple approach - sentences ending with common words)
    const phrases: string[] = []
    const commonPhrases = [
      "I love you",
      "I miss you", 
      "thinking of you",
      "can't wait to see you",
      "you mean everything to me",
      "dream about you",
      "wish you were here",
      "my heart belongs to you",
      "forever yours",
      "love you more",
      "you're my everything",
      "missing your smile",
      "counting the days",
      "my beloved",
      "my darling"
    ]

    // Simple phrase extraction from messages
    messages.forEach(message => {
      const content = message.content.toLowerCase()
      
      // Look for common romantic phrases
      commonPhrases.forEach(phrase => {
        if (content.includes(phrase.toLowerCase())) {
          phrases.push(phrase)
        }
      })

      // Extract sentences that end with "you"
      const sentences = content.split(/[.!?]+/).map(s => s.trim())
      sentences.forEach(sentence => {
        if (sentence.endsWith(' you') && sentence.length > 10 && sentence.length < 50) {
          const cleaned = sentence.charAt(0).toUpperCase() + sentence.slice(1)
          phrases.push(cleaned)
        }
      })
    })

    // Count frequency and get most common
    const phraseCount: { [key: string]: number } = {}
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1
    })

    // Get top phrases, fallback to romantic defaults
    const sortedPhrases = Object.entries(phraseCount)
      .sort(([,a], [,b]) => b - a)
      .map(([phrase]) => phrase)
      .slice(0, 5)

    const finalPhrases = sortedPhrases.length > 0 ? sortedPhrases : [
      "I love you",
      "I miss you so much", 
      "You're my everything",
      "Can't wait to hold you",
      "Forever yours"
    ]

    return NextResponse.json({ phrases: finalPhrases })
  } catch (error) {
    console.error('Error getting common phrases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}