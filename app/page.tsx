"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, TrendingUp, Users, Star, ExternalLink, ArrowLeft, Loader2 } from "lucide-react"

interface CompetitorData {
  name: string
  description: string
  marketShare: number
  rating: number
  pricing: string
  keyFeatures: string[]
  strengths: string[]
  weaknesses: string[]
  website: string
}

interface AnalysisResult {
  feature: {
    title: string
    description: string
  }
  competitors: CompetitorData[]
  marketInsights: {
    totalMarketSize: string
    growthRate: string
    keyTrends: string[]
  }
  recommendations: string[]
}

export default function CompetitorAnalysisApp() {
  const [featureTitle, setFeatureTitle] = useState("")
  const [featureDescription, setFeatureDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // Mock API call
  const mockAnalysisAPI = async (title: string, description: string): Promise<AnalysisResult> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      feature: { title, description },
      competitors: [
        {
          name: "CompetitorOne",
          description: "Leading solution in the market with comprehensive features",
          marketShare: 35,
          rating: 4.5,
          pricing: "$99/month",
          keyFeatures: ["Advanced Analytics", "Real-time Sync", "API Integration", "Custom Reports"],
          strengths: ["Market leader", "Robust feature set", "Strong customer support"],
          weaknesses: ["Higher pricing", "Complex setup", "Limited customization"],
          website: "https://competitorone.com",
        },
        {
          name: "CompetitorTwo",
          description: "Affordable alternative with focus on small businesses",
          marketShare: 22,
          rating: 4.2,
          pricing: "$49/month",
          keyFeatures: ["Basic Analytics", "Cloud Storage", "Mobile App", "Email Support"],
          strengths: ["Competitive pricing", "User-friendly", "Good for SMBs"],
          weaknesses: ["Limited features", "Slower updates", "Basic reporting"],
          website: "https://competitortwo.com",
        },
        {
          name: "CompetitorThree",
          description: "Enterprise-focused solution with advanced security",
          marketShare: 18,
          rating: 4.7,
          pricing: "$299/month",
          keyFeatures: ["Enterprise Security", "Advanced Workflows", "Custom Integration", "24/7 Support"],
          strengths: ["Enterprise-grade", "High security", "Excellent support"],
          weaknesses: ["Very expensive", "Overkill for SMBs", "Steep learning curve"],
          website: "https://competitorthree.com",
        },
      ],
      marketInsights: {
        totalMarketSize: "$2.4B",
        growthRate: "12.5% YoY",
        keyTrends: [
          "Increasing demand for AI-powered features",
          "Shift towards mobile-first solutions",
          "Growing emphasis on data privacy",
          "Integration with existing workflows",
        ],
      },
      recommendations: [
        "Focus on competitive pricing to capture market share",
        "Emphasize unique value proposition in AI capabilities",
        "Consider freemium model to attract small businesses",
        "Invest in mobile experience to match market trends",
      ],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!featureTitle.trim() || !featureDescription.trim()) return

    setIsLoading(true)
    try {
      const result = await mockAnalysisAPI(featureTitle, featureDescription)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAnalysisResult(null)
    setFeatureTitle("")
    setFeatureDescription("")
  }

  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={resetForm}
              variant="outline"
              className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Competitor Analysis Results</h1>
            <p className="text-slate-600">
              Analysis for: <span className="font-semibold text-blue-700">{analysisResult.feature.title}</span>
            </p>
          </div>

          <div className="grid gap-6">
            {/* Market Insights */}
            <Card className="border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {analysisResult.marketInsights.totalMarketSize}
                    </div>
                    <div className="text-sm text-slate-600">Market Size</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{analysisResult.marketInsights.growthRate}</div>
                    <div className="text-sm text-slate-600">Growth Rate</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-700">{analysisResult.competitors.length}</div>
                    <div className="text-sm text-slate-600">Key Competitors</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Key Market Trends</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {analysisResult.marketInsights.keyTrends.map((trend, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 justify-start p-2">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitors */}
            <div className="grid gap-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Competitor Analysis
              </h2>
              {analysisResult.competitors.map((competitor, index) => (
                <Card key={index} className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-slate-800">{competitor.name}</CardTitle>
                        <CardDescription className="mt-1">{competitor.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{competitor.pricing}</div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {competitor.rating}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
                        <div className="space-y-1">
                          {competitor.keyFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="mr-1 mb-1 border-blue-200 text-blue-700">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {competitor.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-700 mb-2">Weaknesses</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {competitor.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Market Share:</span>
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${competitor.marketShare}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{competitor.marketShare}%</span>
                      </div>
                      <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit Site
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            <Card className="border-green-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription className="text-green-100">
                  Based on competitor analysis and market insights
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Competitor Analysis Tool</h1>
            <p className="text-lg text-slate-600">
              Enter your feature details to get comprehensive competitor insights
            </p>
          </div>

          <Card className="shadow-xl border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="text-xl">Feature Analysis Request</CardTitle>
              <CardDescription className="text-blue-100">
                Provide details about the feature you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">
                    Feature Title *
                  </Label>
                  <Input
                    id="title"
                    value={featureTitle}
                    onChange={(e) => setFeatureTitle(e.target.value)}
                    placeholder="e.g., AI-Powered Customer Support Chatbot"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Feature Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    placeholder="Describe the key functionality, target users, and main benefits of this feature..."
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !featureTitle.trim() || !featureDescription.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Competitors...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Competitors
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Our AI will analyze your feature against market competitors and provide strategic insights</p>
          </div>
        </div>
      </div>
    </div>
  )
}
