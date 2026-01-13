import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "GOOGLE_GENERATIVE_AI_API_KEY not configured",
          message: "Please add your Google API key to environment variables",
        },
        { status: 500 },
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const result = await model.generateContent('Respond with exactly: "Gemini API is working correctly"')
    const response = result.response
    const text = response.text()

    return Response.json({
      success: true,
      message: "Gemini API connection successful",
      model: "gemini-2.0-flash-exp",
      response: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Gemini test failed:", error)
    return Response.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
