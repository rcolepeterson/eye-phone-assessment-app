// Mock AI Assessment Service
// This module provides a placeholder backend that can be easily replaced with a real AI service

export interface AssessmentResult {
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk"
  explanation: string
  callToAction?: string
  confidence?: number
  detectedFeatures?: string[]
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

/**
 * Mock AI Assessment Service
 *
 * This function simulates an AI-powered eye assessment service.
 * In production, this would be replaced with actual AI service calls.
 *
 * @param request - Assessment request containing images and metadata
 * @returns Promise resolving to assessment result
 */
export async function performEyeAssessment(request: AssessmentRequest): Promise<AssessmentResult> {
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
