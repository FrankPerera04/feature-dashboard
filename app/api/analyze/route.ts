import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  // Extract the JSON from the response
  let result;
  try {
    result = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse response from OpenAI" }, { status: 500 });
  }

  return NextResponse.json(result);
}
