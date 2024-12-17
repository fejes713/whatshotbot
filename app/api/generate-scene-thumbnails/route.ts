import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: Request) {
  try {
    const { imageDescription } = await request.json()
    
    const input = {
      prompt: imageDescription,
      go_fast: true,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "16:9",
      output_format: "webp",
      output_quality: 100,
      num_inference_steps: 4
    }

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      { input }
    )

    if (!output || !Array.isArray(output) || !output[0]) {
      throw new Error('Invalid response from Replicate')
    }

    // Handle the stream
    const outputStream = output[0]
    const reader = outputStream.getReader()
    const chunks = []

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // Combine chunks and convert to base64
    const imageBuffer = Buffer.concat(chunks)
    const base64Image = imageBuffer.toString('base64')

    console.log('Successfully generated image')

    return NextResponse.json({ 
      imageUrl: `data:image/webp;base64,${base64Image}` 
    })
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate thumbnail',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    )
  }
} 