import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface WeatherInfo {
  temperature: number
  description: string
  icon: string
  localTime: string
  city: string
  country: string
  name: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            timezone: true,
            latitude: true,
            longitude: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's weather info
    const userWeather = await getWeatherForUser(user)
    
    // Get partner's weather info if partner exists
    let partnerWeather = null
    if (user.partner) {
      partnerWeather = await getWeatherForUser(user.partner)
    }

    // Get greeting based on user's local time
    const greeting = getTimeBasedGreeting(user.timezone || 'UTC')

    return NextResponse.json({ 
      user: userWeather,
      partner: partnerWeather,
      greeting
    })
  } catch (error) {
    console.error('Weather info API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function getWeatherForUser(user: any): Promise<WeatherInfo | null> {
  if (!user.latitude || !user.longitude) {
    return null
  }

  // Simulate weather data
  const weatherDescriptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy']
  const randomWeather = weatherDescriptions[Math.floor(Math.random() * weatherDescriptions.length)]
  const temperature = Math.floor(Math.random() * 30) + 5 // 5-35°C
  
  // Get local time in user's timezone
  const localTime = new Intl.DateTimeFormat('en-US', {
    timeZone: user.timezone || 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date())

  return {
    temperature,
    description: randomWeather,
    icon: getWeatherIcon(randomWeather),
    localTime,
    city: user.city || 'Unknown',
    country: user.country || 'Unknown',
    name: user.name
  }
}

function getWeatherIcon(description: string): string {
  switch (description) {
    case 'sunny': return '☀️'
    case 'cloudy': return '☁️'
    case 'rainy': return '🌧️'
    case 'snowy': return '❄️'
    case 'foggy': return '🌫️'
    default: return '🌤️'
  }
}

function getTimeBasedGreeting(timezone: string): string {
  const now = new Date()
  const hour = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false
  }).format(now))

  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon'
  } else if (hour >= 17 && hour < 22) {
    return 'Good Evening'
  } else {
    return 'Good Night'
  }
}