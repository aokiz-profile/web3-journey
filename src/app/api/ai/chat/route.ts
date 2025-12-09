import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const WEB3_SYSTEM_PROMPT = `You are an expert Web3 learning assistant specializing in blockchain development, smart contracts, and decentralized applications. Your role is to help users learn and understand Web3 concepts.

Key areas of expertise:
- Blockchain fundamentals (consensus mechanisms, cryptography, distributed systems)
- Ethereum and EVM-compatible chains
- Solidity smart contract development
- Web3 frontend integration (ethers.js, viem, wagmi)
- DeFi protocols (AMM, lending, staking)
- NFT development (ERC-721, ERC-1155)
- Security best practices and common vulnerabilities
- Layer 2 solutions (Optimism, Arbitrum, zkSync)
- Cross-chain development
- Zero-knowledge proofs

Guidelines:
1. Provide clear, accurate explanations tailored to the user's level
2. Include code examples when helpful (use Solidity or TypeScript)
3. Emphasize security best practices
4. Reference official documentation when appropriate
5. If unsure, acknowledge limitations rather than guessing
6. Keep responses concise but comprehensive
7. Use markdown formatting for better readability

When explaining code:
- Use proper syntax highlighting
- Add comments to explain complex parts
- Mention potential pitfalls or security concerns
`;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Build context-aware system prompt
  let systemPrompt = WEB3_SYSTEM_PROMPT;

  if (context?.moduleId) {
    systemPrompt += `\n\nThe user is currently learning about: ${context.moduleId}. Focus your responses on topics related to this module.`;
  }

  if (context?.topicId) {
    systemPrompt += `\nSpecific topic: ${context.topicId}`;
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
