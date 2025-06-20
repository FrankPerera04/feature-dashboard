"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Palette, Smartphone, Monitor, Tablet, Loader2, ArrowRight, Download } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface UIFlowData {
  feature: {
    title: string
    description: string
  }
  designOverview: {
    concept: string
    userJourney: string[]
    keyScreens: string[]
  }
  responsiveDesign: {
    mobile: string[]
    tablet: string[]
    desktop: string[]
  }
  figmaSpecs: {
    colors: string[]
    typography: string[]
    components: string[]
    interactions: string[]
  }
  accessibility: string[]
  implementationNotes: string[]
}

export default function UIFlowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [uiFlowData, setUIFlowData] = useState<UIFlowData | null>(null)

  const featureTitle = searchParams.get('title')
  const featureDescription = searchParams.get('description')
  const solutionData = searchParams.get('solution')

  useEffect(() => {
    if (featureTitle && featureDescription && solutionData) {
      generateUIFlow()
    }
  }, [featureTitle, featureDescription, solutionData])

  const generateUIFlow = async () => {
    if (!featureTitle || !featureDescription || !solutionData) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ui-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          featureTitle, 
          featureDescription,
          solutionData: JSON.parse(solutionData)
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate UI flow")
      
      const result = await response.json()
      setUIFlowData(result)
    } catch (error) {
      console.error("UI flow generation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptUIFlow = () => {
    if (uiFlowData) {
      const params = new URLSearchParams({
        title: uiFlowData.feature.title,
        description: uiFlowData.feature.description,
        solution: solutionData || '',
        uiFlow: JSON.stringify(uiFlowData)
      })
      router.push(`/user-story?${params.toString()}`)
    }
  }

  const goBack = () => {
    router.push('/solution')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating UI Flow</h2>
          <p className="text-slate-600">Creating Figma design specifications...</p>
        </div>
      </div>
    )
  }

  if (!uiFlowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No UI Flow Data</h2>
          <p className="text-slate-600 mb-4">Unable to generate UI flow. Please try again.</p>
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
            Back to Solution
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Figma UI Flow Design</h1>
          <p className="text-slate-600">
            UI/UX design for: <span className="font-semibold text-blue-700">{uiFlowData.feature.title}</span>
          </p>
        </div>

        <div className="grid gap-6">
          {/* Design Overview */}
          <Card className="border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Design Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Design Concept</h4>
                <p className="text-slate-700 leading-relaxed">{uiFlowData.designOverview.concept}</p>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">User Journey</h4>
                <div className="space-y-2">
                  {uiFlowData.designOverview.userJourney.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Key Screens</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {uiFlowData.designOverview.keyScreens.map((screen, index) => (
                    <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800 justify-start p-2">
                      {screen}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Figma File
          </Button>
          <Button
            onClick={handleAcceptUIFlow}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-8 text-lg"
          >
            Accept UI Design & Generate User Story
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
} 