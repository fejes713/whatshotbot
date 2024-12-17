import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { prompt, aspect_ratio } = await request.json()
    
    const input = {
      loop: false,
      prompt,
      aspect_ratio
    }

    const output = await replicate.run(
      "luma/ray",
      { input }
    )

    if (!output) {
      throw new Error('Invalid response from Replicate')
    }

    return NextResponse.json({ 
      animatedUrl: output
    })
  } catch (error) {
    console.error('Error generating animation:', error)
    return NextResponse.json(
      { error: 'Failed to generate animation' },
      { status: 500 }
    )
  }
} 