import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const CODE_REVIEW_PROMPT = `You are an expert Solidity and Web3 code reviewer. Analyze the provided code and provide a comprehensive review.

Your review should include:

1. **Security Analysis** (Critical)
   - Identify potential vulnerabilities (reentrancy, overflow, access control issues)
   - Check for common attack vectors
   - Rate severity: Critical, High, Medium, Low, Info

2. **Gas Optimization**
   - Identify unnecessary gas consumption
   - Suggest optimizations
   - Estimate gas savings where possible

3. **Code Quality**
   - Check coding standards and best practices
   - Review naming conventions
   - Assess code organization and modularity

4. **Logic Review**
   - Verify business logic correctness
   - Check edge cases handling
   - Review state management

5. **Recommendations**
   - Provide specific, actionable improvements
   - Include code snippets for fixes when helpful

Format your response as JSON with the following structure:
{
  "summary": "Brief overview of the code quality",
  "score": {
    "security": 0-100,
    "gasEfficiency": 0-100,
    "codeQuality": 0-100,
    "overall": 0-100
  },
  "issues": [
    {
      "severity": "critical|high|medium|low|info",
      "category": "security|gas|quality|logic",
      "title": "Issue title",
      "description": "Detailed description",
      "line": "Line number or range if applicable",
      "suggestion": "How to fix"
    }
  ],
  "highlights": ["Positive aspects of the code"],
  "recommendations": ["General improvement suggestions"]
}
`;

export async function POST(req: Request) {
  try {
    const { code, language = 'solidity', context } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    let prompt = CODE_REVIEW_PROMPT;
    if (context) {
      prompt += `\n\nContext: ${context}`;
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: prompt,
      prompt: `Please review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    });

    // Try to parse as JSON, fallback to raw text
    try {
      const review = JSON.parse(text);
      return NextResponse.json(review);
    } catch {
      // If not valid JSON, return as text
      return NextResponse.json({
        summary: text,
        score: { security: 0, gasEfficiency: 0, codeQuality: 0, overall: 0 },
        issues: [],
        highlights: [],
        recommendations: [],
        rawResponse: true,
      });
    }
  } catch (error) {
    console.error('Code review error:', error);
    return NextResponse.json(
      { error: 'Failed to review code' },
      { status: 500 }
    );
  }
}
