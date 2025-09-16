"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, ExternalLink, RotateCcw, Info, Eye, Brain } from "lucide-react"

interface AssessmentResult {
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk"
  explanation: string
  callToAction?: string
  confidence?: number
  detectedFeatures?: string[]
}

interface AssessmentResultsProps {
  result: AssessmentResult
  onStartOver: () => void
}

export function AssessmentResults({ result, onStartOver }: AssessmentResultsProps) {
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

        {/* Main Results Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRiskIcon()}
                <div>
                  <CardTitle className="text-2xl">{result.riskLevel}</CardTitle>
                  <CardDescription>Eye Health Assessment Result</CardDescription>
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
                    <span className="text-sm font-medium">AI Confidence Score</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{confidencePercentage}%</span>
                </div>
                <Progress value={confidencePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  This score indicates how confident our AI is in this assessment based on image quality and analysis.
                </p>
              </div>
            )}

            {/* Detected Features */}
            {result.detectedFeatures && result.detectedFeatures.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Key Observations:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.detectedFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        {result.callToAction && (
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
            <a href="mailto:?subject=EyePhone Assessment Results&body=I just completed an eye health assessment for my child using The EyePhone app. The result was: ${result.riskLevel}. ${result.explanation}">
              Share Results
            </a>
          </Button>
        </div>

        {/* Footer Information */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by advanced AI technology • Results generated in real-time
          </p>
        </div>
      </div>
    </div>
  )
}
