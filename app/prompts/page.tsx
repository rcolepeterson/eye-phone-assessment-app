import type { Metadata } from "next"
import { Code2, FileText, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "AI Prompts | EyePhone API",
  description: "View and understand the AI prompts used for eye assessment",
}

export default function PromptsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Eye className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Prompts Configuration</h1>
          <p className="text-lg text-gray-600">View the prompts used to guide the AI in analyzing eye health photos</p>
          <Badge variant="secondary" className="mt-4">
            <FileText className="mr-1 h-3 w-3" />
            Editable via GitHub: lib/prompts.ts
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              How to Edit These Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>For developers:</strong> Edit the prompts in{" "}
              <code className="rounded bg-gray-800 px-2 py-1 text-white">lib/prompts.ts</code>
            </p>
            <p>
              <strong>Via GitHub:</strong> Navigate to the file in your repository and commit changes directly
            </p>
            <p>
              <strong>Changes take effect:</strong> Immediately after deployment (no code restart required)
            </p>
          </CardContent>
        </Card>

        {/* Single Image Prompt */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Single Image Assessment Prompt</CardTitle>
            <CardDescription>
              Used when analyzing one photo at a time via <code>/api/assess-eyes</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-900 p-6">
              <pre className="overflow-x-auto text-sm leading-relaxed text-green-400">
                <code>{`You are a pediatric eye health screening AI assistant. Analyze this photo for signs of myopia and other eye conditions in children.

IMPORTANT MEDICAL CONTEXT:
- Look for subtle markers like squinting, abnormal eye alignment, reduced corneal clarity
- Check for asymmetric pupil response, eye positioning, and focus patterns
- Consider signs of refractive errors, strabismus, or amblyopia
- Base assessment on research showing 80% accuracy for myopia detection from photos

DETAILED ANALYSIS REQUIRED:
For each criterion, provide specific observations:

1. Eye Alignment: Assess coordination, symmetry, and any signs of strabismus or misalignment
2. Pupil Response: Evaluate size, shape, symmetry, and light reflex patterns
3. Corneal Clarity: Check transparency, reflection patterns, and any cloudiness
4. Squinting/Strain: Look for signs of difficulty focusing, partial eye closure, or strain
5. Overall Eye Health: Note any other visible abnormalities, inflammation, or concerns

[Additional context: Child age, notes if provided]

[JSON Schema Instructions...]`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Batch Images Prompt */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Multi-Image Batch Assessment Prompt</CardTitle>
            <CardDescription>
              Used when analyzing multiple photos together via <code>/api/assess-eyes-batch</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-900 p-6">
              <pre className="overflow-x-auto text-sm leading-relaxed text-green-400">
                <code>{`You are a pediatric eye health screening AI assistant. You have been provided with N photos to analyze for signs of myopia and other eye conditions in children.

IMPORTANT MEDICAL CONTEXT:
- Analyze ALL N images together to form a comprehensive assessment
- Look for patterns across multiple photos (consistency, progression, different angles)
- Check for subtle markers like squinting, abnormal eye alignment, reduced corneal clarity
- Assess pupil response, eye positioning, and focus patterns across images
- Consider signs of refractive errors, strabismus, or amblyopia
- Base assessment on research showing 80% accuracy for myopia detection from photos

MULTI-IMAGE ANALYSIS APPROACH:
- Compare findings across all images for consistency
- Note any variations or changes between photos
- Use multiple angles/perspectives to improve accuracy
- Identify patterns that may not be visible in a single image

DETAILED ANALYSIS REQUIRED:
For each criterion, provide specific observations synthesized from ALL images:

1. Eye Alignment: Assess coordination, symmetry, and any signs of strabismus or misalignment
2. Pupil Response: Evaluate size, shape, symmetry, and light reflex patterns
3. Corneal Clarity: Check transparency, reflection patterns, and any cloudiness
4. Squinting/Strain: Look for signs of difficulty focusing, partial eye closure, or strain
5. Overall Eye Health: Note any other visible abnormalities, inflammation, or concerns

PROGRESSION ANALYSIS (since you have multiple images):
- Describe any patterns or trends visible across the images
- Note consistency or variations in findings
- Identify any temporal changes if images appear to be from different times

[JSON Schema Instructions...]`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* JSON Schema */}
        <Card>
          <CardHeader>
            <CardTitle>Response Schema Requirements</CardTitle>
            <CardDescription>The AI must return data in this exact JSON structure for both endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-900 p-6">
              <pre className="overflow-x-auto text-sm leading-relaxed text-blue-400">
                <code>{`{
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk",
  "explanation": "string (minimum 50 characters)",
  "confidence": number (0-1),
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
    "imageQuality": { ... },
    "eyeGeometry": { ... },
    "riskIndicators": { ... },
    "confidenceIntervals": { ... }
  }
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
