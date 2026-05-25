import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const descriptionSchema = z.object({
  bullet_points: z.string().min(10, 'Please provide at least a few bullet points'),
  event_title: z.string().optional(),
  event_type: z.string().optional(),
})

const recommendationSchema = z.object({
  user_categories: z.array(z.string()),
  user_past_events: z.array(z.string()),
  available_events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    category: z.string().nullable(),
    city: z.string().nullable(),
  })),
})

const scheduleSchema = z.object({
  sessions: z.array(z.object({
    title: z.string(),
    speaker: z.string(),
    duration_minutes: z.number(),
    topic: z.string(),
  })),
  event_title: z.string(),
  total_duration_hours: z.number(),
})

export const generateEventDescription = createServerFn({ method: 'POST' })
  .inputValidator(descriptionSchema)
  .handler(async ({ data }: { data: z.infer<typeof descriptionSchema> }) => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.warn('Gemini API key not configured, using beautiful fallback copy')
      return getFallbackDescription(data)
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `You are an expert event copywriter. Generate a compelling, professional event description based on these bullet points:

${data.bullet_points}

${data.event_title ? `Event Title: ${data.event_title}` : ''}
${data.event_type ? `Event Type: ${data.event_type}` : ''}

Requirements:
- Write in a professional yet engaging tone
- Include a hook in the first sentence
- Highlight key value propositions
- Add a call-to-action at the end
- Keep it between 150-300 words
- Use short paragraphs for readability
- Do NOT use markdown formatting, just plain text with line breaks

Return ONLY the description text, nothing else.`

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      return { generated_text: text, model_version: 'gemini-2.0-flash' }
    } catch (error) {
      console.error('Gemini API Error (falling back to beautiful generator):', error)
      return getFallbackDescription(data)
    }
  })

function getFallbackDescription(data: z.infer<typeof descriptionSchema>) {
  const title = data.event_title || 'our featured event'
  const type = data.event_type || 'interactive'
  const bullets = data.bullet_points
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p.startsWith('-') || p.startsWith('*') ? p.slice(1).trim() : p)

  const bulletListStr = bullets.map(b => `• ${b}`).join('\n')
  
  const text = `Get ready for an extraordinary experience at ${title}! This premium ${type} event is meticulously designed to inspire, educate, and empower you. 

Here is what you can look forward to:
${bulletListStr || '• High-impact learning modules and interactive sessions\n• Direct access to top-tier industry experts and visionaries\n• Premium networking spaces to foster powerful connections'}

Whether you are looking to acquire cutting-edge skills, discover game-changing industry insights, or connect with a vibrant community of like-minded peers, this event has it all. Our speakers will guide you through current trends and future directions, ensuring you walk away with highly actionable takeaways.

Do not let this incredible opportunity pass you by. Space is strictly limited to ensure a high-quality experience for all participants. Secure your spot today and join us for an unforgettable event!`

  return { 
    generated_text: text, 
    model_version: 'gemini-fallback-simulator',
    is_fallback: true
  }
}

export const getEventRecommendations = createServerFn({ method: 'POST' })
  .inputValidator(recommendationSchema)
  .handler(async ({ data }: { data: z.infer<typeof recommendationSchema> }) => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return getFallbackRecommendations(data)
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `You are an event recommendation engine. Based on the user's preferences and history, rank these events by relevance.

User's preferred categories: ${data.user_categories.join(', ')}
User's past events: ${data.user_past_events.join(', ')}

Available events:
${data.available_events.map(e => `- ID: ${e.id}, Title: ${e.title}, Category: ${e.category}, City: ${e.city}, Description: ${e.description?.slice(0, 100)}`).join('\n')}

Return a JSON array of objects with format: [{"id": "event_id", "score": 0.95, "reason": "brief reason"}]
Order by score descending. Score should be 0-1.
Return ONLY the JSON array, no markdown, no explanation.`

      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const recommendations = JSON.parse(cleanJson) as Array<{ id: string; score: number; reason: string }>
      
      return { recommendations, model_version: 'gemini-2.0-flash' }
    } catch (error) {
      console.error('Gemini Recommendation Error (using smart fallback):', error)
      return getFallbackRecommendations(data)
    }
  })

function getFallbackRecommendations(data: z.infer<typeof recommendationSchema>) {
  const recommendations = data.available_events.map((e, index) => {
    const isPreferredCategory = data.user_categories.some(
      cat => cat.toLowerCase() === (e.category || '').toLowerCase()
    )
    
    let score = 0.5 + (data.available_events.length - index) * 0.05
    let reason = "Recommended as a popular trending event in our community."

    if (isPreferredCategory) {
      score = 0.85 + Math.random() * 0.12
      reason = `Highly matched based on your active interest in ${e.category || 'this category'}.`
    } else if (data.user_past_events.some(past => e.title.toLowerCase().includes(past.toLowerCase()))) {
      score = 0.90 + Math.random() * 0.08
      reason = "Similar to other exciting events you've previously attended."
    }

    score = Math.min(Math.round(score * 100) / 100, 1.0)

    return {
      id: e.id,
      score,
      reason
    }
  }).sort((a, b) => b.score - a.score)

  return {
    recommendations,
    model_version: 'gemini-fallback-simulator',
    is_fallback: true
  }
}

export const buildSmartSchedule = createServerFn({ method: 'POST' })
  .inputValidator(scheduleSchema)
  .handler(async ({ data }: { data: z.infer<typeof scheduleSchema> }) => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return getFallbackSchedule(data)
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `You are an event schedule optimizer. Create an optimal session schedule for this event.

Event: ${data.event_title}
Total Duration: ${data.total_duration_hours} hours

Sessions:
${data.sessions.map(s => `- "${s.title}" by ${s.speaker} (${s.duration_minutes}min, Topic: ${s.topic})`).join('\n')}

Consider:
1. Start with an engaging session to capture attention
2. Place heavier/technical topics in mid-morning when attention is highest
3. Alternate between heavy and light sessions
4. Group related topics together for flow
5. End with an inspiring or interactive session
6. Add appropriate breaks (15min morning, 45-60min lunch, 15min afternoon)

Return a JSON array: [{"order": 1, "title": "session title", "speaker": "name", "start_time": "09:00", "end_time": "09:45", "type": "session|break", "reason": "why this placement"}]
Return ONLY the JSON array.`

      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const schedule = JSON.parse(cleanJson)
      
      return { schedule, model_version: 'gemini-2.0-flash' }
    } catch (error) {
      console.error('Gemini Schedule Error (using smart fallback):', error)
      return getFallbackSchedule(data)
    }
  })

function getFallbackSchedule(data: z.infer<typeof scheduleSchema>) {
  interface ScheduleItem {
    order: number
    title: string
    speaker: string
    start_time: string
    end_time: string
    type: 'session' | 'break'
    reason: string
  }

  const schedule: ScheduleItem[] = []
  let order = 1
  let currentHour = 9
  let currentMinute = 0

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const addTime = (minutes: number) => {
    currentMinute += minutes
    while (currentMinute >= 60) {
      currentMinute -= 60
      currentHour += 1
    }
  }

  // Welcome / Coffee break
  schedule.push({
    order: order++,
    title: 'Morning Registration & Networking',
    speaker: 'Event Crew',
    start_time: formatTime(currentHour, currentMinute),
    end_time: (() => {
      addTime(30)
      return formatTime(currentHour, currentMinute)
    })(),
    type: 'break',
    reason: 'Welcome attendees, distribute badges, and settle in with refreshments.'
  })

  // Distribute sessions and lunch
  const midIndex = Math.floor(data.sessions.length / 2)

  data.sessions.forEach((s, idx) => {
    if (idx === midIndex) {
      // Add Lunch Break
      schedule.push({
        order: order++,
        title: 'Networking & Buffet Lunch',
        speaker: 'All Attendees',
        start_time: formatTime(currentHour, currentMinute),
        end_time: (() => {
          addTime(60)
          return formatTime(currentHour, currentMinute)
        })(),
        type: 'break',
        reason: 'Rest, recharge, and network over a delicious catered buffet.'
      })
    }

    schedule.push({
      order: order++,
      title: s.title,
      speaker: s.speaker,
      start_time: formatTime(currentHour, currentMinute),
      end_time: (() => {
        addTime(s.duration_minutes)
        return formatTime(currentHour, currentMinute)
      })(),
      type: 'session',
      reason: idx === 0 
        ? 'High-energy opener to set an exciting tone for the day.' 
        : idx === data.sessions.length - 1 
          ? 'Thought-provoking wrap-up and vision-sharing session to leave a lasting impact.'
          : 'Strategically scheduled to maintain cognitive flow and participant engagement.'
    })
  })

  return {
    schedule,
    model_version: 'gemini-fallback-simulator',
    is_fallback: true
  }
}
