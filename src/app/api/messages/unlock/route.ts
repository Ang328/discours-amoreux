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

    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()

    // Get the message and verify it belongs to this user and is ready to be unlocked
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: user.id,
        scheduledAt: {
          lte: now // Message should be ready for delivery
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or not ready for delivery' },
        { status: 404 }
      )
    }

    // Mark as delivered if not already
    if (!message.isDelivered) {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          isDelivered: true,
          deliveredAt: now
        }
      })
    }

    return NextResponse.json({ 
      message: {
        ...message,
        isDelivered: true,
        deliveredAt: message.deliveredAt || now
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}