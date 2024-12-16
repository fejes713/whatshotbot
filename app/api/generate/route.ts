import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Initialize Perplexity client
const PERPLEXITY_API_KEY = process.env.PERPLE_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Define the response type schema
const IdeaSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const channelData = await request.json();

    const isExploringFurther =
      "type" in channelData && channelData.type === "explore_further";

    // Prepare the system and user messages
    const systemMessage = isExploringFurther
      ? "You are a creative video content idea generator specializing in refining and expanding on existing video concepts. First, for for each concept find out what are the top trending topics are in the world, then ensure ideas are highly tailored, include a potential title, a brief description of the content, and specify the target audience for each idea."
      : "You are a creative video content idea generator specializing in developing ideas based on a specific channel theme and description. First, find ideas based on what is the most trending topics on the internet at the moment. Then for each idea, include a potential title, a short description of the content, and the target audience. Ensure the ideas are unique, engaging, and aligned with the channel's goals.";

    const userMessage = isExploringFurther
      ? `Generate highly specific video ideas that align with the following concept:
         Title: "${channelData.title}",
         Description: "${channelData.description}".
         Theme: "${channelData.theme || "General"}",
         Description: "${channelData.description || "Various topics"}".
         Provide 3 ideas that closely build on this concept, including:
         - A clear and engaging title for each idea.
         - A short description of the content.
         - The intended target audience for the video.
         
         Format the response as a JSON array of objects with 'title' and 'description' properties.`
      : `Generate creative video ideas for a channel with the following details:
         Theme: "${channelData.theme || "General"}",
         Description: "${channelData.description || "Various topics"}".
         Provide 3 ideas, each with:
         - A compelling title.
         - A concise description of the video.
         
         Format the response as a JSON array of objects with 'title' and 'description' properties.`;

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
    let ideas;
    try {
      // Try to extract JSON from the response text
      const jsonMatch = data.choices[0].message.content.match(/\[.*\]/s);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        console.error("No JSON array found in response");
        ideas = [];
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      ideas = [];
    }

    // Validate the response against the schema
    const validatedResponse = IdeaSchema.safeParse({ ideas });
    if (!validatedResponse.success) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json(validatedResponse.data.ideas);
  } catch (error) {
    console.error("Error generating ideas:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
