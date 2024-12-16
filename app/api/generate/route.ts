import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define the response type schema
const IdeaSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  )
})

export async function POST(request: Request) {
  try {
    const channelData = await request.json()
    
    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content: "You are a creative content idea generator. Generate 3 creative video content ideas based on the provided channel theme and description."
        },
        { 
          role: "user", 
          content: `Generate ideas for a channel with theme: "${channelData.theme || 'General'}" and description: "${channelData.description || 'Various topics'}"` 
        }
      ],
      model: "gpt-4o",
      temperature: 0.7,
      response_format: zodResponseFormat(IdeaSchema, "ideas")
    })

    const { ideas } = completion.choices[0].message.parsed ?? { ideas: [] }

    return NextResponse.json(ideas)
  } catch (error) {
    console.error('Error generating ideas:', error)
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    )
  }
}