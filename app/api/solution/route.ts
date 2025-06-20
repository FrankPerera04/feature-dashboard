import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription } = await req.json();

    const prompt = `
You are a market-research specialist focused on SaaS point-of-sale (POS) platforms for merchants in the United States, and you know Applova.io's current product lineup inside and out.  Your task is to analyze the feature described below in the context of Applova's existing capabilities:

1. **What Applova Already Offers:** Identify any existing Applova modules or integrations that overlap with or support this feature.  
2. **Gaps & Opportunities:** Highlight functionality that Applova does not yet have but would need to build or integrate.  
3. **Proposed Solution:** Suggest a practical, detailed way Applova could design or roll out this feature, based on industry best practices. Return this as a single paragraph or string under 'proposedSolution'.

Then, conduct a DEEP competitor analysis—using up-to-date research with source links—structured in JSON exactly as follows:

(JSON format)
{
  "feature": {
    "title": "<Feature Title>",
    "description": "<Feature Description>"
  },
  "applovaContext": {
    "existingCapabilities": [
      // e.g. "Integrated loyalty program supporting tiered rewards"
    ],
    "gaps": [
      // e.g. "No offline-first functionality for unreliable connections"
    ],
    "proposedSolution": "A detailed, practical solution paragraph for how Applova could implement this feature."
  },
  "competitors": [
    {
      "name": "...",
      "description": "...",
      "marketShare": ...,
      "rating": ...,
      "pricing": "...",
      "userExperience": "A detailed paragraph describing usability, interface flow, customer reviews (with source links).",
      "supportedUseCases": [
        "A detailed, contextual use case description with examples and source links."
      ],
      "possibleLimitations": [
        "A detailed limitation analysis with context, examples, and source links."
      ],
      "website": "..."
    }
    // …additional competitors…
  ],
  "marketInsights": {
    "totalMarketSize": "...",
    "growthRate": "...",
    "keyTrends": ["...", "..."]
  }
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