import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function AIErrorHandler(error: Error): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly error handler. Generate a brief, empathetic response (max 200 characters) explaining a technical error in human terms. Be concise and helpful.",
        },
        {
          role: "user",
          content: `Generate a user-friendly error message for this error: ${error.message}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content ||
      "Oops! Something unexpected happened. We're looking into it!"
    );
  } catch (aiError) {
    // Fallback message if AI service fails
    return "We encountered an unexpected issue. Our team has been notified.";
  }
}

// Usage example:
try {
  // Your code that might throw an error
  throw new Error(
    "ECONNREFUSED: Failed to fetch data from API endpoint /users"
  );
} catch (error) {
  if (error instanceof Error) {
    const userMessage = await AIErrorHandler(error);
    // Display userMessage to the user
    console.log(userMessage);
  }
}
