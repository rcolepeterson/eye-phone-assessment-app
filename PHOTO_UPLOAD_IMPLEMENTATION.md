# Photo Upload & Camera Capture Implementation Guide

Complete documentation for implementing photo upload and camera capture functionality for medical/assessment applications.

## Overview

This implementation provides dual functionality:
1. **Live camera capture** using device cameras (preferring back camera on mobile)
2. **Gallery file upload** for existing photos

Built with React, TypeScript, and modern browser APIs for production-ready medical applications.

---

## Architecture

### Core Components

**1. PhotoUpload Component** (`components/photo-upload.tsx`)
- Main client-side component handling both camera and file uploads
- Uses React hooks for state management
- Provides real-time feedback and validation
- 374 lines of production code

**2. Assessment Service** (`lib/assessment-service.tsx`)
- Validates uploaded images
- Handles API communication
- Provides fallback mock data for development
- Image validation and error handling

**3. Main Page Integration** (`app/page.tsx`)
- Orchestrates user flow
- Manages assessment state
- Displays results

---

## Browser APIs Used

### 1. MediaDevices API (Camera Access)
```typescript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",  // Prefer back camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
})
```

### 2. HTML5 Canvas API (Photo Capture)
```typescript
const canvas = canvasRef.current
const context = canvas.getContext("2d")
canvas.width = video.videoWidth
canvas.height = video.videoHeight
context.drawImage(video, 0, 0, canvas.width, canvas.height)
```

### 3. Blob API (File Creation)
```typescript
canvas.toBlob((blob) => {
  const file = new File([blob], `camera-photo-${timestamp}.jpg`, { 
    type: "image/jpeg" 
  })
}, "image/jpeg", 0.9)  // 90% JPEG quality
```

### 4. FileReader API (Image Conversion)
```typescript
const reader = new FileReader()
reader.onload = () => {
  const base64 = reader.result.split(",")[1]
  resolve(base64)
}
reader.readAsDataURL(file)
```

---

## Key Features Implementation

### Camera Capture Flow

**1. Start Camera**
```typescript
const startCamera = useCallback(async () => {
  try {
    // Try back camera first (mobile)
    let mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
    })
  } catch (backCameraError) {
    // Fallback to any camera
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } }
    })
  }
  
  setStream(mediaStream)
  videoRef.current.srcObject = mediaStream
}, [])
```

**2. Capture Photo**
- Draws current video frame to canvas
- Converts to JPEG blob (90% quality)
- Creates File object with timestamp
- Adds to selectedImages array

**3. Stop Camera**
```typescript
const stopCamera = useCallback(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    setStream(null)
  }
  setIsCameraActive(false)
}, [stream])
```

### File Upload Flow

**1. File Input**
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileSelect}
  className="hidden"
/>
```

**2. File Selection Handler**
```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || [])
  const imageFiles = files.filter(file => file.type.startsWith("image/"))
  setSelectedImages(prev => [...prev, ...imageFiles])
}
```

### Image Validation

**Validation Rules:**
- Minimum: 1 image required
- Maximum: 10 images allowed
- File type: Must be image/* MIME type
- File size: 1KB minimum, 10MB maximum per image

```typescript
export function validateImages(images: File[]): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (images.length === 0) issues.push("At least one image is required")
  if (images.length > 10) issues.push("Maximum 10 images allowed")
  
  images.forEach((image, index) => {
    if (!image.type.startsWith("image/")) {
      issues.push(`File ${index + 1} is not a valid image`)
    }
    if (image.size > 10 * 1024 * 1024) {
      issues.push(`Image ${index + 1} is too large (max 10MB)`)
    }
    if (image.size < 1024) {
      issues.push(`Image ${index + 1} appears to be too small or corrupted`)
    }
  })
  
  return { isValid: issues.length === 0, issues }
}
```

---

## State Management

### Component State
```typescript
const [selectedImages, setSelectedImages] = useState<File[]>([])
const [isCameraActive, setIsCameraActive] = useState(false)
const [stream, setStream] = useState<MediaStream | null>(null)
const [cameraError, setCameraError] = useState<string | null>(null)
const [showFlash, setShowFlash] = useState(false)
const [showSuccessMessage, setShowSuccessMessage] = useState(false)
const [justCaptured, setJustCaptured] = useState(false)
```

### Refs
```typescript
const fileInputRef = useRef<HTMLInputElement>(null)
const videoRef = useRef<HTMLVideoElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)
```

---

## Error Handling

### Camera Permission Errors
```typescript
if (error.name === "NotAllowedError") {
  errorMessage = "Please allow camera permissions and try again."
} else if (error.name === "NotFoundError") {
  errorMessage = "No camera found on this device."
} else if (error.name === "NotReadableError") {
  errorMessage = "Camera is already in use by another application."
}
```

### Video Playback Issues
- Waits for `loadedmetadata` event before playing
- Handles `canplay` event to verify stream readiness
- Implements error callbacks on video element
- 100ms delay after stream assignment for DOM updates

### API Fallback
- Primary: Real OpenAI API assessment
- Fallback: Mock assessment data if API fails
- Graceful degradation with user notification

---

## UI/UX Features

### Visual Feedback
1. **Flash Effect**: White screen flash on photo capture
2. **Success Message**: Green alert for 3 seconds after capture
3. **Loading States**: Spinner while camera initializes
4. **Progress Indicators**: Visual feedback during analysis
5. **Image Highlighting**: First image marked "Will Analyze"

### User Guidance
- Photo tips alert with best practices
- Error messages with actionable solutions
- Status indicators (camera active, analyzing, etc.)
- Thumbnail previews with delete option
- Medical disclaimer for legal compliance

### Responsive Design
- Mobile-first approach
- Touch-friendly buttons (size="lg")
- Grid layouts adapt to screen size
- Video mirror effect for better UX (`scaleX(-1)`)

---

## Image Processing Details

### Base64 Conversion
```typescript
async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(",")[1]  // Remove data URL prefix
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

**When to use Base64:**
- Sending images to APIs that require base64 encoding
- Storing small images in JSON payloads
- Embedding images in data URIs

**When to use FormData:**
- Uploading images to servers (more efficient)
- Large file transfers
- Multipart form submissions (current implementation)

### JPEG Quality
- Canvas `toBlob()` uses 90% quality (0.9)
- Balance between file size and image fidelity
- Suitable for medical assessment requirements

---

## NPM Packages

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.x",
    "lucide-react": "^0.x",  // Icons (Camera, Upload, X, etc.)
    "zod": "^3.x"           // Schema validation
  }
}
```

### No External Camera Libraries Needed
- Uses native browser APIs
- No react-webcam or similar packages required
- Lighter bundle size
- More control over implementation

---

## Implementation Tricks & Best Practices

### 1. Camera Fallback Strategy
Always try preferred camera first, then fallback:
```typescript
try {
  // Try back camera
  mediaStream = await getUserMedia({ video: { facingMode: "environment" } })
} catch {
  // Fallback to any camera
  mediaStream = await getUserMedia({ video: true })
}
```

### 2. Video Element Timing
Add delay after setting srcObject:
```typescript
setTimeout(() => {
  videoRef.current.srcObject = mediaStream
  videoRef.current.onloadedmetadata = () => {
    videoRef.current.play()
  }
}, 100)
```

### 3. Proper Cleanup
Always stop tracks when done:
```typescript
stream.getTracks().forEach(track => track.stop())
```

### 4. Mirror Video Display
Better UX for front-facing cameras:
```tsx
<video style={{ transform: "scaleX(-1)" }} />
```

### 5. Hidden Canvas
Keep canvas in DOM but hidden:
```tsx
<canvas ref={canvasRef} className="hidden" />
```

### 6. File Naming
Use timestamps for unique names:
```typescript
const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
const filename = `camera-photo-${timestamp}.jpg`
```

### 7. Image Preview URLs
Always clean up object URLs:
```typescript
URL.createObjectURL(image)
// Clean up when component unmounts or image is removed
```

### 8. Disable Button During Loading
Prevent multiple camera starts:
```tsx
<Button disabled={isCameraActive || !stream}>
  Capture Photo
</Button>
```

---

## Security Considerations

### Permissions
- Request camera permission only when needed
- Provide clear explanation for permission request
- Handle permission denial gracefully

### HTTPS Required
- getUserMedia only works on HTTPS or localhost
- Deploy to secure domain for production

### Privacy
- Stop camera stream immediately when done
- Don't store images longer than necessary
- Clear medical disclaimer for users

---

## Testing Checklist

- [ ] Camera access on desktop Chrome/Firefox/Safari
- [ ] Camera access on mobile iOS/Android
- [ ] Front and back camera switching
- [ ] File upload from gallery
- [ ] Multiple image upload
- [ ] Image size validation
- [ ] File type validation
- [ ] Camera permission denial handling
- [ ] Camera in-use error handling
- [ ] Video playback error handling
- [ ] Flash animation on capture
- [ ] Success message display
- [ ] Image preview thumbnails
- [ ] Delete image functionality
- [ ] Network error handling
- [ ] API fallback mechanism

---

## Common Issues & Solutions

### Issue: Black screen in video preview
**Solution:** Add delay after srcObject assignment, wait for metadata

### Issue: Camera permission denied
**Solution:** Provide clear error message with instructions to enable

### Issue: Video dimensions 0x0
**Solution:** Wait for canplay event before capturing

### Issue: Photo quality poor
**Solution:** Increase canvas resolution, adjust JPEG quality

### Issue: Works on localhost but not production
**Solution:** Ensure HTTPS is enabled on production domain

---

## Performance Optimization

1. **Lazy load camera**: Only start when user clicks button
2. **Cleanup streams**: Stop tracks immediately when done
3. **Optimize image size**: Use ideal dimensions, not maximum
4. **JPEG compression**: 90% quality balances size and fidelity
5. **Single image analysis**: Analyze first/best image only

---

## Future Enhancements

- [ ] Multiple camera device selection
- [ ] Photo editing (crop, rotate, adjust)
- [ ] Real-time face detection overlay
- [ ] Auto-capture when face detected
- [ ] Batch upload progress tracking
- [ ] Image compression before upload
- [ ] PWA camera integration
- [ ] WebRTC for advanced features

---

## Example Usage in Another Project

```tsx
import { PhotoUpload } from "@/components/photo-upload"

function MyAssessmentApp() {
  const handleImages = async (images: File[]) => {
    // Your custom logic here
    console.log("Received images:", images)
    
    // Example: Upload to API
    const formData = new FormData()
    images.forEach(img => formData.append("images", img))
    
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData
    })
    
    const result = await response.json()
    // Handle result...
  }
  
  return <PhotoUpload onImagesUploaded={handleImages} />
}
```

---

## Conclusion

This implementation provides production-ready photo capture and upload functionality suitable for medical assessment applications. It uses standard browser APIs, handles errors gracefully, and provides excellent user experience across devices.

**Key Strengths:**
- No external camera libraries needed
- Comprehensive error handling
- Mobile-optimized (back camera preference)
- Visual feedback and user guidance
- Production-tested code

Copy the relevant files and adapt to your needs!
