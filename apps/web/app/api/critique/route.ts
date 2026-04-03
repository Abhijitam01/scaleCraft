import Anthropic from '@anthropic-ai/sdk'

interface TopologyPayload {
  template: string
  nodes: string[]
  edges: { source: string; target: string }[]
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }

  const body = await req.json() as { topology: TopologyPayload }
  const { topology } = body

  const nodeList = topology.nodes.filter(n => n !== 'client').join(', ') || 'none'
  const edgeList = topology.edges.map(e => `${e.source} → ${e.target}`).join(', ') || 'none'

  const system = `You are a senior distributed systems engineer doing a quick design review.
Be direct, concrete, and terse — no filler. Reference the specific components by name.
Structure your response exactly like this (no headers, just the text):

One sentence overall verdict.

Strengths: [one concrete strength based on what's placed]
Gap: [the single most important missing piece or bottleneck]
Fix: [one specific action to improve the design]`

  const user = `Review this ${topology.template} system design:
Components placed: ${nodeList}
Connections: ${edgeList}

What's the verdict?`

  const client = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 250,
          system,
          messages: [{ role: 'user', content: user }],
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
