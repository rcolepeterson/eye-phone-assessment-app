"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react"

export default function TestPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setResult(null)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedImage) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)

      const response = await fetch("/api/assess-eyes", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Failed to process image")
    } finally {
      setLoading(false)
    }
  }

  const resetTest = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">EyePhone API Test Interface</h1>
          <p className="text-muted-foreground">Upload an image to test the eye assessment API</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>Select an image to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {selectedImage ? selectedImage.name : "Click to select image"}
                      </p>
                    </div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Selected"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Image"
                        )}
                      </Button>
                      <Button onClick={resetTest} variant="outline" disabled={loading}>
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Response</CardTitle>
                <CardDescription>Raw JSON response from the API</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {result.isMockResult && (
                      <Alert>
                        <AlertDescription className="text-xs">
                          Note: This is a mock/demo result. Check your API configuration.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[600px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                    </div>

                    {!result.isMockResult && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">Real AI analysis completed successfully</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Upload and analyze an image to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Endpoint:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs">POST /api/assess-eyes</code>
              </div>
              <div>
                <p className="font-semibold mb-2">Format:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs">multipart/form-data</code>
              </div>
              <div>
                <p className="font-semibold mb-2">Expected Response Time:</p>
                <p className="text-muted-foreground">3-10 seconds</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Max Image Size:</p>
                <p className="text-muted-foreground">10MB recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
