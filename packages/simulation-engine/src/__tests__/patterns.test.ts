import { describe, it, expect } from 'vitest'
import { detectPatterns } from '../patterns.js'
import type { SimNode, SimEdge } from '../types.js'

function makeNode(id: string, nodeId: string): SimNode {
  return { id, nodeId }
}

function makeEdge(source: string, target: string): SimEdge {
  return { source, target }
}

describe('detectPatterns', () => {
  it('returns empty array for empty graph', () => {
    expect(detectPatterns([], [])).toEqual([])
  })

  it('detects single-point-of-failure when api_server has no LB or CDN', () => {
    const nodes = [makeNode('a1', 'api_server'), makeNode('db1', 'database')]
    const edges = [makeEdge('a1', 'db1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('single-point-of-failure')
  })

  it('does NOT detect SPOF when load_balancer is present', () => {
    const nodes = [makeNode('lb1', 'load_balancer'), makeNode('a1', 'api_server')]
    const edges = [makeEdge('lb1', 'a1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('single-point-of-failure')
  })

  it('does NOT detect SPOF when CDN is present', () => {
    const nodes = [makeNode('cdn1', 'cdn'), makeNode('a1', 'api_server')]
    const edges = [makeEdge('cdn1', 'a1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('single-point-of-failure')
  })

  it('detects load-balanced-cluster when LB points to 2+ api_servers', () => {
    const nodes = [
      makeNode('lb1', 'load_balancer'),
      makeNode('a1', 'api_server'),
      makeNode('a2', 'api_server'),
    ]
    const edges = [makeEdge('lb1', 'a1'), makeEdge('lb1', 'a2')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('load-balanced-cluster')
  })

  it('does NOT detect load-balanced-cluster with only 1 api_server behind LB', () => {
    const nodes = [makeNode('lb1', 'load_balancer'), makeNode('a1', 'api_server')]
    const edges = [makeEdge('lb1', 'a1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('load-balanced-cluster')
  })

  it('detects write-through-cache when api_server connects to both cache and database', () => {
    const nodes = [
      makeNode('a1', 'api_server'),
      makeNode('c1', 'cache'),
      makeNode('db1', 'database'),
    ]
    const edges = [makeEdge('a1', 'c1'), makeEdge('a1', 'db1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('write-through-cache')
  })

  it('does NOT detect write-through-cache when api_server only connects to database', () => {
    const nodes = [
      makeNode('a1', 'api_server'),
      makeNode('c1', 'cache'),
      makeNode('db1', 'database'),
    ]
    const edges = [makeEdge('a1', 'db1')] // no edge to cache
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('write-through-cache')
  })

  it('detects db-replication when database has edge to read_replica', () => {
    const nodes = [makeNode('db1', 'database'), makeNode('rr1', 'read_replica')]
    const edges = [makeEdge('db1', 'rr1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('db-replication')
  })

  it('does NOT detect db-replication without the edge', () => {
    const nodes = [makeNode('db1', 'database'), makeNode('rr1', 'read_replica')]
    const edges: SimEdge[] = [] // nodes present but no replication edge
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('db-replication')
  })

  it('detects cdn-origin when CDN has an outgoing edge', () => {
    const nodes = [makeNode('cdn1', 'cdn'), makeNode('a1', 'api_server')]
    const edges = [makeEdge('cdn1', 'a1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('cdn-origin')
  })

  it('does NOT detect cdn-origin when CDN has no outgoing edges', () => {
    const nodes = [makeNode('cdn1', 'cdn')]
    const edges: SimEdge[] = []
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('cdn-origin')
  })

  it('detects async-message-queue when message_queue → worker edge exists', () => {
    const nodes = [makeNode('mq1', 'message_queue'), makeNode('w1', 'worker')]
    const edges = [makeEdge('mq1', 'w1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('async-message-queue')
  })

  it('does NOT detect async-message-queue without the edge', () => {
    const nodes = [makeNode('mq1', 'message_queue'), makeNode('w1', 'worker')]
    const edges: SimEdge[] = []
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('async-message-queue')
  })

  it('detects no-auth-layer when api_server has no gateway or rate_limiter', () => {
    const nodes = [makeNode('a1', 'api_server')]
    const patterns = detectPatterns(nodes, [])
    expect(patterns).toContain('no-auth-layer')
  })

  it('does NOT detect no-auth-layer when api_gateway is present', () => {
    const nodes = [makeNode('gw1', 'api_gateway'), makeNode('a1', 'api_server')]
    const patterns = detectPatterns(nodes, [])
    expect(patterns).not.toContain('no-auth-layer')
  })

  it('does NOT detect no-auth-layer when rate_limiter is present', () => {
    const nodes = [makeNode('rl1', 'rate_limiter'), makeNode('a1', 'api_server')]
    const patterns = detectPatterns(nodes, [])
    expect(patterns).not.toContain('no-auth-layer')
  })

  it('detects db-fan-out when 3+ nodes point to database', () => {
    const nodes = [
      makeNode('a1', 'api_server'),
      makeNode('w1', 'worker'),
      makeNode('s1', 'server'),
      makeNode('db1', 'database'),
    ]
    const edges = [
      makeEdge('a1', 'db1'),
      makeEdge('w1', 'db1'),
      makeEdge('s1', 'db1'),
    ]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).toContain('db-fan-out')
  })

  it('does NOT detect db-fan-out with only 2 connections to database', () => {
    const nodes = [
      makeNode('a1', 'api_server'),
      makeNode('w1', 'worker'),
      makeNode('db1', 'database'),
    ]
    const edges = [makeEdge('a1', 'db1'), makeEdge('w1', 'db1')]
    const patterns = detectPatterns(nodes, edges)
    expect(patterns).not.toContain('db-fan-out')
  })

  it('detects no patterns for monitoring-only graph', () => {
    const nodes = [makeNode('m1', 'monitoring')]
    const patterns = detectPatterns(nodes, [])
    expect(patterns).toEqual([])
  })
})
