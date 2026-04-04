import type { SimNode, SimEdge, PatternType } from './types'

function getNodeByType(nodes: SimNode[], nodeId: string): SimNode | undefined {
  return nodes.find(n => n.nodeId === nodeId)
}

function getNodesByType(nodes: SimNode[], nodeId: string): SimNode[] {
  return nodes.filter(n => n.nodeId === nodeId)
}

function getTargets(edges: SimEdge[], sourceId: string): SimEdge[] {
  return edges.filter(e => e.source === sourceId)
}

function getSources(edges: SimEdge[], targetId: string): SimEdge[] {
  return edges.filter(e => e.target === targetId)
}

export function detectPatterns(nodes: SimNode[], edges: SimEdge[]): PatternType[] {
  const patterns: PatternType[] = []
  const nodeIdSet = new Set(nodes.map(n => n.nodeId))

  // SPOF: api_server present, no load_balancer and no cdn providing redundancy
  if (
    nodeIdSet.has('api_server') &&
    !nodeIdSet.has('load_balancer') &&
    !nodeIdSet.has('cdn')
  ) {
    patterns.push('single-point-of-failure')
  }

  // Load-balanced cluster: load_balancer points to 2+ api_server nodes
  const lbNode = getNodeByType(nodes, 'load_balancer')
  if (lbNode) {
    const lbTargetIds = new Set(getTargets(edges, lbNode.id).map(e => e.target))
    const apiServers = getNodesByType(nodes, 'api_server')
    const lbToApiCount = apiServers.filter(n => lbTargetIds.has(n.id)).length
    if (lbToApiCount >= 2) {
      patterns.push('load-balanced-cluster')
    }
  }

  // Write-through cache: api_server has edges to both cache and database
  const apiServer = getNodeByType(nodes, 'api_server')
  if (apiServer && nodeIdSet.has('cache') && nodeIdSet.has('database')) {
    const apiTargets = new Set(getTargets(edges, apiServer.id).map(e => {
      const targetNode = nodes.find(n => n.id === e.target)
      return targetNode?.nodeId
    }))
    if (apiTargets.has('cache') && apiTargets.has('database')) {
      patterns.push('write-through-cache')
    }
  }

  // DB replication: database → read_replica edge exists
  const dbNode = getNodeByType(nodes, 'database')
  if (dbNode && nodeIdSet.has('read_replica')) {
    const dbTargets = getTargets(edges, dbNode.id)
    const hasReplicaEdge = dbTargets.some(e => {
      return nodes.find(n => n.id === e.target)?.nodeId === 'read_replica'
    })
    if (hasReplicaEdge) {
      patterns.push('db-replication')
    }
  }

  // CDN origin: cdn node has at least one outgoing edge
  const cdnNode = getNodeByType(nodes, 'cdn')
  if (cdnNode) {
    const cdnTargets = getTargets(edges, cdnNode.id)
    if (cdnTargets.length > 0) {
      patterns.push('cdn-origin')
    }
  }

  // Async message queue: message_queue node present and has worker consuming from it
  if (nodeIdSet.has('message_queue') && nodeIdSet.has('worker')) {
    const mqNode = getNodeByType(nodes, 'message_queue')!
    const mqTargets = getTargets(edges, mqNode.id)
    const hasWorkerTarget = mqTargets.some(e => {
      return nodes.find(n => n.id === e.target)?.nodeId === 'worker'
    })
    if (hasWorkerTarget) {
      patterns.push('async-message-queue')
    }
  }

  // No auth layer: api_server has no api_gateway or rate_limiter upstream
  if (nodeIdSet.has('api_server')) {
    const hasAuthLayer = nodeIdSet.has('api_gateway') || nodeIdSet.has('rate_limiter')
    if (!hasAuthLayer) {
      patterns.push('no-auth-layer')
    }
  }

  // DB fan-out: 3+ different node types point directly to database
  if (dbNode) {
    const incomingEdgeCount = getSources(edges, dbNode.id).length
    if (incomingEdgeCount >= 3) {
      patterns.push('db-fan-out')
    }
  }

  return patterns
}
