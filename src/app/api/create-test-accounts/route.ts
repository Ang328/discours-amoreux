import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const hashedPassword = await bcrypt.hash('123456', 12)

    // Create first test account
    const user1 = await prisma.user.upsert({
      where: { email: 'lover1@test.com' },
      update: {},
      create: {
        name: 'Alex',
        email: 'lover1@test.com',
        password: hashedPassword,
      }
    })

    // Create second test account
    const user2 = await prisma.user.upsert({
      where: { email: 'lover2@test.com' },
      update: {},
      create: {
        name: 'Jamie',
        email: 'lover2@test.com',
        password: hashedPassword,
      }
    })

    // Connect them as partners
    await prisma.user.update({
      where: { id: user1.id },
      data: { partnerId: user2.id }
    })

    await prisma.user.update({
      where: { id: user2.id },
      data: { partnerId: user1.id }
    })

    return NextResponse.json({
      message: 'Test accounts created and connected successfully!',
      accounts: [
        { name: 'Alex', email: 'lover1@test.com', password: '123456' },
        { name: 'Jamie', email: 'lover2@test.com', password: '123456' }
      ]
    })
  } catch (error) {
    console.error('Error creating test accounts:', error)
    return NextResponse.json(
      { error: 'Failed to create test accounts' },
      { status: 500 }
    )
  }
}