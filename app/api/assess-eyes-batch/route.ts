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
  progressionAnalysis: z
    .object({
      overallTrend: z.string(),
      imageComparison: z.string(),
      temporalChanges: z.array(z.string()),
    })
    .optional(),
})

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || ""
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "*").split(",").map((o) => o.trim())

  if (allowedOrigins.includes("*")) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    }
  }

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
  const startTime = Date.now()

  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 100 * 1024 * 1024) {
      // 100MB limit (Gemini 1.5 Pro max)
      return NextResponse.json(
        { error: "Request payload too large. Gemini 1.5 Pro supports up to 100MB of images." },
        {
          status: 413,
          headers: getCorsHeaders(request),
        },
      )
    }

    const body = await request.json()
    const images = body.images // Array of base64 images

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "No images array provided" },
        {
          status: 400,
          headers: getCorsHeaders(request),
        },
      )
    }

    if (images.length === 0 || images.length > 6) {
      return NextResponse.json(
        { error: "Please provide between 1 and 6 images" },
        {
          status: 400,
          headers: getCorsHeaders(request),
        },
      )
    }

    console.log(`[API Batch] Processing ${images.length} images...`)

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.log("[API Batch] No Google API key found")
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

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `You are a pediatric eye health screening AI assistant. You have been provided with ${images.length} photos to analyze for signs of myopia and other eye conditions in children.

IMPORTANT MEDICAL CONTEXT:
- Analyze ALL ${images.length} images together to form a comprehensive assessment
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

IMPORTANT: You must respond with ONLY valid JSON in this exact format, no additional text:
{
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk",
  "explanation": "string (minimum 50 characters, synthesize findings from all ${images.length} images)",
  "confidence": number (0-1),
  "detectedFeatures": ["string"],
  "recommendations": ["string"],
  "visualAidSuggestions": ["string"],
  "detailedAnalysis": {
    "eyeAlignment": "string (synthesized from all images)",
    "pupilResponse": "string (synthesized from all images)",
    "cornealClarity": "string (synthesized from all images)",
    "squintingStrain": "string (synthesized from all images)",
    "overallEyeHealth": "string (synthesized from all images)"
  },
  "technicalMetrics": {
    "imageQuality": {
      "resolution": "string (average or range across images)",
      "sharpnessScore": number (0-100, average),
      "contrastRatio": number (0-10, average),
      "brightnessLevel": number (0-255, average)
    },
    "eyeGeometry": {
      "pupilDiameterLeft": number (0-20, average),
      "pupilDiameterRight": number (0-20, average),
      "pupilAsymmetryRatio": number (0-2, average),
      "eyeAlignmentAngle": number (-45 to 45, average),
      "interPupillaryDistance": number (0-80, average)
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
  },
  "progressionAnalysis": {
    "overallTrend": "string (describe patterns across images)",
    "imageComparison": "string (note differences/similarities between images)",
    "temporalChanges": ["string (any changes if images from different times)"]
  }
}`

    const contentParts = [prompt]

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i]
      let base64Image: string

      // Extract base64 from data URL if needed
      if (imageData.startsWith("data:")) {
        base64Image = imageData.split(",")[1]
      } else {
        base64Image = imageData
      }

      contentParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      })
    }

    console.log(`[API Batch] Sending ${images.length} images to Gemini...`)

    let result
    try {
      result = await model.generateContent(contentParts)
    } catch (geminiError: any) {
      console.error("[v0] =================================")
      console.error("[v0] GEMINI ERROR DEBUGGING START")
      console.error("[v0] =================================")
      console.error("[v0] Error type:", typeof geminiError)
      console.error("[v0] Error constructor:", geminiError?.constructor?.name)
      console.error("[v0] Error.message:", geminiError?.message)
      console.error("[v0] Error toString:", String(geminiError))
      console.error("[v0] =================================")
      console.error("[v0] GEMINI ERROR DEBUGGING END")
      console.error("[v0] =================================")

      // Extract error message
      let errorMessage = "Unknown Gemini API error"
      if (geminiError?.message) {
        errorMessage = geminiError.message
      } else if (typeof geminiError === "string") {
        errorMessage = geminiError
      } else {
        errorMessage = String(geminiError)
      }

      console.error("[API Batch] Extracted error message:", errorMessage)

      // Check if this is a payload size error
      // The error message contains "Request En" which is the start of "Request Entity Too Large"
      const is413Error =
        errorMessage.includes("Request En") || // Catches "Request Entity Too Large"
        errorMessage.includes("413") ||
        errorMessage.includes("too large") ||
        errorMessage.includes("entity too large") ||
        errorMessage.includes("payload") ||
        errorMessage.toLowerCase().includes("request size")

      console.error("[API Batch] Is 413 error:", is413Error)

      if (is413Error) {
        return NextResponse.json(
          {
            error: "Images too large for batch processing",
            details:
              "The combined size of your images exceeds the API limit (100MB). The Google Gemini API cannot process images this large in a single request.",
            suggestion: `You uploaded ${images.length} images. Try uploading 3 or fewer images, or compress your images before uploading. Consider reducing image resolution or using JPEG compression.`,
            technicalDetails: errorMessage,
            isMockResult: true,
            processingTimeMs: Date.now() - startTime,
          },
          {
            status: 413,
            headers: getCorsHeaders(request),
          },
        )
      }

      // For other errors, return a generic error with details
      return NextResponse.json(
        {
          error: "Gemini API error occurred",
          details: errorMessage.substring(0, 300),
          isMockResult: true,
          processingTimeMs: Date.now() - startTime,
        },
        {
          status: 500,
          headers: getCorsHeaders(request),
        },
      )
    }

    const response = result.response
    const text = response.text()

    console.log("[API Batch] Gemini raw response:", text.substring(0, 200))

    let assessmentData
    try {
      // Try to parse the entire response as JSON first
      assessmentData = JSON.parse(text)
    } catch (parseError) {
      // If that fails, try to extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("[API Batch] No JSON found in response:", text)
        throw new Error("No valid JSON found in Gemini response")
      }
      assessmentData = JSON.parse(jsonMatch[0])
    }

    // Validate with schema
    const validated = AssessmentSchema.parse(assessmentData)

    const processingTime = Date.now() - startTime

    console.log(`[API Batch] Batch assessment completed in ${processingTime}ms`)

    return NextResponse.json(
      {
        ...validated,
        confidence: Math.round(validated.confidence * 100) / 100,
        isMockResult: false,
        imagesAnalyzed: images.length,
        processingTimeMs: processingTime,
      },
      {
        headers: getCorsHeaders(request),
      },
    )
  } catch (error) {
    console.error("[API Batch] Assessment failed:", error)

    let errorMessage = "AI service temporarily unavailable"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        errorMessage = "Google API key not configured or invalid"
      } else if (error.message.includes("quota") || error.message.includes("billing")) {
        errorMessage = "API quota exceeded or billing issue"
      } else if (error.message.includes("too large") || error.message.includes("413")) {
        errorMessage = "Request payload too large. Gemini 1.5 Pro supports up to 100MB of images."
        statusCode = 413
      } else if (error.message.includes("JSON")) {
        errorMessage = "Failed to parse AI response. Please try again."
      } else {
        // Include actual error message for debugging
        errorMessage = `Error: ${error.message}`
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json(
      {
        error: errorMessage,
        isMockResult: true,
        processingTimeMs: processingTime,
      },
      {
        status: statusCode,
        headers: getCorsHeaders(request),
      },
    )
  }
}
