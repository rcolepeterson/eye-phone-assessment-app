"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Info, StopCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoUploadProps {
  onImagesUploaded: (images: File[]) => void
}

export function PhotoUpload({ onImagesUploaded }: PhotoUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [justCaptured, setJustCaptured] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setSelectedImages((prev) => [...prev, ...imageFiles])
  }

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      console.log("[v0] Requesting camera access...")

      let mediaStream: MediaStream | null = null

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        console.log("[v0] Back camera access successful")
      } catch (backCameraError) {
        console.log("[v0] Back camera failed, trying any camera...")
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        console.log("[v0] Any camera access successful")
      }

      if (!mediaStream) {
        throw new Error("No camera stream available")
      }

      setStream(mediaStream)
      setIsCameraActive(true)

      setTimeout(() => {
        if (videoRef.current) {
          console.log("[v0] Setting video srcObject...")
          videoRef.current.srcObject = mediaStream

          // Wait for the video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log("[v0] Video metadata loaded, starting playback...")
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  console.log("[v0] Video playback started successfully")
                })
                .catch((playError) => {
                  console.error("[v0] Video play error:", playError)
                  setCameraError("Failed to start video playback")
                })
            }
          }

          videoRef.current.oncanplay = () => {
            console.log(
              "[v0] Video can play - dimensions:",
              videoRef.current?.videoWidth,
              "x",
              videoRef.current?.videoHeight,
            )
          }

          videoRef.current.onerror = (e) => {
            console.error("[v0] Video error:", e)
            setCameraError("Video playback error")
          }

          // Force load the video
          videoRef.current.load()
        } else {
          console.error("[v0] Video ref is still null after timeout!")
          setCameraError("Video element not available")
        }
      }, 100) // Small delay to ensure DOM is updated
    } catch (error) {
      console.error("[v0] Camera error:", error)
      let errorMessage = "Unable to access camera. "

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage += "Please allow camera permissions and try again."
        } else if (error.name === "NotFoundError") {
          errorMessage += "No camera found on this device."
        } else if (error.name === "NotReadableError") {
          errorMessage += "Camera is already in use by another application."
        } else {
          errorMessage += `Error: ${error.message}`
        }
      } else {
        errorMessage += "Please check permissions or use 'Upload from Gallery' instead."
      }

      setCameraError(errorMessage)
      setIsCameraActive(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.log("[v0] Missing video or canvas ref for capture")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.log("[v0] No canvas context available")
      return
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("[v0] Video dimensions are 0, cannot capture")
      setCameraError("Video not ready for capture. Please wait a moment and try again.")
      return
    }

    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 200)

    console.log("[v0] Capturing photo with dimensions:", video.videoWidth, "x", video.videoHeight)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          const file = new File([blob], `camera-photo-${timestamp}.jpg`, { type: "image/jpeg" })
          setSelectedImages((prev) => [...prev, file])
          console.log("[v0] Photo captured successfully")

          setShowSuccessMessage(true)
          setJustCaptured(true)
          setTimeout(() => {
            setShowSuccessMessage(false)
            setJustCaptured(false)
          }, 3000)
        } else {
          console.log("[v0] Failed to create blob from canvas")
          setCameraError("Failed to capture photo")
        }
      },
      "image/jpeg",
      0.9,
    )
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    setCameraError(null)
  }, [stream])

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedImages.length > 0) {
      stopCamera()
      onImagesUploaded([selectedImages[0]]) // Send only the first/best image
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Photo Tips:</strong> Take clear, well-lit photos of your child's face and eyes. Include both close-up
          eye shots and full face photos for best results.
        </AlertDescription>
      </Alert>

      {cameraError && (
        <Alert variant="destructive">
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      {showSuccessMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Photo captured!</strong> Image saved to Selected Photos below.
          </AlertDescription>
        </Alert>
      )}

      {isCameraActive && (
        <Card>
          <CardHeader>
            <CardTitle>Camera</CardTitle>
            <CardDescription>Position your child's face in the frame and tap capture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {showFlash && (
                  <div
                    className="absolute inset-0 bg-white z-10 animate-pulse"
                    style={{ animation: "flash 0.2s ease-out" }}
                  />
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }} // Mirror the video for better UX
                />
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} size="lg" className="flex-1" disabled={!stream}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button onClick={stopCamera} variant="outline" size="lg">
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>Add photos of your child's eyes and face for assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={startCamera}
              disabled={isCameraActive}
              className="h-24 flex-col gap-2 bg-transparent"
            >
              <Camera className="h-6 w-6" />
              {isCameraActive ? "Camera Active" : "Take Photos"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              Upload from Gallery
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <canvas ref={canvasRef} className="hidden" />

          {selectedImages.length > 0 && (
            <div
              className={`space-y-4 transition-all duration-500 ${justCaptured ? "ring-2 ring-green-400 ring-opacity-50 rounded-lg p-4 bg-green-50" : ""}`}
            >
              <h4 className="font-medium">Selected Photos ({selectedImages.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className={`relative group ${index === 0 ? "ring-2 ring-blue-400" : ""}`}>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Selected photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Will Analyze
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>AI Analysis:</strong> We'll analyze your best photo (highlighted in blue) for the most
                  accurate results.
                  {selectedImages.length > 1 && " Additional photos are saved for your records."}
                </p>
              </div>
              <Button onClick={handleUpload} className="w-full" size="lg" disabled={selectedImages.length === 0}>
                Analyze Photo with AI
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
