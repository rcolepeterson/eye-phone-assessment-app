// Mock AI Assessment Service
// This module provides a placeholder backend that can be easily replaced with a real AI service

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export interface AssessmentResult {
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk"
  explanation: string
  callToAction?: string
  confidence?: number
  detectedFeatures?: string[]
  isMockResult?: boolean
  errorMessage?: string
}

export interface AssessmentRequest {
  images: File[]
  childAge?: number
  additionalNotes?: string
}

// Mock assessment results with realistic medical explanations
const MOCK_RESULTS: AssessmentResult[] = [
  {
    riskLevel: "Low Risk",
    explanation:
      "Eye alignment appears normal with no significant concerns detected. Both eyes show proper coordination and focus.",
    confidence: 0.92,
    detectedFeatures: ["Normal eye alignment", "Symmetric pupil response", "Clear corneal reflex"],
  },
  {
    riskLevel: "Low Risk",
    explanation:
      "Eyes appear healthy with good alignment. Minor asymmetry detected but within normal range for child development.",
    confidence: 0.88,
    detectedFeatures: ["Good eye coordination", "Normal pupil size", "Healthy eye appearance"],
  },
  {
    riskLevel: "Medium Risk",
    explanation:
      "Subtle eye alignment variations detected. One eye may turn slightly inward or outward, which could indicate early strabismus.",
    callToAction:
      "Schedule a comprehensive eye exam to ensure optimal eye health and rule out any developing conditions.",
    confidence: 0.76,
    detectedFeatures: ["Mild eye misalignment", "Possible strabismus indicators", "Asymmetric light reflex"],
  },
  {
    riskLevel: "Medium Risk",
    explanation:
      "Possible signs of refractive error detected. Child may be experiencing difficulty focusing, which could affect vision development.",
    callToAction: "Consider scheduling an eye exam to assess for nearsightedness, farsightedness, or astigmatism.",
    confidence: 0.71,
    detectedFeatures: ["Potential refractive error", "Focusing difficulties", "Eye strain indicators"],
  },
  {
    riskLevel: "High Risk",
    explanation:
      "Significant eye alignment concerns detected requiring immediate attention. Possible strabismus or amblyopia risk identified.",
    callToAction:
      "Please schedule an appointment with an eye care professional as soon as possible for proper evaluation and treatment.",
    confidence: 0.89,
    detectedFeatures: ["Significant misalignment", "Strabismus indicators", "Amblyopia risk factors"],
  },
  {
    riskLevel: "High Risk",
    explanation:
      "Concerning asymmetry in pupil response and eye positioning detected. This may indicate neurological or muscular issues affecting eye movement.",
    callToAction:
      "Immediate professional evaluation recommended. Contact an ophthalmologist or pediatric eye specialist.",
    confidence: 0.94,
    detectedFeatures: ["Pupil asymmetry", "Eye movement concerns", "Neurological indicators"],
  },
]

const AssessmentSchema = z.object({
  riskLevel: z.enum(["Low Risk", "Medium Risk", "High Risk"]),
  explanation: z.string(),
  callToAction: z.string().optional(),
  confidence: z.number().min(0).max(1),
  detectedFeatures: z.array(z.string()),
})

/**
 * Real AI Assessment Service using OpenAI GPT-4 Vision
 *
 * Analyzes eye photos for myopia and other eye health concerns
 * based on the research outlined in the EyePhone pitch deck.
 */
export async function performEyeAssessment(request: AssessmentRequest): Promise<AssessmentResult> {
  console.log("[v0] Starting real AI assessment...")

  // Validate request
  if (!request.images || request.images.length === 0) {
    throw new Error("No images provided for assessment")
  }

  // For now, analyze the first image (can be extended to multiple images later)
  const imageToAnalyze = request.images[0]

  try {
    // Convert image to base64 for AI analysis
    const imageBase64 = await convertImageToBase64(imageToAnalyze)

    console.log("[v0] Image converted to base64, sending to AI...")

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

RISK LEVELS:
- Low Risk: Normal eye alignment, symmetric pupils, no concerning features
- Medium Risk: Minor asymmetries, possible early signs requiring monitoring
- High Risk: Significant misalignment, clear abnormalities requiring immediate attention

Provide a confidence score based on image quality and clarity of findings.

${request.childAge ? `Child's age: ${request.childAge} years` : ""}
${request.additionalNotes ? `Additional notes: ${request.additionalNotes}` : ""}

IMPORTANT: This is a screening tool only. Always recommend professional evaluation for any concerns.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
      schema: AssessmentSchema,
      temperature: 0.3, // Lower temperature for more consistent medical assessments
    })

    console.log("[v0] AI assessment completed successfully")

    return {
      riskLevel: result.object.riskLevel,
      explanation: result.object.explanation,
      callToAction: result.object.callToAction,
      confidence: Math.round(result.object.confidence * 100) / 100,
      detectedFeatures: result.object.detectedFeatures,
      isMockResult: false,
    }
  } catch (error) {
    console.error("[v0] AI assessment failed:", error)

    let errorMessage = "AI service temporarily unavailable"
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        errorMessage = "OpenAI API key not configured or invalid"
      } else if (error.message.includes("quota") || error.message.includes("billing")) {
        errorMessage = "API quota exceeded or billing issue"
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network connection issue"
      }
    }

    // Fallback to mock result if AI fails
    console.log("[v0] Falling back to mock assessment...")
    const mockResult = await performMockAssessment(request)

    return {
      ...mockResult,
      isMockResult: true,
      errorMessage,
    }
  }
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix to get just the base64 data
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function performMockAssessment(request: AssessmentRequest): Promise<AssessmentResult> {
  // Simulate network delay and processing time
  const processingTime = Math.random() * 2000 + 2000 // 2-4 seconds

  await new Promise((resolve) => setTimeout(resolve, processingTime))

  // Validate request
  if (!request.images || request.images.length === 0) {
    throw new Error("No images provided for assessment")
  }

  // Simulate image analysis by checking image properties
  const hasMultipleImages = request.images.length > 1
  const hasLargeImages = request.images.some((img) => img.size > 1000000) // > 1MB

  // Weight the random selection based on image quality indicators
  let resultPool = [...MOCK_RESULTS]

  // Better quality images (multiple, larger files) tend to get more accurate results
  if (hasMultipleImages && hasLargeImages) {
    // Favor low risk results for high-quality submissions
    resultPool = [
      ...MOCK_RESULTS.filter((r) => r.riskLevel === "Low Risk"),
      ...MOCK_RESULTS.filter((r) => r.riskLevel === "Low Risk"), // Double weight
      ...MOCK_RESULTS.filter((r) => r.riskLevel === "Medium Risk"),
      ...MOCK_RESULTS.filter((r) => r.riskLevel === "High Risk"),
    ]
  }

  // Select random result from weighted pool
  const randomIndex = Math.floor(Math.random() * resultPool.length)
  const selectedResult = resultPool[randomIndex]

  // Add some randomness to confidence scores
  const confidenceVariation = (Math.random() - 0.5) * 0.1 // ±5%
  const adjustedConfidence = Math.max(0.6, Math.min(0.99, (selectedResult.confidence || 0.8) + confidenceVariation))

  return {
    ...selectedResult,
    confidence: Math.round(adjustedConfidence * 100) / 100, // Round to 2 decimal places
    isMockResult: true,
  }
}

/**
 * Validate uploaded images for assessment
 *
 * @param images - Array of image files to validate
 * @returns Validation result with any issues found
 */
export function validateImages(images: File[]): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  if (images.length === 0) {
    issues.push("At least one image is required")
  }

  if (images.length > 10) {
    issues.push("Maximum 10 images allowed")
  }

  images.forEach((image, index) => {
    // Check file type
    if (!image.type.startsWith("image/")) {
      issues.push(`File ${index + 1} is not a valid image`)
    }

    // Check file size (max 10MB per image)
    if (image.size > 10 * 1024 * 1024) {
      issues.push(`Image ${index + 1} is too large (max 10MB)`)
    }

    // Check minimum file size (avoid tiny/corrupt images)
    if (image.size < 1024) {
      issues.push(`Image ${index + 1} appears to be too small or corrupted`)
    }
  })

  return {
    isValid: issues.length === 0,
    issues,
  }
}

/**
 * Get assessment progress updates
 * This could be used for real-time progress tracking in production
 */
export function getAssessmentProgress(): AsyncGenerator<{ progress: number; message: string }> {
  return (async function* () {
    const steps = [
      { progress: 10, message: "Uploading images..." },
      { progress: 25, message: "Preprocessing images..." },
      { progress: 40, message: "Detecting facial features..." },
      { progress: 60, message: "Analyzing eye alignment..." },
      { progress: 80, message: "Evaluating risk factors..." },
      { progress: 95, message: "Generating report..." },
      { progress: 100, message: "Assessment complete!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))
      yield step
    }
  })()
}
