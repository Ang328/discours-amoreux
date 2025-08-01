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

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Find the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Check if user already has a partner
    if (currentUser.partnerId) {
      return NextResponse.json({ error: 'You already have a partner' }, { status: 400 })
    }

    // Search for the target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        country: true,
        partnerId: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if target user already has a partner
    if (targetUser.partnerId) {
      return NextResponse.json({ error: 'This user already has a partner' }, { status: 400 })
    }

    // Don't allow connecting to self
    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 })
    }

    return NextResponse.json({ 
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        city: targetUser.city,
        country: targetUser.country,
      }
    })
  } catch (error) {
    console.error('Partner search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}