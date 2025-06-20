"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, User, CheckCircle, Download, Loader2, Home } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}

interface UserStoryData {
  feature: {
    title: string;
    description: string;
  };
  userStories: UserStory[];
  uiFlows: {
    flowName: string;
    steps: string[];
    screens: string[];
  }[];
  technicalRequirements: {
    frontend: string[];
    backend: string[];
    database: string[];
    integrations: string[];
  };
  testingScenarios: string[];
  successMetrics: string[];
}

export default function UserStoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [userStoryData, setUserStoryData] = useState<UserStoryData | null>(null)

  const featureTitle = searchParams.get('title')
  const featureDescription = searchParams.get('description')
  const solutionData = searchParams.get('solution')
  const uiFlowData = searchParams.get('uiFlow')

  useEffect(() => {
    if (featureTitle && featureDescription && solutionData && uiFlowData) {
      generateUserStory()
    }
  }, [featureTitle, featureDescription, solutionData, uiFlowData])

  const generateUserStory = async () => {
    if (!featureTitle || !featureDescription || !solutionData || !uiFlowData) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/user-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          featureTitle, 
          featureDescription,
          solutionData: JSON.parse(solutionData),
          uiFlowData: JSON.parse(uiFlowData)
        }),
      })
      
      if (!response.ok) throw new Error("Failed to generate user story")
      
      const result = await response.json()
      setUserStoryData(result)
    } catch (error) {
      console.error("User story generation failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goHome = () => {
    router.push('/')
  }

  const goBack = () => {
    router.push('/ui-flow')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating User Story</h2>
          <p className="text-slate-600">Creating comprehensive user story with UI flows...</p>
        </div>
      </div>
    )
  }

  if (!userStoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No User Story Data</h2>
          <p className="text-slate-600 mb-4">Unable to generate user story. Please try again.</p>
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
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={goBack}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to UI Flow
            </Button>
            <Button
              onClick={goHome}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Home className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">User Story & Implementation Guide</h1>
          <p className="text-slate-600">
            Complete specification for: <span className="font-semibold text-blue-700">{userStoryData.feature.title}</span>
          </p>
        </div>

        <div className="grid gap-6">
          {/* User Stories */}
          {userStoryData.userStories && userStoryData.userStories.length > 0 && userStoryData.userStories.map((story, idx) => (
            <Card key={idx} className="border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Story {userStoryData.userStories.length > 1 ? `#${idx + 1}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">As a...</h4>
                    <p className="text-slate-700">{story.asA}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">I want to...</h4>
                    <p className="text-slate-700">{story.iWant}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 mb-2">So that...</h4>
                    <p className="text-slate-700">{story.soThat}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Acceptance Criteria</h4>
                  <div className="space-y-2">
                    {story.acceptanceCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700">{criterion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* UI Flows */}
          <Card className="border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <CardTitle>UI Flows</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {userStoryData.uiFlows.map((flow, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">{flow.flowName}</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-slate-700 mb-2">Flow Steps</h5>
                        <div className="space-y-2">
                          {flow.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                              <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {stepIndex + 1}
                              </div>
                              <span className="text-sm text-slate-700">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-700 mb-2">Screens</h5>
                        <div className="space-y-2">
                          {flow.screens.map((screen, screenIndex) => (
                            <Badge key={screenIndex} variant="outline" className="border-teal-200 text-teal-700">
                              {screen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Requirements */}
          <Card className="border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <CardTitle>Technical Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Frontend</h4>
                  <div className="space-y-2">
                    {userStoryData.technicalRequirements.frontend.map((req, index) => (
                      <div key={index} className="text-sm text-slate-600 p-2 bg-orange-50 rounded">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Backend</h4>
                  <div className="space-y-2">
                    {userStoryData.technicalRequirements.backend.map((req, index) => (
                      <div key={index} className="text-sm text-slate-600 p-2 bg-red-50 rounded">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Database</h4>
                  <div className="space-y-2">
                    {userStoryData.technicalRequirements.database.map((req, index) => (
                      <div key={index} className="text-sm text-slate-600 p-2 bg-amber-50 rounded">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Integrations</h4>
                  <div className="space-y-2">
                    {userStoryData.technicalRequirements.integrations.map((req, index) => (
                      <div key={index} className="text-sm text-slate-600 p-2 bg-orange-50 rounded">
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing & Success Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-purple-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <CardTitle>Testing Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {userStoryData.testingScenarios.map((scenario, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">{scenario}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {userStoryData.successMetrics.map((metric, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-teal-50 rounded">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">{metric}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Action */}
          <div className="text-center">
            <Button
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-8 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Complete Specification
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 