# EyePhone API Service - Deployment Requirements

## Overview
This document outlines the requirements needed to deploy and operate the EyePhone Eye Assessment API service for integration with your application.

---

## 1. Required Services & Accounts

### OpenAI API Access
- **Service**: OpenAI Platform Account
- **Purpose**: Powers the AI-driven eye assessment analysis
- **Sign up**: https://platform.openai.com/signup
- **What we need**: 
  - Active OpenAI API account
  - API Key with GPT-4 Vision access
  - Billing enabled on the account

### Hosting Platform
- **Service**: Vercel (Recommended) or similar Node.js hosting
- **Purpose**: Hosts the API service
- **Sign up**: https://vercel.com/signup
- **What we need**:
  - Free or Pro Vercel account
  - Ability to set environment variables
  - Access to deployment settings

---

## 2. API Key Requirements

### OpenAI API Key
- **Cost**: Pay-per-use pricing
  - GPT-4 Vision: ~$0.01-0.05 per image analysis
  - Example: 1,000 assessments/month ≈ $10-50/month
- **Usage Limits**: Set monthly spending limits in OpenAI dashboard
- **Security**: 
  - Must be kept secret (server-side only)
  - Never expose in client-side code
  - Rotate periodically for security

---

## 3. Technical Specifications

### Server Requirements
- **Runtime**: Node.js 18.x or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: ~50MB for application code
- **Bandwidth**: Depends on usage (estimate 2-5MB per request)

### API Specifications
- **Protocol**: HTTPS REST API
- **Request Format**: JSON
- **Image Format**: Base64-encoded images
- **Max Image Size**: 10MB recommended
- **Response Time**: 3-10 seconds per assessment
- **CORS**: Enabled for cross-origin requests

---

## 4. Environment Variables

The following environment variables must be configured in the hosting platform:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional variables:
```
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vite-app.com
```

---

## 5. Cost Estimate

### Monthly Operating Costs

**OpenAI API Usage** (variable):
- Low usage (100 assessments): $1-5/month
- Medium usage (1,000 assessments): $10-50/month  
- High usage (10,000 assessments): $100-500/month

**Hosting (Vercel)**:
- Free tier: $0/month (sufficient for testing/low usage)
- Pro tier: $20/month (recommended for production)

**Total Estimated Monthly Cost**: $20-$520/month depending on usage

---

## 6. Security Requirements

### API Security
- ✅ HTTPS encryption required
- ✅ Environment variables for sensitive keys
- ✅ CORS configuration to limit access
- ✅ Rate limiting recommended for production
- ✅ API key rotation policy

### Data Privacy
- ✅ No image storage (images processed in-memory only)
- ✅ No personal data stored on servers
- ✅ Compliant with HIPAA considerations (consult legal counsel)
- ✅ Clear data retention policy

---

## 7. Integration Requirements

### From Your Vite Application

**API Endpoint**:
```
POST https://your-api-domain.vercel.app/api/assess-eyes
```

**Request Format**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response Format**:
```json
{
  "riskLevel": "Low" | "Medium" | "High",
  "confidence": 85,
  "recommendations": ["Schedule routine checkup", "..."],
  "detailedAnalysis": { ... },
  "technicalMetrics": { ... }
}
```

---

## 8. Deployment Checklist

Before going live, ensure:

- [ ] OpenAI API key obtained and tested
- [ ] Vercel account created and configured
- [ ] Environment variables set in Vercel dashboard
- [ ] API deployed and accessible via HTTPS
- [ ] CORS configured for your Vite app domain
- [ ] Test request from Vite app successful
- [ ] Error handling tested
- [ ] Usage monitoring enabled
- [ ] Spending limits set on OpenAI account
- [ ] Documentation shared with development team

---

## 9. Monitoring & Maintenance

### Required Monitoring
- **API uptime**: Monitor endpoint availability
- **OpenAI usage**: Track API calls and costs
- **Error rates**: Monitor failed requests
- **Response times**: Track performance

### Maintenance Tasks
- Monthly review of OpenAI costs
- Quarterly security audit
- API key rotation (every 90 days recommended)
- Dependency updates

---

## 10. Support & Documentation

### API Documentation
- Complete API guide: See `API_SERVICE_GUIDE.md`
- Integration examples: See `README.md`
- Troubleshooting: See deployment logs in Vercel

### Support Contacts
- OpenAI Support: https://help.openai.com
- Vercel Support: https://vercel.com/support
- Technical questions: [Your contact information]

---

## Questions to Ask Client

1. **What is your expected monthly usage volume?** (helps estimate costs)
2. **Do you have existing OpenAI or Vercel accounts?**
3. **What is your budget for API/hosting costs?**
4. **Do you need HIPAA compliance or special security requirements?**
5. **What domains/URLs will be calling this API?** (for CORS configuration)
6. **Do you need usage analytics or custom reporting?**

---

## Next Steps

1. Client approves requirements and budget
2. Client provides/creates OpenAI API key
3. Client provides/creates Vercel account access
4. Deploy API service to Vercel
5. Configure environment variables
6. Test integration with Vite app
7. Go live

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Contact**: [Your contact information]
