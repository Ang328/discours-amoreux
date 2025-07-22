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
      return NextResponse.json(
        { error: 'Partner email is required' },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (currentUser.partnerId) {
      return NextResponse.json(
        { error: 'You are already connected to someone!' },
        { status: 400 }
      )
    }

    const partner = await prisma.user.findUnique({
      where: { email: partnerEmail }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found. They need to register first!' },
        { status: 404 }
      )
    }

    if (partner.partnerId) {
      return NextResponse.json(
        { error: 'This person is already connected to someone else!' },
        { status: 400 }
      )
    }

    if (partner.id === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot connect to yourself!' },
        { status: 400 }
      )
    }

    // Connect both users to each other
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { partnerId: partner.id }
    })

    await prisma.user.update({
      where: { id: partner.id },
      data: { partnerId: currentUser.id }
    })

    return NextResponse.json({ 
      message: `Successfully connected with ${partner.name}!`,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}