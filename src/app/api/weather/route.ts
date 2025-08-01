import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface WeatherData {
  temperature: number
  description: string
  icon: string
  localTime: string
  city: string
  country: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If userId is provided, get that user's weather, otherwise get current user's weather
    const targetUserId = userId || null
    
    let user
    if (targetUserId) {
      user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          timezone: true,
          latitude: true,
          longitude: true,
        }
      })
    } else {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          timezone: true,
          latitude: true,
          longitude: true,
        }
      })
    }

    if (!user || !user.latitude || !user.longitude) {
      return NextResponse.json({ error: 'User location not found' }, { status: 404 })
    }

    // For demo purposes, we'll simulate weather data since we don't have an API key
    // In production, you would use: const weatherApiKey = process.env.OPENWEATHER_API_KEY
    
    // Simulate weather data based on location
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

    const weatherData: WeatherData = {
      temperature,
      description: randomWeather,
      icon: getWeatherIcon(randomWeather),
      localTime,
      city: user.city || 'Unknown',
      country: user.country || 'Unknown'
    }

    return NextResponse.json({ weather: weatherData })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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