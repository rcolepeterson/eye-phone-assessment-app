# EyePhone API Service

A standalone Next.js API service for AI-powered pediatric eye health assessment using GPT-4 Vision.

## Overview

This is a clean, production-ready API service that can be called from any frontend application (Vite, React, Vue, etc.). It provides comprehensive eye health assessments with detailed medical analysis and technical metrics.

## Features

- **GPT-4 Vision Analysis**: Advanced AI-powered eye health assessment
- **Detailed Medical Reports**: Risk levels, recommendations, and detailed analysis
- **Technical Metrics**: Quantitative measurements including pupil diameter, alignment angles, and confidence intervals
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Check Endpoint**: Monitor service availability

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Run Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000`

## API Endpoints

### POST /api/assess-eyes

Analyzes eye photos and returns detailed health assessment.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (File, required): Eye photo
  - `childAge` (string, optional): Child's age
  - `additionalNotes` (string, optional): Additional context

**Response:**
```json
{
  "riskLevel": "Low Risk" | "Medium Risk" | "High Risk",
  "explanation": "string",
  "confidence": 0.85,
  "detectedFeatures": ["string"],
  "recommendations": ["string"],
  "detailedAnalysis": {...},
  "technicalMetrics": {...}
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "EyePhone API Service",
  "version": "1.0.0"
}
```

## Integration Guide

See [API_SERVICE_GUIDE.md](./API_SERVICE_GUIDE.md) for complete integration instructions for your Vite frontend.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ALLOWED_ORIGIN`: Your frontend URL
3. Deploy

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `ALLOWED_ORIGIN` | No | CORS allowed origin (defaults to *) |

## Documentation

- [API Service Guide](./API_SERVICE_GUIDE.md) - Integration guide for Vite apps
- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Photo Upload Implementation](./PHOTO_UPLOAD_IMPLEMENTATION.md) - Camera/upload documentation

## Tech Stack

- Next.js 14.2.35
- TypeScript
- OpenAI GPT-4 Vision (via Vercel AI SDK)
- Zod for schema validation
- Tailwind CSS

## License

MIT
