import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
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
      interPupillaryDistance: z.number().min(0).max(80),
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

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || ""
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "*").split(",").map((o) => o.trim())

  // If wildcard, allow any origin
  if (allowedOrigins.includes("*")) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    }
  }

  // Check if request origin is in allowed list
  const allowedOrigin = allowedOrigins.find((allowed) => allowed === origin)

  return {
    "Access-Control-Allow-Origin": allowedOrigin || allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let base64Image: string
    let childAge: string | null = null
    let additionalNotes: string | null = null

    if (contentType.includes("application/json")) {
      // Handle JSON with base64 image
      const body = await request.json()
      const imageData = body.image

      if (!imageData) {
        return NextResponse.json(
          { error: "No image provided" },
          {
            status: 400,
            headers: getCorsHeaders(request),
          },
        )
      }

      // Extract base64 from data URL if needed
      if (imageData.startsWith("data:")) {
        base64Image = imageData.split(",")[1]
      } else {
        base64Image = imageData
      }

      childAge = body.childAge || null
      additionalNotes = body.additionalNotes || null
    } else {
      // Handle FormData
      const formData = await request.formData()
      const image = formData.get("image") as File

      if (!image) {
        return NextResponse.json(
          { error: "No image provided" },
          {
            status: 400,
            headers: getCorsHeaders(request),
          },
        )
      }

      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      base64Image = buffer.toString("base64")

      childAge = formData.get("childAge") as string
      additionalNotes = formData.get("additionalNotes") as string
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.log("[API] No Google API key found")
      return NextResponse.json(
        {
          error: "Google API key not configured",
          isMockResult: true,
        },
        {
          status: 500,
          headers: getCorsHeaders(request),
        },
      )
    }

    console.log("[API] Processing eye assessment with Gemini...")

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are a pediatric eye health screening AI assistant. Analyze this photo for signs of myopia and other eye conditions in children.

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

${childAge ? `Child's age: ${childAge} years` : ""}
${additionalNotes ? `Additional notes: ${additionalNotes}` : ""}

IMPORTANT: You must respond with ONLY valid JSON in this exact format, no additional text:
{
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
    "imageQuality": {
      "resolution": "string",
      "sharpnessScore": number (0-100),
      "contrastRatio": number (0-10),
      "brightnessLevel": number (0-255)
    },
    "eyeGeometry": {
      "pupilDiameterLeft": number (0-20),
      "pupilDiameterRight": number (0-20),
      "pupilAsymmetryRatio": number (0-2),
      "eyeAlignmentAngle": number (-45 to 45),
      "interPupillaryDistance": number (0-80)
    },
    "riskIndicators": {
      "squintingProbability": number (0-100),
      "alignmentDeviation": number (0-100),
      "cornealReflexSymmetry": number (0-100),
      "focusAccuracy": number (0-100)
    },
    "confidenceIntervals": {
      "overallAssessment": {
        "lower": number (0-100),
        "upper": number (0-100)
      },
      "myopiaRisk": {
        "lower": number (0-100),
        "upper": number (0-100)
      }
    }
  }
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ])

    const response = result.response
    const text = response.text()

    console.log("[API] Gemini raw response:", text.substring(0, 200))

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const assessmentData = JSON.parse(jsonMatch[0])

    // Validate with schema
    const validated = AssessmentSchema.parse(assessmentData)

    console.log("[API] Gemini assessment completed successfully")

    return NextResponse.json(
      {
        ...validated,
        confidence: Math.round(validated.confidence * 100) / 100,
        isMockResult: false,
      },
      {
        headers: getCorsHeaders(request),
      },
    )
  } catch (error) {
    console.error("[API] Assessment failed:", error)

    let errorMessage = "AI service temporarily unavailable"
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        errorMessage = "Google API key not configured or invalid"
      } else if (error.message.includes("quota") || error.message.includes("billing")) {
        errorMessage = "API quota exceeded or billing issue"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        isMockResult: true,
      },
      {
        status: 500,
        headers: getCorsHeaders(request),
      },
    )
  }
}
