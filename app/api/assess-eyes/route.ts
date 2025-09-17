import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const AssessmentSchema = z.object({
  riskLevel: z.enum(["Low Risk", "Medium Risk", "High Risk"]),
  explanation: z.string().min(10),
  callToAction: z.string().optional().default("Consult with a pediatric eye specialist for professional evaluation."),
  confidence: z.number().min(0).max(1),
  detectedFeatures: z.array(z.string()).default([]),
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

ANALYSIS CRITERIA:
1. Eye Alignment: Check for proper coordination and symmetry
2. Pupil Response: Look for size, shape, and light reflex symmetry  
3. Corneal Clarity: Assess transparency and reflection patterns
4. Squinting/Strain: Signs of difficulty focusing or seeing clearly
5. Overall Eye Health: Any visible abnormalities or concerns

RESPONSE FORMAT REQUIREMENTS:
- riskLevel: Must be exactly "Low Risk", "Medium Risk", or "High Risk"
- explanation: Detailed explanation of findings (minimum 10 characters)
- callToAction: Specific recommendation for next steps (optional)
- confidence: Number between 0 and 1 representing assessment confidence
- detectedFeatures: Array of specific features observed (can be empty array)

RISK LEVELS:
- Low Risk: Normal eye alignment, symmetric pupils, no concerning features
- Medium Risk: Minor asymmetries, possible early signs requiring monitoring
- High Risk: Significant misalignment, clear abnormalities requiring immediate attention

${childAge ? `Child's age: ${childAge} years` : ""}
${additionalNotes ? `Additional notes: ${additionalNotes}` : ""}

IMPORTANT: This is a screening tool only. Always recommend professional evaluation for any concerns.`,
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
      callToAction: result.object.callToAction,
      confidence: Math.round(result.object.confidence * 100) / 100,
      detectedFeatures: result.object.detectedFeatures,
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
