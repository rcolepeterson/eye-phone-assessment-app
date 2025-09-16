"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Camera, Shield, Heart } from "lucide-react"
import { PhotoUpload } from "@/components/photo-upload"
import { AssessmentResults } from "@/components/assessment-results"
import { performEyeAssessment, validateImages, type AssessmentResult } from "@/lib/assessment-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AssessmentState = "initial" | "uploading" | "analyzing" | "results" | "error"

export default function EyePhoneAssessment() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("initial")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImagesUploaded = (images: File[]) => {
    // Validate images before proceeding
    const validation = validateImages(images)

    if (!validation.isValid) {
      setError(validation.issues.join(". "))
      setAssessmentState("error")
      return
    }

    setUploadedImages(images)
    setAssessmentState("uploading")
    setError(null)
  }

  const handleStartAssessment = async () => {
    setAssessmentState("analyzing")

    try {
      const result = await performEyeAssessment({
        images: uploadedImages,
      })

      setAssessmentResult(result)
      setAssessmentState("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assessment failed. Please try again.")
      setAssessmentState("error")
    }
  }

  const handleStartOver = () => {
    setAssessmentState("initial")
    setUploadedImages([])
    setAssessmentResult(null)
    setError(null)
  }

  if (assessmentState === "results" && assessmentResult) {
    return <AssessmentResults result={assessmentResult} onStartOver={handleStartOver} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">The EyePhone</h1>
          </div>
          <p className="text-lg text-muted-foreground text-balance">AI-powered eye health assessment for children</p>
        </div>

        {/* Error State */}
        {assessmentState === "error" && error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {assessmentState === "initial" && (
          <>
            {/* Welcome Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Welcome Parents
                </CardTitle>
                <CardDescription>
                  Help ensure your child's eye health with our easy-to-use assessment tool. Simply upload photos and get
                  instant insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-secondary" />
                    <span>Take photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-secondary" />
                    <span>AI analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-secondary" />
                    <span>Get results</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload Section */}
            <PhotoUpload onImagesUploaded={handleImagesUploaded} />
          </>
        )}

        {(assessmentState === "uploading" || assessmentState === "error") && (
          <Card>
            <CardHeader>
              <CardTitle>Photos Uploaded Successfully</CardTitle>
              <CardDescription>
                {uploadedImages.length} photo{uploadedImages.length !== 1 ? "s" : ""} ready for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleStartAssessment} className="w-full" size="lg">
                  Start Eye Health Assessment
                </Button>
                <Button variant="outline" onClick={handleStartOver} className="w-full bg-transparent">
                  Upload Different Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {assessmentState === "analyzing" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <h3 className="text-xl font-semibold">Analyzing photos...</h3>
                <p className="text-muted-foreground">
                  Our AI is carefully examining your child's eye photos. This may take a few moments.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Important:</strong> This assessment is for informational purposes only and does not replace
            professional medical advice. Always consult with a qualified eye care professional for proper diagnosis and
            treatment.
          </p>
        </div>
      </div>
    </div>
  )
}
