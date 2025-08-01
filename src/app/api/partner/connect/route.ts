import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerEmail } = await request.json()

    if (!partnerEmail) {
      return NextResponse.json({ error: 'Partner email required' }, { status: 400 })
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

    // Find the target user
    const partnerUser = await prisma.user.findUnique({
      where: { email: partnerEmail }
    })

    if (!partnerUser) {
      return NextResponse.json({ error: 'Partner user not found' }, { status: 404 })
    }

    // Check if partner already has a partner
    if (partnerUser.partnerId) {
      return NextResponse.json({ error: 'This user already has a partner' }, { status: 400 })
    }

    // Don't allow connecting to self
    if (partnerUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 })
    }

    // Create bidirectional partnership
    await prisma.$transaction([
      // Update current user to point to partner
      prisma.user.update({
        where: { id: currentUser.id },
        data: { partnerId: partnerUser.id }
      }),
      // Update partner to point to current user
      prisma.user.update({
        where: { id: partnerUser.id },
        data: { partnerId: currentUser.id }
      })
    ])

    return NextResponse.json({ 
      message: 'Partnership created successfully',
      partner: {
        id: partnerUser.id,
        name: partnerUser.name,
        email: partnerUser.email,
        city: partnerUser.city,
        country: partnerUser.country,
      }
    })
  } catch (error) {
    console.error('Partner connect API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}