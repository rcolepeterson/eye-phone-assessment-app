import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { GoogleGenAI } from "@google/genai"
import { Bilal_Eye_Prompt } from "@/lib/prompts"

// ---- Your File Search store ----
const STORE_NAME = "fileSearchStores/eyeknowledge-tfe13blubv8d"

// ---- Request body schema (adds age + gender) ----
const RequestSchema = z.object({
  images: z.array(z.string()).min(1).max(6),
  // "requirement" + default behavior:
  // - if missing -> default 8 / Male
  // - if provided -> validated
  age: z.coerce.number().int().min(0).max(120).optional().default(8),
  gender: z
    .string()
    .optional()
    .default("Male")
    .transform((g) => {
      const cleaned = String(g).trim()
      if (!cleaned) return "Male"
      // Normalize common inputs
      const lower = cleaned.toLowerCase()
      if (lower === "m" || lower === "male" || lower === "boy") return "Male"
      if (lower === "f" || lower === "female" || lower === "girl") return "Female"
      // Keep whatever they sent (so you can support other values if you want)
      return cleaned
    }),
})

// ---- Your existing response schema (unchanged) ----
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

function stripJsonFences(s: string) {
  let text = s.trim()
  const fenceRegex = /^```(\w+)?\s*\n([\s\S]*?)\n```$/m
  const m = text.match(fenceRegex)
  if (m?.[2]) text = m[2].trim()
  return text
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Request payload too large. Gemini supports up to ~100MB for inputs." },
        { status: 413, headers: getCorsHeaders(request) },
      )
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured", isMockResult: true },
        { status: 500, headers: getCorsHeaders(request) },
      )
    }

    const rawBody = await request.json()
    const { images, age, gender } = RequestSchema.parse(rawBody)

    console.log(`[API Batch] Processing ${images.length} images... (age=${age}, gender=${gender})`)

    // --- Build parts: images + "Age is X, gender" (matches your Python) ---
    const parts: any[] = []

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i]
      const base64Image = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData

      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      })
    }

    parts.push({
      text: `Age is ${age}, ${gender}`,
    })

    // --- Gemini call (mirrors your Python layout) ---
    // Python:
    // response = client.models.generate_content(
    //   model="gemini-3-flash-preview",
    //   contents=image_parts + [text("Age is 8, male")],
    //   config=GenerateContentConfig(tools=[FileSearch(store_names=[STORE_NAME])], system_instruction=[prompt])
    // )
    const ai = new GoogleGenAI({ apiKey })

    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-3-flash-preview"

    console.log(`[API Batch] Sending to Gemini model=${modelName} with File Search store=${STORE_NAME}...`)

    let result
    try {
      result = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [STORE_NAME],
              },
            },
          ],
          // This is the key change: use Bilal_Eye_Prompt as the single system instruction source
          systemInstruction: Bilal_Eye_Prompt,
          // Optional but helpful if your prompt expects JSON
          responseMimeType: "application/json",
        },
      })
    } catch (geminiError: any) {
      console.error("[API Batch] GEMINI ERROR:", geminiError?.message || String(geminiError))

      const errorMessage =
        geminiError?.message ? String(geminiError.message) : typeof geminiError === "string" ? geminiError : String(geminiError)

      const is413Error =
        errorMessage.includes("Request En") ||
        errorMessage.includes("413") ||
        errorMessage.toLowerCase().includes("too large") ||
        errorMessage.toLowerCase().includes("entity too large") ||
        errorMessage.toLowerCase().includes("payload") ||
        errorMessage.toLowerCase().includes("request size")

      if (is413Error) {
        return NextResponse.json(
          {
            error: "Images too large for batch processing",
            details:
              "The combined size of your images exceeds the API limit (~100MB). Compress images or upload fewer per request.",
            suggestion: `You uploaded ${images.length} images. Try 3 or fewer, or compress JPEG quality/resolution.`,
            technicalDetails: errorMessage,
            isMockResult: true,
            processingTimeMs: Date.now() - startTime,
          },
          { status: 413, headers: getCorsHeaders(request) },
        )
      }

      return NextResponse.json(
        {
          error: "Gemini API error occurred",
          details: errorMessage.substring(0, 300),
          isMockResult: true,
          processingTimeMs: Date.now() - startTime,
        },
        { status: 500, headers: getCorsHeaders(request) },
      )
    }

    const text = result.text ?? ""
    console.log("[API Batch] Gemini raw response:", text.substring(0, 200))

    // Parse JSON response robustly
    let assessmentData: unknown
    try {
      assessmentData = JSON.parse(stripJsonFences(text))
    } catch {
      // fallback: extract first JSON object
      const jsonMatch = stripJsonFences(text).match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No valid JSON found in Gemini response")
      assessmentData = JSON.parse(jsonMatch[0])
    }

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
        // echo inputs (optional; remove if you don't want it)
        age,
        gender,
      },
      { headers: getCorsHeaders(request) },
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
        errorMessage = "Request payload too large. Gemini supports up to ~100MB of inputs."
        statusCode = 413
      } else if (error.message.includes("JSON")) {
        errorMessage = "Failed to parse AI response. Please try again."
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        isMockResult: true,
        processingTimeMs: Date.now() - startTime,
      },
      { status: statusCode, headers: getCorsHeaders(request) },
    )
  }
}
