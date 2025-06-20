import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription, solutionData, uiFlowData } = await req.json();

    const prompt = `\nYou are an expert product manager and technical writer specializing in restaurant Point of Sale (POS) systems. Create a comprehensive set of user stories (at least 3) with UI flows for the feature described below, considering all the analysis data provided. Return the response in the following JSON format:\n\n{\n  \"feature\": {\n    \"title\": \"...\",\n    \"description\": \"...\"\n  },\n  \"userStories\": [\n    {\n      \"asA\": \"...\",\n      \"iWant\": \"...\",\n      \"soThat\": \"...\",\n      \"acceptanceCriteria\": [\"...\"]\n    }\n  ],\n  \"uiFlows\": [\n    {\n      \"flowName\": \"...\",\n      \"steps\": [\"...\"],\n      \"screens\": [\"...\"]\n    }\n  ],\n  \"technicalRequirements\": {\n    \"frontend\": [\"...\"],\n    \"backend\": [\"...\"],\n    \"database\": [\"...\"],\n    \"integrations\": [\"...\"]\n  },\n  \"testingScenarios\": [\"...\"],\n  \"successMetrics\": [\"...\"]\n}\n\nFeature Title: ${featureTitle}\nFeature Description: ${featureDescription}\nSolution Data: ${JSON.stringify(solutionData, null, 2)}\nUI Flow Data: ${JSON.stringify(uiFlowData, null, 2)}\n\nFocus on:\n1. Creating at least 3 clear, actionable user stories following the \"As a... I want to... So that...\" format\n2. Detailed acceptance criteria for each user story\n3. Multiple UI flows covering different user scenarios\n4. Comprehensive technical requirements for implementation\n5. Testing scenarios that ensure quality\n6. Success metrics to measure the feature's impact\n`;

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