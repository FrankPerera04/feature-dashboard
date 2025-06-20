import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription, solutionData, uiFlowData } = await req.json();

    const prompt = `
You are an expert product manager and technical writer specializing in restaurant Point of Sale (POS) systems. Create a comprehensive user story with UI flows for the feature described below, considering all the analysis data provided. Return the response in the following JSON format:

{
  "feature": {
    "title": "...",
    "description": "..."
  },
  "userStory": {
    "asA": "...",
    "iWant": "...",
    "soThat": "...",
    "acceptanceCriteria": ["..."]
  },
  "uiFlows": [
    {
      "flowName": "...",
      "steps": ["..."],
      "screens": ["..."]
    }
  ],
  "technicalRequirements": {
    "frontend": ["..."],
    "backend": ["..."],
    "database": ["..."],
    "integrations": ["..."]
  },
  "testingScenarios": ["..."],
  "successMetrics": ["..."]
}

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}
Solution Data: ${JSON.stringify(solutionData, null, 2)}
UI Flow Data: ${JSON.stringify(uiFlowData, null, 2)}

Focus on:
1. Creating a clear, actionable user story following the "As a... I want to... So that..." format
2. Detailed acceptance criteria that can be used for testing
3. Multiple UI flows covering different user scenarios
4. Comprehensive technical requirements for implementation
5. Testing scenarios that ensure quality
6. Success metrics to measure the feature's impact
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
          { role: "system", content: "You are a helpful assistant specializing in product management and technical writing for restaurant POS systems." },
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