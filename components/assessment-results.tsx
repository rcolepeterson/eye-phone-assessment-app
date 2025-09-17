"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RotateCcw,
  Info,
  Eye,
  Brain,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Microscope,
  Target,
  Lightbulb,
  CheckSquare,
} from "lucide-react"
import { useState } from "react"

interface AssessmentResult {
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk"
  explanation: string
  callToAction?: string
  confidence?: number
  detectedFeatures?: string[]
  recommendations?: string[]
  visualAidSuggestions?: string[]
  detailedAnalysis?: {
    eyeAlignment: string
    pupilResponse: string
    cornealClarity: string
    squintingStrain: string
    overallEyeHealth: string
  }
  technicalMetrics?: {
    imageQuality: {
      resolution: string
      sharpnessScore: number
      contrastRatio: number
      brightnessLevel: number
    }
    eyeGeometry: {
      pupilDiameterLeft: number
      pupilDiameterRight: number
      pupilAsymmetryRatio: number
      eyeAlignmentAngle: number
      interPupillaryDistance: number
    }
    riskIndicators: {
      squintingProbability: number
      alignmentDeviation: number
      cornealReflexSymmetry: number
      focusAccuracy: number
    }
    confidenceIntervals: {
      overallAssessment: {
        lower: number
        upper: number
      }
      myopiaRisk: {
        lower: number
        upper: number
      }
    }
  }
  isMockResult?: boolean
  errorMessage?: string
}

interface AssessmentResultsProps {
  result: AssessmentResult
  onStartOver: () => void
}

export function AssessmentResults({ result, onStartOver }: AssessmentResultsProps) {
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(false)
  const [isTechnicalMetricsOpen, setIsTechnicalMetricsOpen] = useState(false)

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case "Low Risk":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "Medium Risk":
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case "High Risk":
        return <XCircle className="h-8 w-8 text-red-600" />
    }
  }

  const getRiskColor = () => {
    switch (result.riskLevel) {
      case "Low Risk":
        return "text-green-700 bg-green-50 border-green-200"
      case "Medium Risk":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "High Risk":
        return "text-red-700 bg-red-50 border-red-200"
    }
  }

  const getRiskBadgeVariant = () => {
    switch (result.riskLevel) {
      case "Low Risk":
        return "default" as const
      case "Medium Risk":
        return "secondary" as const
      case "High Risk":
        return "destructive" as const
    }
  }

  const confidencePercentage = result.confidence ? Math.round(result.confidence * 100) : 85

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Assessment Complete</h1>
          </div>
          <p className="text-muted-foreground">Here are your child's eye health assessment results</p>
        </div>

        {result.isMockResult && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> This is a simulated result for demonstration purposes.
              {result.errorMessage && <span className="block mt-1 text-sm">Reason: {result.errorMessage}</span>}
              For real AI analysis, ensure your OpenAI API key is properly configured.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Results Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRiskIcon()}
                <div>
                  <CardTitle className="text-2xl">{result.riskLevel}</CardTitle>
                  <CardDescription>
                    Eye Health Assessment Result
                    {result.isMockResult && <span className="ml-2 text-orange-600 font-medium">(Demo)</span>}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={getRiskBadgeVariant()} className="text-sm">
                {result.riskLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Level Explanation */}
            <div className={`p-4 rounded-lg border ${getRiskColor()}`}>
              <p className="font-medium mb-2">Assessment Findings:</p>
              <p>{result.explanation}</p>
            </div>

            {/* Confidence Score */}
            {result.confidence && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {result.isMockResult ? "Simulated Confidence Score" : "AI Confidence Score"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{confidencePercentage}%</span>
                </div>
                <Progress value={confidencePercentage} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {result.isMockResult
                    ? "This is a simulated confidence score for demonstration purposes."
                    : "This score indicates how confident our AI is in this assessment based on image quality and analysis."}
                </p>
              </div>
            )}

            {/* Detected Features */}
            {result.detectedFeatures && result.detectedFeatures.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Key Observations:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.detectedFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Scientific Analysis */}
            {result.detailedAnalysis && (
              <Collapsible open={isDetailedAnalysisOpen} onOpenChange={setIsDetailedAnalysisOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Detailed Scientific Analysis</CardTitle>
                      </div>
                      {isDetailedAnalysisOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <CardDescription>Comprehensive breakdown of eye health criteria assessment</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid gap-4">
                      <div className="p-3 border rounded-lg bg-muted/20">
                        <h5 className="font-medium text-sm mb-2 text-primary">Eye Alignment</h5>
                        <p className="text-sm text-muted-foreground">{result.detailedAnalysis.eyeAlignment}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/20">
                        <h5 className="font-medium text-sm mb-2 text-primary">Pupil Response</h5>
                        <p className="text-sm text-muted-foreground">{result.detailedAnalysis.pupilResponse}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/20">
                        <h5 className="font-medium text-sm mb-2 text-primary">Corneal Clarity</h5>
                        <p className="text-sm text-muted-foreground">{result.detailedAnalysis.cornealClarity}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/20">
                        <h5 className="font-medium text-sm mb-2 text-primary">Squinting/Strain</h5>
                        <p className="text-sm text-muted-foreground">{result.detailedAnalysis.squintingStrain}</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-muted/20">
                        <h5 className="font-medium text-sm mb-2 text-primary">Overall Eye Health</h5>
                        <p className="text-sm text-muted-foreground">{result.detailedAnalysis.overallEyeHealth}</p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Technical Metrics Section */}
            {result.technicalMetrics && (
              <Collapsible open={isTechnicalMetricsOpen} onOpenChange={setIsTechnicalMetricsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Technical Metrics & Data</CardTitle>
                      </div>
                      {isTechnicalMetricsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <CardDescription>Quantitative analysis and measurements for technical review</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    {/* Image Quality Metrics */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-primary border-b pb-1">Image Quality Analysis</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Resolution</div>
                          <div className="font-mono text-sm">{result.technicalMetrics.imageQuality.resolution}</div>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Sharpness Score</div>
                          <div className="font-mono text-sm">
                            {result.technicalMetrics.imageQuality.sharpnessScore}/100
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Contrast Ratio</div>
                          <div className="font-mono text-sm">
                            {result.technicalMetrics.imageQuality.contrastRatio.toFixed(1)}:1
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Brightness Level</div>
                          <div className="font-mono text-sm">
                            {result.technicalMetrics.imageQuality.brightnessLevel}/255
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Eye Geometry Measurements */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-primary border-b pb-1">Eye Geometry Measurements</h5>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="text-xs text-muted-foreground">Left Pupil Diameter</div>
                            <div className="font-mono text-sm">
                              {result.technicalMetrics.eyeGeometry.pupilDiameterLeft.toFixed(1)} mm
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="text-xs text-muted-foreground">Right Pupil Diameter</div>
                            <div className="font-mono text-sm">
                              {result.technicalMetrics.eyeGeometry.pupilDiameterRight.toFixed(1)} mm
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="text-xs text-muted-foreground">Pupil Asymmetry</div>
                            <div className="font-mono text-sm">
                              {result.technicalMetrics.eyeGeometry.pupilAsymmetryRatio.toFixed(2)}
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="text-xs text-muted-foreground">Alignment Angle</div>
                            <div className="font-mono text-sm">
                              {result.technicalMetrics.eyeGeometry.eyeAlignmentAngle.toFixed(1)}°
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <div className="text-xs text-muted-foreground">IPD</div>
                            <div className="font-mono text-sm">
                              {result.technicalMetrics.eyeGeometry.interPupillaryDistance.toFixed(1)} mm
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Indicator Scores */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-primary border-b pb-1">Risk Indicator Scores</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Squinting Probability</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={result.technicalMetrics.riskIndicators.squintingProbability}
                              className="w-20 h-2"
                            />
                            <span className="font-mono text-sm w-12">
                              {result.technicalMetrics.riskIndicators.squintingProbability.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Alignment Deviation</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={result.technicalMetrics.riskIndicators.alignmentDeviation}
                              className="w-20 h-2"
                            />
                            <span className="font-mono text-sm w-12">
                              {result.technicalMetrics.riskIndicators.alignmentDeviation.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Corneal Reflex Symmetry</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={result.technicalMetrics.riskIndicators.cornealReflexSymmetry}
                              className="w-20 h-2"
                            />
                            <span className="font-mono text-sm w-12">
                              {result.technicalMetrics.riskIndicators.cornealReflexSymmetry.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Focus Accuracy</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={result.technicalMetrics.riskIndicators.focusAccuracy}
                              className="w-20 h-2"
                            />
                            <span className="font-mono text-sm w-12">
                              {result.technicalMetrics.riskIndicators.focusAccuracy.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Intervals */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-primary border-b pb-1">
                        Statistical Confidence Intervals
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Overall Assessment (95% CI)</div>
                          <div className="font-mono text-sm">
                            {result.technicalMetrics.confidenceIntervals.overallAssessment.lower.toFixed(0)}% -{" "}
                            {result.technicalMetrics.confidenceIntervals.overallAssessment.upper.toFixed(0)}%
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/20">
                          <div className="text-xs text-muted-foreground">Myopia Risk (95% CI)</div>
                          <div className="font-mono text-sm">
                            {result.technicalMetrics.confidenceIntervals.myopiaRisk.lower.toFixed(0)}% -{" "}
                            {result.technicalMetrics.confidenceIntervals.myopiaRisk.upper.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>

        {result.recommendations && result.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Actionable Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button asChild className="flex-1">
                  <a
                    href="https://1001optometry.com/book-appointment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Book an Appointment
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <a
                    href="https://1001optometry.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Learn More at 1001 Optometry
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {result.visualAidSuggestions && result.visualAidSuggestions.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <Lightbulb className="h-5 w-5" />
                What to Look For
              </CardTitle>
              <CardDescription className="text-blue-700">
                Visual indicators you can observe in the photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.visualAidSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                    <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Call to Action - Fallback for older results */}
        {result.callToAction && (!result.recommendations || result.recommendations.length === 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-balance">{result.callToAction}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <a
                    href="https://1001optometry.com/book-appointment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Book an Appointment
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <a
                    href="https://1001optometry.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Learn More at 1001 Optometry
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information for Low Risk */}
        {result.riskLevel === "Low Risk" && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Great News!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Your child's eyes appear healthy based on our assessment. Continue with regular eye care practices:
              </p>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>Schedule regular pediatric eye exams</li>
                <li>Encourage outdoor play for healthy eye development</li>
                <li>Limit excessive screen time</li>
                <li>Watch for any changes in vision or eye behavior</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Disclaimer:</strong> This assessment is for informational purposes only and does not
            constitute a medical diagnosis. Always consult with a qualified eye care professional for proper evaluation,
            diagnosis, and treatment of any eye health concerns. Regular pediatric eye exams are recommended regardless
            of assessment results.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onStartOver} className="flex-1 bg-transparent" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Assessment
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent" size="lg">
            <a
              href={`mailto:?subject=EyePhone Assessment Results&body=I just completed an eye health assessment for my child using The EyePhone app. The result was: ${result.riskLevel}. ${result.explanation}`}
            >
              Share Results
            </a>
          </Button>
        </div>

        {/* Footer Information */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {result.isMockResult
              ? "Demo mode • Simulated results for testing purposes"
              : "Powered by advanced AI technology • Results generated in real-time"}
          </p>
        </div>
      </div>
    </div>
  )
}
