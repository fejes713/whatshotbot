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
      description: z.string(),
    })
  )
})

export async function POST(request: Request) {
  try {
    const channelData = await request.json()
    
    // Add type flag to the request
    const isExploringFurther = 'type' in channelData && channelData.type === 'explore_further'
    
    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content: isExploringFurther
            ? "You are a creative video content idea generator specializing in refining and expanding on existing video concepts. For each concept, ensure ideas are highly tailored, include a potential title, a brief description of the content, and specify the target audience for each idea."
            : "You are a creative video content idea generator specializing in developing ideas based on a specific channel theme and description. For each idea, include a potential title, a short description of the content, and the target audience. Ensure the ideas are unique, engaging, and aligned with the channel's goals."
        },
        { 
          role: "user", 
          content: isExploringFurther
            ? `Generate highly specific video ideas that align with the following concept:
               Title: "${channelData.title}",
               Description: "${channelData.description}".
               Theme: "${channelData.theme || 'General'}",
               Description: "${channelData.description || 'Various topics'}".
               Provide 3 ideas that closely build on this concept, including:
               - A clear and engaging title for each idea.
               - A short description of the content.
               - The intended target audience for the video.`
            : `Generate creative video ideas for a channel with the following details:
               Theme: "${channelData.theme || 'General'}",
               Description: "${channelData.description || 'Various topics'}".
               Provide 3 ideas, each with:
               - A compelling title.
               - A concise description of the video.`
        }
      ],
      model: "gpt-4o",
      temperature: 0.9,
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