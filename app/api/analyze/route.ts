import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription } = await req.json();

    const prompt = `
You are an expert in restaurant Point of Sale (POS) systems in the US. Analyze the feature described below and provide competitor analysis in the following JSON format:

{
  "feature": {
    "title": "...",
    "description": "..."
  },
  "competitors": [
    {
      "name": "...",
      "description": "...",
      "marketShare": ...,
      "rating": ...,
      "pricing": "...",
      "keyFeatures": ["..."],
      "strengths": ["..."],
      "weaknesses": ["..."],
      "website": "..."
    }
    // ... more competitors
  ],
  "marketInsights": {
    "totalMarketSize": "...",
    "growthRate": "...",
    "keyTrends": ["..."]
  },
  "recommendations": ["..."]
}

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}
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
          { role: "system", content: "You are a helpful assistant." },
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
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", data);
      return NextResponse.json({ error: "Failed to parse response from OpenAI", details: data }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
