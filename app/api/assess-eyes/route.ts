import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const AssessmentSchema = z.object({
  riskLevel: z.enum(["Low Risk", "Medium Risk", "High Risk"]),
  explanation: z.string().min(50),
  confidence: z.number().min(0).max(1),
  detectedFeatures: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  visualAidSuggestions: z.array(z.string()).default([]),
  detailedAnalysis: z.object({
    eyeAlignment: z.string(),
    pupilResponse: z.string(),
    cornealClarity: z.string(),
    squintingStrain: z.string(),
    overallEyeHealth: z.string(),
  }),
  technicalMetrics: z.object({
    imageQuality: z.object({
      resolution: z.string(),
      sharpnessScore: z.number().min(0).max(100),
      contrastRatio: z.number().min(0).max(10),
      brightnessLevel: z.number().min(0).max(255),
    }),
    eyeGeometry: z.object({
      pupilDiameterLeft: z.number().min(0).max(20),
      pupilDiameterRight: z.number().min(0).max(20),
      pupilAsymmetryRatio: z.number().min(0).max(2),
      eyeAlignmentAngle: z.number().min(-45).max(45),
      interPupillaryDistance: z.number().min(40).max(80),
    }),
    riskIndicators: z.object({
      squintingProbability: z.number().min(0).max(100),
      alignmentDeviation: z.number().min(0).max(100),
      cornealReflexSymmetry: z.number().min(0).max(100),
      focusAccuracy: z.number().min(0).max(100),
    }),
    confidenceIntervals: z.object({
      overallAssessment: z.object({
        lower: z.number().min(0).max(100),
        upper: z.number().min(0).max(100),
      }),
      myopiaRisk: z.object({
        lower: z.number().min(0).max(100),
        upper: z.number().min(0).max(100),
      }),
    }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const childAge = formData.get("childAge") as string
    const additionalNotes = formData.get("additionalNotes") as string

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("[v0] Server: No OpenAI API key found")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          isMockResult: true,
        },
        { status: 500 },
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    console.log("[v0] Server: Processing AI assessment...")

    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a pediatric eye health screening AI assistant. Analyze this photo for signs of myopia and other eye conditions in children.

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

TECHNICAL METRICS REQUIRED:
Provide quantitative measurements and analysis:

IMAGE QUALITY METRICS:
- resolution: Describe image dimensions and quality (e.g., "1920x1080, High Quality")
- sharpnessScore: Rate image sharpness 0-100 (higher = sharper)
- contrastRatio: Measure contrast 0-10 (higher = better contrast)
- brightnessLevel: Average brightness 0-255 (128 = optimal)

EYE GEOMETRY MEASUREMENTS:
- pupilDiameterLeft: Estimated pupil diameter in mm (2-8mm typical)
- pupilDiameterRight: Estimated pupil diameter in mm (2-8mm typical)
- pupilAsymmetryRatio: Left/Right pupil size ratio (1.0 = perfect symmetry)
- eyeAlignmentAngle: Deviation from horizontal in degrees (0 = perfect alignment)
- interPupillaryDistance: Distance between pupils in mm (50-70mm typical for children)

RISK INDICATOR SCORES (0-100%):
- squintingProbability: Likelihood of squinting behavior detected
- alignmentDeviation: Degree of eye misalignment detected
- cornealReflexSymmetry: Symmetry of corneal light reflexes
- focusAccuracy: Apparent focusing ability assessment

CONFIDENCE INTERVALS:
- overallAssessment: Lower and upper bounds for overall confidence
- myopiaRisk: Lower and upper bounds for myopia risk specifically

RESPONSE FORMAT REQUIREMENTS:
- riskLevel: Must be exactly "Low Risk", "Medium Risk", or "High Risk"
- explanation: Overall summary of findings (minimum 50 characters)
- confidence: Number between 0 and 1 representing assessment confidence
- detectedFeatures: Array of specific observable features (e.g., "Mild asymmetric pupils", "Slight squinting")
- recommendations: Array of specific actionable recommendations
- visualAidSuggestions: Array of what to look for in the photo (e.g., "Notice the left eye alignment", "Observe pupil size difference")
- detailedAnalysis: Object with specific findings for each criterion
- technicalMetrics: Object with all quantitative measurements and scores

RISK LEVELS:
- Low Risk: Normal findings across all criteria, symmetric features
- Medium Risk: Minor asymmetries or early signs requiring monitoring
- High Risk: Significant abnormalities requiring immediate professional attention

${childAge ? `Child's age: ${childAge} years` : ""}
${additionalNotes ? `Additional notes: ${additionalNotes}` : ""}

IMPORTANT: Provide realistic quantitative measurements based on visual analysis. Be precise with numerical values while maintaining medical accuracy.`,
            },
            {
              type: "image",
              image: base64,
            },
          ],
        },
      ],
      schema: AssessmentSchema,
      temperature: 0.3,
    })

    console.log("[v0] Server: AI assessment completed successfully")

    return NextResponse.json({
      riskLevel: result.object.riskLevel,
      explanation: result.object.explanation,
      confidence: Math.round(result.object.confidence * 100) / 100,
      detectedFeatures: result.object.detectedFeatures,
      recommendations: result.object.recommendations,
      visualAidSuggestions: result.object.visualAidSuggestions,
      detailedAnalysis: result.object.detailedAnalysis,
      technicalMetrics: result.object.technicalMetrics,
      isMockResult: false,
    })
  } catch (error) {
    console.error("[v0] Server: AI assessment failed:", error)

    let errorMessage = "AI service temporarily unavailable"
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        errorMessage = "OpenAI API key not configured or invalid"
      } else if (error.message.includes("quota") || error.message.includes("billing")) {
        errorMessage = "API quota exceeded or billing issue"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        isMockResult: true,
      },
      { status: 500 },
    )
  }
}
