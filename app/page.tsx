"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, TrendingUp, Users, Star, ExternalLink, ArrowLeft, Loader2, Download, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface CompetitorData {
  name: string
  description: string
  marketShare: number
  rating: number
  pricing: string
  userExperience: string
  supportedUseCases: string[]
  possibleLimitations: string[]
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
  const router = useRouter()
  const [featureTitle, setFeatureTitle] = useState("")
  const [featureDescription, setFeatureDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const analysisRef = useRef<HTMLDivElement>(null)

  const realAnalysisAPI = async (title: string, description: string): Promise<AnalysisResult> => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureTitle: title, featureDescription: description }),
    });
    if (!res.ok) throw new Error("Failed to fetch analysis");
    return res.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!featureTitle.trim() || !featureDescription.trim()) return

    setIsLoading(true)
    try {
      const result = await realAnalysisAPI(featureTitle, featureDescription)
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

  const downloadPDF = async () => {
    if (!analysisRef.current || !analysisResult) return

    try {
      const canvas = await html2canvas(analysisRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      } as any)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${analysisResult.feature.title.replace(/\s+/g, '_')}_analysis.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const generateSolution = () => {
    if (analysisResult) {
      const params = new URLSearchParams({
        title: analysisResult.feature.title,
        description: analysisResult.feature.description
      })
      router.push(`/solution?${params.toString()}`)
    }
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

          <div ref={analysisRef} className="grid gap-6">
            {/* Market Insights */}
            <div className="flex justify-center mb-8 w-full">
              <Card className="border-blue-100 shadow-lg w-full">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex flex-col items-center justify-center font-bold text-2xl text-center w-full">
                    <TrendingUp className="w-7 h-7 mb-1" />
                    <span>Market Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 w-full">
                  {/* Key Market Trends First */}
                  <div className="mb-4 w-full">
                    <h4 className="font-semibold text-slate-800 mb-2">Key Market Trends</h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {analysisResult.marketInsights.keyTrends.map((trend, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 justify-start p-2 whitespace-normal max-w-full">
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Growth Rate and Number of Competitors */}
                  <div className="grid md:grid-cols-2 gap-4 w-full">
                    <div className="text-center p-4 bg-purple-50 rounded-lg w-full">
                      <div className="text-2xl font-bold text-purple-700">{analysisResult.marketInsights.growthRate}</div>
                      <div className="text-sm text-slate-600">Market Growth Rate</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg w-full">
                      <div className="text-2xl font-bold text-indigo-700">{analysisResult.competitors.length}</div>
                      <div className="text-sm text-slate-600">Number of Competitors Using This Feature</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">User Experience</h4>
                        <p className="text-slate-700 text-sm">{typeof competitor.userExperience === 'string' ? competitor.userExperience : 'No user experience information available.'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Supported Use Cases</h4>
                        {Array.isArray(competitor.supportedUseCases) && competitor.supportedUseCases.length > 0 ? (
                          <ul className="list-disc list-inside text-slate-700 text-sm">
                            {competitor.supportedUseCases.map((useCase, idx) => (
                              <li key={idx}>{useCase}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-700 text-sm">No supported use cases available.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-1">Possible Limitations</h4>
                        {Array.isArray(competitor.possibleLimitations) && competitor.possibleLimitations.length > 0 ? (
                          <ul className="list-disc list-inside text-slate-700 text-sm">
                            {competitor.possibleLimitations.map((limitation, idx) => (
                              <li key={idx}>{limitation}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-700 text-sm">No limitations information available.</p>
                        )}
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
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
            <Button
              onClick={generateSolution}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-8 text-lg"
            >
              Generate Solution
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Smart Product Assistant</h1>
            <p className="text-lg text-slate-600">
              BA dashboard to help implement new features for Applova.io
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
