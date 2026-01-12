# EyePhone API Service - Integration Guide

## Quick Start for Your Vite App

This guide shows you how to integrate the EyePhone API service into your Vite frontend application.

## Step 1: Deploy the API Service

1. **Deploy this project to Vercel:**
   - Push code to GitHub
   - Import to Vercel
   - Add `OPENAI_API_KEY` environment variable
   - Deploy

2. **Note your API URL:**
   - Example: `https://your-api-service.vercel.app`

## Step 2: Create API Client in Your Vite App

Create a file `src/services/eyephone-api.ts`:

```typescript
export interface EyeAssessmentResult {
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk'
  explanation: string
  confidence: number
  detectedFeatures: string[]
  recommendations: string[]
  visualAidSuggestions: string[]
  detailedAnalysis: {
    eyeAlignment: string
    pupilResponse: string
    cornealClarity: string
    squintingStrain: string
    overallEyeHealth: string
  }
  technicalMetrics: {
    imageQuality: {
      resolution: string
      sharpnessScore: number
      contrastRatio: number
      brightnessLevel: number
    }
    eyeGeometry: {
      pupilDiameterLeft: number
      pupilDiameterRight: number
      pupilAsymmetryRatio: number
      eyeAlignmentAngle: number
      interPupillaryDistance: number
    }
    riskIndicators: {
      squintingProbability: number
      alignmentDeviation: number
      cornealReflexSymmetry: number
      focusAccuracy: number
    }
    confidenceIntervals: {
      overallAssessment: { lower: number; upper: number }
      myopiaRisk: { lower: number; upper: number }
    }
  }
  isMockResult: boolean
}

const API_BASE_URL = import.meta.env.VITE_EYEPHONE_API_URL || 'http://localhost:3000'

export const assessEyeHealth = async (
  imageFile: File,
  options?: {
    childAge?: string
    additionalNotes?: string
  }
): Promise<EyeAssessmentResult> => {
  const formData = new FormData()
  formData.append('image', imageFile)
  
  if (options?.childAge) {
    formData.append('childAge', options.childAge)
  }
  
  if (options?.additionalNotes) {
    formData.append('additionalNotes', options.additionalNotes)
  }

  const response = await fetch(`${API_BASE_URL}/api/assess-eyes`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Assessment failed')
  }

  return response.json()
}

export const checkApiHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  return response.json()
}
```

## Step 3: Add Environment Variable to Your Vite App

Create `.env` file:

```env
VITE_EYEPHONE_API_URL=https://your-api-service.vercel.app
```

## Step 4: Use in Your Components

```typescript
import { useState } from 'react'
import { assessEyeHealth, type EyeAssessmentResult } from './services/eyephone-api'

export function EyeAssessment() {
  const [result, setResult] = useState<EyeAssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const assessment = await assessEyeHealth(file, {
        childAge: '8',
        additionalNotes: 'Regular checkup'
      })
      
      setResult(assessment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload}
        disabled={loading}
      />
      
      {loading && <p>Analyzing...</p>}
      {error && <p>Error: {error}</p>}
      
      {result && (
        <div>
          <h2>Assessment Result</h2>
          <p>Risk Level: {result.riskLevel}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
          <p>{result.explanation}</p>
          
          <h3>Recommendations:</h3>
          <ul>
            {result.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
          
          <h3>Technical Metrics:</h3>
          <p>Pupil Diameter (L): {result.technicalMetrics.eyeGeometry.pupilDiameterLeft}mm</p>
          <p>Pupil Diameter (R): {result.technicalMetrics.eyeGeometry.pupilDiameterRight}mm</p>
        </div>
      )}
    </div>
  )
}
```

## Step 5: Test the Integration

1. Run your Vite app: `npm run dev`
2. Upload an eye photo
3. Verify you receive assessment results

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure the API service has your frontend domain in `ALLOWED_ORIGIN`:
```env
ALLOWED_ORIGIN=http://localhost:5173
```

### API Key Errors
Verify the `OPENAI_API_KEY` is set in your API service's environment variables on Vercel.

### Network Errors
Check that `VITE_EYEPHONE_API_URL` points to the correct deployed API URL.

## Complete Example Repository Structure

```
your-vite-app/
├── src/
│   ├── services/
│   │   └── eyephone-api.ts
│   ├── components/
│   │   └── EyeAssessment.tsx
│   └── App.tsx
├── .env
└── package.json
```

## Production Checklist

- [ ] API service deployed to Vercel
- [ ] `OPENAI_API_KEY` set in Vercel environment
- [ ] `ALLOWED_ORIGIN` set to your production domain
- [ ] `VITE_EYEPHONE_API_URL` points to production API
- [ ] Error handling implemented in frontend
- [ ] Loading states implemented
- [ ] File validation added (size, type, etc.)

## Need Help?

Refer to the main README.md for detailed API documentation and technical details.
```

```typescript file="" isHidden
