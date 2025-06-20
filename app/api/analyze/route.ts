import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  try {
    const { featureTitle, featureDescription } = await req.json();

    const prompt = `
You are an expert in restaurant Point of Sale (POS) systems in the US. Analyze the feature described below and provide a DEEP competitor analysis, using up-to-date research and including links to sources where possible. For each competitor, provide detailed, paragraph-style explanations for the following fields, not just bullet points. Be as comprehensive as possible.

Return the analysis in the following JSON format:

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
      "userExperience": "A detailed paragraph describing the overall user experience, including usability, interface, and customer feedback. Include links to reviews or testimonials if available.",
      "supportedUseCases": [
        "A detailed explanation of a supported use case, with context and examples. Include links to documentation, case studies, or product pages if available."
      ],
      "possibleLimitations": [
        "A detailed explanation of a limitation, with context, examples, and links to sources or user reports if available."
      ],
      "website": "..."
    }
    // ... more competitors
  ],
  "marketInsights": {
    "totalMarketSize": "...",
    "growthRate": "...",
    "keyTrends": ["..."]
  }
}

Feature Title: ${featureTitle}
Feature Description: ${featureDescription}

IMPORTANT: For userExperience, supportedUseCases, and possibleLimitations, provide detailed, research-backed paragraphs and include links to sources, reviews, or documentation wherever possible. Do not just list bullet points. Be as comprehensive and specific as possible.
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
    let content = data.choices[0].message.content;
    console.log("OpenAI raw content:", content);

    // Remove markdown code block if present
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    // Remove comment lines (starting with //) before parsing
    content = content.split('\n').filter((line: string) => !line.trim().startsWith('//')).join('\n');

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
