"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, XCircle, Plus, Lightbulb, Loader2, ArrowRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SolutionData {
  feature: {
    title: string
    description: string
  }
  applovaCurrent: {
    existingFeatures: string[]
    strengths: string[]
  }
  missingComponents: string[]
  proposedSolution: {
    overview: string
    implementation: string[]
    benefits: string[]
  }
  keyTakeaways: string[]
}

export default function SolutionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [solutionData, setSolutionData] = useState<SolutionData | null>(null)

  const featureTitle = searchParams.get('title')
  const featureDescription = searchParams.get('description')

  useEffect(() => {
    if (featureTitle && featureDescription) {
      generateSolution()
    }
  }, [featureTitle, featureDescription])

  const generateSolution = async () => {
    if (!featureTitle || !featureDescription) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          featureTitle, 
          featureDescription 
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate solution")
      
      const result = await response.json()
      setSolutionData(result)
    } catch (error) {
      console.error("Solution generation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptSolution = () => {
    if (solutionData) {
      const params = new URLSearchParams({
        title: solutionData.feature.title,
        description: solutionData.feature.description,
        solution: JSON.stringify(solutionData)
      })
      router.push(`/ui-flow?${params.toString()}`)
    }
  }

  const goBack = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Solution</h2>
          <p className="text-slate-600">Analyzing how to integrate this feature into Applova...</p>
        </div>
      </div>
    )
  }

  if (!solutionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Solution Data</h2>
          <p className="text-slate-600 mb-4">Unable to generate solution. Please try again.</p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={goBack}
            variant="outline"
            className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Solution Generation</h1>
          <p className="text-slate-600">
            Integration plan for: <span className="font-semibold text-blue-700">{solutionData.feature.title}</span>
          </p>
        </div>

        <div className="grid gap-6">
          {/* Current Applova State */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Current Applova Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Existing Features</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {solutionData.applovaCurrent.existingFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 justify-start p-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Current Strengths</h4>
                <div className="space-y-2">
                  {solutionData.applovaCurrent.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Components */}
          <Card className="border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Missing Components
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {solutionData.missingComponents.map((component, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-slate-700">{component}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposed Solution */}
          <Card className="border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Proposed Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Overview</h4>
                <p className="text-slate-700 leading-relaxed">{solutionData.proposedSolution.overview}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Implementation Steps</h4>
                <div className="space-y-2">
                  {solutionData.proposedSolution.implementation.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Expected Benefits</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {solutionData.proposedSolution.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800 justify-start p-2">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Takeaways */}
          <Card className="border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle>Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {solutionData.keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-slate-700">{takeaway}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={handleAcceptSolution}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-8 text-lg"
            >
              Accept Solution & Generate UI Flow
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 