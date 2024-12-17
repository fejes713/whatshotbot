import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SceneSchema = z.object({
  scenes: z.array(
    z.object({
      title: z.string(),
      duration: z.string(),
      description: z.string(),
      imageDescription: z.string()
    })
  )
})

export async function POST(request: Request) {
  try {
    const videoData = await request.json()
    
    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content: "You are a video structure planner. Generate a detailed scene-by-scene breakdown for a video, including scene descriptions and visual suggestions."
        },
        { 
          role: "user", 
          content: `Create a scene breakdown for a video titled "${videoData.title}" with description: "${videoData.description}. Max 1 scenes".
          For each scene include:
          1. A clear title
          2. Duration in MM:SS format (total should be around 8-12 minutes)
          3. A description of what happens in the scene
          4. A description of what the thumbnail/visual should look like for this scene; image description in a format that LLM can understand; just a sentence or two for Flux model`
        }
      ],
      model: "gpt-4o",
      temperature: 0.7,
      response_format: zodResponseFormat(SceneSchema, "scenes")
    })

    const { scenes } = completion.choices[0].message.parsed ?? { scenes: [] }
    return NextResponse.json(scenes)
  } catch (error) {
    console.error('Error generating scenes:', error)
    return NextResponse.json(
      { error: 'Failed to generate scenes' },
      { status: 500 }
    )
  }
} 