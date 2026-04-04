import Anthropic from '@anthropic-ai/sdk'

interface TopologyPayload {
  template: string
  nodes: string[]
  edges: { source: string; target: string }[]
}

const SYSTEM_PROMPT = `You are an expert distributed systems engineer doing a quick architecture review.
Analyze the system design and return ONLY valid JSON in this exact shape:
{
  "criticalFlaw": "One sentence describing the most critical architectural problem, or null if none",
  "improvements": ["Specific actionable improvement", "Another specific improvement"],
  "positiveObservation": "One sentence about what the architect did well, or null"
}

Rules:
- criticalFlaw: the single most important problem (SPOF, missing cache, no rate limiting, etc.) — null if design is solid
- improvements: 2-3 concrete, specific actions using real component names and numbers
- positiveObservation: genuine strength of the design — not generic praise
- Use real capacity numbers when relevant (e.g. "Redis handles 100k ops/sec vs DB's 5k")
- Be direct. No filler words. No preamble. Return only the JSON object.`

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }

  const body = await req.json() as { topology: TopologyPayload }
  const { topology } = body

  const nodeList = topology.nodes.filter(n => n !== 'client').join(', ') || 'none'
  const edgeList = topology.edges.map(e => `${e.source} → ${e.target}`).join(', ') || 'none'

  const userMessage = `Review this system design:
Components: ${nodeList}
Connections: ${edgeList}

Return only the JSON critique.`

  const client = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          temperature: 0.3,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
