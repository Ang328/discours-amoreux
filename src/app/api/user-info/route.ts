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

    console.log('Looking for user with email:', session.user.email) // Debug log

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    console.log('Found user:', user?.name, 'Partner:', user?.partner?.name) // Debug log

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      partner: user.partner
    })
  } catch (error) {
    console.log('Error in user-info API:', error) // Debug log
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}