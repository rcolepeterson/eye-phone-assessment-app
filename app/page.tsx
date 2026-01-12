import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Code, Zap, Shield } from "lucide-react"

export default function ApiDocumentation() {
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
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
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Easy Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Simple REST API with comprehensive response data</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
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
            <CardTitle>API Endpoint</CardTitle>
            <CardDescription>Eye health assessment endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">POST /api/assess-eyes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyzes eye photos and returns detailed health assessment
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Request (multipart/form-data)</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`FormData:
  image: File (required) - Eye photo
  childAge: string (optional)
  additionalNotes: string (optional)`}
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
  "visualAidSuggestions": ["string"],
  "detailedAnalysis": {
    "eyeAlignment": "string",
    "pupilResponse": "string",
    "cornealClarity": "string",
    "squintingStrain": "string",
    "overallEyeHealth": "string"
  },
  "technicalMetrics": {
    "imageQuality": {...},
    "eyeGeometry": {...},
    "riskIndicators": {...},
    "confidenceIntervals": {...}
  },
  "isMockResult": false
}`}
              </pre>
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
          </ul>
        </div>
      </div>
    </div>
  )
}
