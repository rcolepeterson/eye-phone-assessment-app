# The EyePhone - AI Agent Instructions

## Project Overview
The EyePhone is a pediatric eye health screening application that uses AI to detect early signs of myopia in children through smartphone photos. This is a proof-of-concept based on research showing 80% accuracy in myopia detection using ConvNeXT models.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: Shadcn/UI components with Tailwind CSS v4
- **AI Integration**: OpenAI GPT-4 Vision via AI SDK
- **Deployment**: Vercel
- **Language**: TypeScript

## Core Functionality
- Photo upload and analysis for pediatric eye health
- AI-powered assessment using OpenAI GPT-4 Vision
- Risk level classification (Low/Medium/High)
- Detailed scientific analysis with medical criteria
- Mobile-first responsive design

## AI Assessment Criteria
The AI analyzes photos for these specific myopia indicators:
1. **Eye Alignment**: Proper alignment vs. strabismus/misalignment
2. **Pupil Response**: Size, shape, and reactivity assessment
3. **Corneal Clarity**: Transparency and surface quality
4. **Squinting/Strain**: Signs of visual effort or discomfort
5. **Overall Eye Health**: General appearance and symmetry

## Code Architecture

### Key Files
- `app/api/assess-eyes/route.ts` - Main AI assessment API endpoint with system prompt
- `components/assessment-results.tsx` - Results display with detailed scientific analysis
- `lib/assessment-service.tsx` - Client-side service with fallback logic
- `app/page.tsx` - Main application interface

### AI Context Location
The primary AI system prompt and medical context is stored in `app/api/assess-eyes/route.ts`. This includes:
- Pediatric focus instructions
- Medical assessment criteria
- Risk level definitions
- Response schema validation

## Development Guidelines

### AI Modifications
- All AI behavior changes should be made in the API route system prompt
- Maintain pediatric focus - reject adult photos
- Use structured responses with Zod schema validation
- Temperature set to 0.3 for consistent medical assessments

### UI/UX Standards
- Mobile-first responsive design
- Use Shadcn/UI components exclusively
- Maintain existing functionality when adding features
- Scientific/medical terminology for credibility
- Clear visual hierarchy with proper contrast

### Error Handling
- Graceful fallback to demo mode when API key unavailable
- Clear user feedback for API failures
- Proper loading states during analysis

## Environment Variables
- `OPENAI_API_KEY` - Required for real AI analysis (server-side only)

## Deployment Notes
- Deployed on Vercel with automatic environment variable integration
- API key must be configured in Vercel project settings
- No client-side API key exposure for security

## Future Enhancements
- Integration with specialized ConvNeXT models for higher accuracy
- Additional medical criteria and assessment parameters
- User account system for tracking assessments over time
- Integration with healthcare providers

## Important Constraints
- **Pediatric Focus**: This is specifically for children's eye health screening
- **Proof of Concept**: Current implementation uses general AI, not specialized medical models
- **Security**: Never expose API keys client-side
- **Medical Disclaimer**: This is a screening tool, not a diagnostic device
