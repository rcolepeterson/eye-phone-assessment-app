"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, XCircle, X } from "lucide-react"

async function resizeImage(file: File, maxDimension = 1600, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Convert to JPEG at specified quality
          resolve(canvas.toDataURL("image/jpeg", quality))
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function TestBatchPage() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)
  const [resizingStatus, setResizingStatus] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...selectedImages, ...files].slice(0, 6)
    setSelectedImages(newImages)
    setResult(null)
    setError(null)
    setSizeWarning(null)

    const previews: string[] = []
    newImages.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === newImages.length) {
          setImagePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    setSizeWarning(null)
  }

  const handleSubmit = async () => {
    if (selectedImages.length === 0) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSizeWarning(null)
    setResizingStatus(null)

    try {
      setResizingStatus(`Resizing ${selectedImages.length} images...`)
      console.log(`[v0] Starting image resize for ${selectedImages.length} images`)

      const resizedBase64Images = await Promise.all(
        selectedImages.map((file, index) => {
          console.log(`[v0] Resizing image ${index + 1}/${selectedImages.length}`)
          return resizeImage(file, 1600, 0.8) // 1600px max, 80% quality
        }),
      )

      setResizingStatus(null)

      const totalPayloadSize = resizedBase64Images.reduce((sum, img) => sum + img.length, 0)
      const totalPayloadMB = totalPayloadSize / (1024 * 1024)

      console.log(`[v0] Total payload size after resize: ${totalPayloadMB.toFixed(2)} MB`)

      if (totalPayloadMB > 100) {
        throw new Error(
          `Images are still too large after resizing! Total size: ${totalPayloadMB.toFixed(2)} MB. ` +
            `Maximum allowed: 100 MB. Please upload fewer images.`,
        )
      }

      if (totalPayloadMB > 80) {
        setSizeWarning(
          `Warning: Large payload (${totalPayloadMB.toFixed(2)} MB). ` + `This may be slow. Maximum is 100 MB.`,
        )
      }

      const response = await fetch("/api/assess-eyes-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: resizedBase64Images }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.error || errorData?.details || `API Error: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error("[v0] Batch API Error:", err)
      setError(err.message || "Failed to process images")
    } finally {
      setLoading(false)
    }
  }

  const resetTest = () => {
    setSelectedImages([])
    setImagePreviews([])
    setResult(null)
    setError(null)
    setSizeWarning(null)
    setResizingStatus(null)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">EyePhone Batch API Test (6 Images)</h1>
          <p className="text-muted-foreground">Upload up to 6 images to test batch processing and timing</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Images ({selectedImages.length}/6)</CardTitle>
                <CardDescription>Select up to 6 images to analyze together</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedImages.length < 6 && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to select images ({6 - selectedImages.length} remaining)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border overflow-hidden group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {resizingStatus || `Analyzing ${selectedImages.length} images...`}
                          </>
                        ) : (
                          `Analyze ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}`
                        )}
                      </Button>
                      <Button onClick={resetTest} variant="outline" disabled={loading}>
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {resizingStatus && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription className="text-sm">{resizingStatus}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm whitespace-pre-wrap break-words">
                      <strong>Error:</strong> {error}
                    </AlertDescription>
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
                <CardDescription>Raw JSON response from batch API</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {result.processingTimeMs && (
                      <Alert>
                        <AlertDescription className="text-sm font-semibold">
                          Processing Time: {(result.processingTimeMs / 1000).toFixed(2)} seconds
                        </AlertDescription>
                      </Alert>
                    )}

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
                        <AlertDescription className="text-xs">
                          Real AI analysis completed successfully for {result.imagesAnalyzed} images
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Upload and analyze images to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Reference - Batch Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Endpoint:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs">POST /api/assess-eyes-batch</code>
              </div>
              <div>
                <p className="font-semibold mb-2">Format:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs">JSON (array of base64 images)</code>
              </div>
              <div>
                <p className="font-semibold mb-2">Images Accepted:</p>
                <p className="text-muted-foreground">1-6 images per request (auto-resized to 1600px)</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Expected Response Time:</p>
                <p className="text-muted-foreground">10-25 seconds for 6 images</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
