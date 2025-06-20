import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription } = await req.json();

    const prompt = `
You are an expert in restaurant Point of Sale (POS) systems and specifically knowledgeable about Applova.io. Analyze the feature described below and provide a comprehensive solution for integrating it into Applova in the following JSON format:

{
  "feature": {
    "title": "...",
    "description": "..."
  },
  "applovaCurrent": {
    "existingFeatures": ["..."],
    "strengths": ["..."]
  },
  "missingComponents": ["..."],
  "proposedSolution": {
    "overview": "...",
    "implementation": ["..."],
    "benefits": ["..."]
  },
  "keyTakeaways": ["..."]
}

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}

Focus on:
1. What Applova already has that's relevant
2. What's missing to implement this feature
3. How to integrate it seamlessly with existing functionality
4. Benefits this will bring to Applova users
5. Key implementation considerations
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant specializing in restaurant POS systems and Applova.io integration." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json({ error: "OpenAI API error", details: errorText }, { status: 500 });
    }

    const data = await response.json();

    let result;
    let content = data.choices[0].message.content;
    console.log("OpenAI raw content:", content);

    // Remove markdown code block if present
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json({ error: "Failed to parse response from OpenAI", details: content }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route Error:", error);
    const message = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
} 