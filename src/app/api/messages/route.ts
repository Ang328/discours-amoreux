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

    const { content, imageUrl } = await request.json()

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      )
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { partner: true }
    })

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }

    if (!sender.partnerId || !sender.partner) {
      return NextResponse.json(
        { error: 'You need to connect with your lover first!' },
        { status: 400 }
      )
    }

    const now = new Date()
    const scheduledAt = new Date(now.getTime() + 5 * 1000) // 5 seconds delay (temporary for testing)

    const message = await prisma.message.create({
      data: {
        content: content || '',
        imageUrl,
        senderId: sender.id,
        receiverId: sender.partnerId,
        scheduledAt,
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

    return NextResponse.json({ message })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const now = new Date()
    
    const deliveredMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        scheduledAt: {
          lte: now
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
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    await prisma.message.updateMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        scheduledAt: {
          lte: now
        },
        isDelivered: false
      },
      data: {
        isDelivered: true,
        deliveredAt: now
      }
    })

    return NextResponse.json({ messages: deliveredMessages })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}