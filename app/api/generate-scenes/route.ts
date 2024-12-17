import { NextResponse } from "next/server";
import { z } from "zod";

// Initialize Perplexity client
const PERPLEXITY_API_KEY = process.env.PERPLE_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

const SceneSchema = z.object({
  scenes: z.array(
    z.object({
      title: z.string(),
      duration: z.string(),
      description: z.string(),
      imageDescription: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const videoData = await request.json();

    const systemMessage =
      "You are a video structure planner. Generate a detailed scene-by-scene breakdown for a video, including scene descriptions and visual suggestions.";

    const userMessage = `Create a scene breakdown for a video titled "${videoData.title}" with description: "${videoData.description}. Max 5 scenes".
    For each scene include:
    1. A clear title
    2. Duration in MM:SS format (total should be around 8-12 minutes)
    3. A description of what happens in the scene
    4. A description of what the first frame of visual scene should look like for this scene; image description in a format that LLM can understand; just a sentence or two for Flux model and explicitly mention that it should not have text.

    Format the response as a JSON array of objects with 'title', 'duration', 'description', and 'imageDescription' properties.`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-huge-128k-online",
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    // Parse the response content as JSON
    let scenes;
    try {
      // Try to extract JSON from the response text
      const jsonMatch = data.choices[0].message.content.match(/\[.*\]/s);
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0]);
      } else {
        console.error("No JSON array found in response");
        scenes = [];
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      scenes = [];
    }

    // Validate the response against the schema
    const validatedResponse = SceneSchema.safeParse({ scenes });
    if (!validatedResponse.success) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json(validatedResponse.data.scenes);
  } catch (error) {
    console.error("Error generating scenes:", error);
    return NextResponse.json(
      { error: "Failed to generate scenes" },
      { status: 500 }
    );
  }
}
