"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoUploadProps {
  onImagesUploaded: (images: File[]) => void
}

export function PhotoUpload({ onImagesUploaded }: PhotoUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setSelectedImages((prev) => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedImages.length > 0) {
      onImagesUploaded(selectedImages)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Photo Tips:</strong> Take clear, well-lit photos of your child's face and eyes. Include both close-up
          eye shots and full face photos for best results.
        </AlertDescription>
      </Alert>

      {/* Upload Options */}
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
              onClick={() => cameraInputRef.current?.click()}
              className="h-24 flex-col gap-2"
            >
              <Camera className="h-6 w-6" />
              Take Photos
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

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Selected Photos ({selectedImages.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Selected photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
              <Button onClick={handleUpload} className="w-full" size="lg" disabled={selectedImages.length === 0}>
                Continue with {selectedImages.length} Photo{selectedImages.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
