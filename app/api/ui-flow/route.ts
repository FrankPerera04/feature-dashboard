import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription, solutionData } = await req.json();

    const prompt = `
You are an expert UI/UX designer specializing in restaurant Point of Sale (POS) systems and Figma design. Create a comprehensive UI flow design for the feature described below, considering the solution data provided. Return the response in the following JSON format:

{
  "feature": {
    "title": "...",
    "description": "..."
  },
  "designOverview": {
    "concept": "...",
    "userJourney": ["..."],
    "keyScreens": ["..."]
  },
  "responsiveDesign": {
    "mobile": ["..."],
    "tablet": ["..."],
    "desktop": ["..."]
  },
  "figmaSpecs": {
    "colors": ["..."],
    "typography": ["..."],
    "components": ["..."],
    "interactions": ["..."]
  },
  "accessibility": ["..."],
  "implementationNotes": ["..."]
}

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}
Solution Data: ${JSON.stringify(solutionData, null, 2)}

Focus on:
1. Creating a user-friendly interface that fits Applova's existing design system
2. Responsive design considerations for mobile, tablet, and desktop
3. Accessibility features and best practices
4. Figma design specifications including colors, typography, and components
5. User interaction patterns and flows
6. Implementation notes for developers
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
          { role: "system", content: "You are a helpful assistant specializing in UI/UX design for restaurant POS systems and Figma design specifications." },
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