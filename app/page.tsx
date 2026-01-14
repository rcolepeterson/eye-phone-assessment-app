"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, XCircle, Loader2, FileText } from "lucide-react"

export default function ApiDocumentation() {
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const testGeminiConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-gemini")
      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: "Failed to connect to test endpoint",
        details: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">EyePhone API Service</h1>
          </div>
          <p className="text-xl text-muted-foreground">AI-powered pediatric eye health assessment API</p>
        </div>

        {/* Updated Test Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Single Image Test</CardTitle>
              <CardDescription>Test with 1 image (3-10 seconds)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/test">Open Test Interface</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Batch Test (6 Images)</CardTitle>
              <CardDescription>Test with up to 6 images (10-25 seconds)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <a href="/test-batch">Open Batch Test Interface</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">View AI Prompts</CardTitle>
              <CardDescription>See and edit the AI instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <a href="/prompts">
                  <FileText className="h-4 w-4 mr-2" />
                  View Prompts
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Gemini API Test Button */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle>Test Gemini API Connection</CardTitle>
            <CardDescription>Verify your Google Gemini API key is configured correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testGeminiConnection} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Gemini API"
              )}
            </Button>

            {testResult && (
              <div
                className={`p-4 rounded-lg ${testResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{testResult.success ? "Success!" : "Failed"}</p>
                    <p className="text-sm mb-2">{testResult.message || testResult.error}</p>
                    {testResult.response && (
                      <p className="text-xs text-muted-foreground">Response: {testResult.response}</p>
                    )}
                    {testResult.details && (
                      <pre className="text-xs mt-2 p-2 bg-background rounded overflow-x-auto">{testResult.details}</pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="h-8 w-8 text-primary mb-2">Fast & Accurate</div>
              <CardTitle>Fast & Accurate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                GPT-4 Vision powered analysis with detailed medical assessments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-8 w-8 text-primary mb-2">Easy Integration</div>
              <CardTitle>Easy Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Simple REST API with comprehensive response data</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-8 w-8 text-primary mb-2">Secure</div>
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">CORS-enabled with configurable origin restrictions</p>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoint */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Available eye health assessment endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">POST /api/assess-eyes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyzes a single eye photo and returns detailed health assessment (3-10 seconds)
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Request (JSON)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`{
  "image": "data:image/jpeg;base64,...",
  "childAge": "8" (optional),
  "additionalNotes": "notes" (optional)
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Response</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`{
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk",
  "explanation": "string",
  "confidence": 0.85,
  "detectedFeatures": ["string"],
  "recommendations": ["string"],
  "detailedAnalysis": { ... },
  "technicalMetrics": { ... },
  "isMockResult": false
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-2">POST /api/assess-eyes-batch</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyzes up to 6 eye photos together with combined assessment and progression analysis (10-25 seconds)
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Request (JSON)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`{
  "images": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    // ... up to 6 images
  ]
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Response</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`{
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk",
  "explanation": "combined analysis from all images",
  "confidence": 0.85,
  "detectedFeatures": ["string"],
  "recommendations": ["string"],
  "detailedAnalysis": { ... },
  "technicalMetrics": { ... },
  "progressionAnalysis": {
    "overallTrend": "string",
    "imageComparison": "string",
    "temporalChanges": ["string"]
  },
  "imagesAnalyzed": 6,
  "processingTimeMs": 15234,
  "isMockResult": false
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Usage Example (JavaScript/TypeScript)</CardTitle>
            <CardDescription>How to call the API from your Vite app</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              {`const assessEyes = async (imageFile: File) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('childAge', '8')
  formData.append('additionalNotes', 'Some notes')

  const response = await fetch(
    'YOUR_API_URL/api/assess-eyes',
    {
      method: 'POST',
      body: formData,
    }
  )

  const result = await response.json()
  return result
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Health Check */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check Endpoint</CardTitle>
            <CardDescription>Verify service availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold mb-2">GET /api/health</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`{
  "status": "healthy",
  "service": "EyePhone API Service",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables Required</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <code className="bg-background px-2 py-1 rounded">OPENAI_API_KEY</code> - Your OpenAI API key (required)
            </li>
            <li>
              <code className="bg-background px-2 py-1 rounded">ALLOWED_ORIGIN</code> - CORS allowed origin (optional,
              defaults to *)
            </li>
            <li>
              <code className="bg-background px-2 py-1 rounded">GOOGLE_GEMINI_API_KEY</code> - Your Google Gemini API
              key (required for Gemini API testing)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
